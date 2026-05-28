import { appendFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import { toJSONSchema, type ZodTypeAny } from 'zod';

const DEFAULT_MAX_ESTIMATED_TOKENS = 160_000;
const DEFAULT_MAX_TOOL_DESCRIPTION_TOKENS = 8_000;
const DEFAULT_MAX_MISSING_TOOL_DESCRIPTIONS = 0;
const TOP_COUNT = 10;

const CONFIG_ENV_KEYS = [
  'VRCHAT_MCP_CONFIG_FILE',
  'VRCHAT_MCP_API_BASE',
  'VRCHAT_MCP_USER_AGENT',
  'VRCHAT_MCP_SPEC_URL',
  'VRCHAT_MCP_LOG_LEVEL',
  'VRCHAT_MCP_COOKIE_STORE',
  'VRCHAT_MCP_COOKIE_FILE',
  'VRCHAT_MCP_ALLOW_WRITES',
  'VRCHAT_MCP_CACHE_ENABLED',
  'VRCHAT_MCP_PIPELINE_ENABLED',
  'VRCHAT_MCP_GROUP_ALLOWLIST',
  'VRCHAT_MCP_ENABLE_RAW_CALL',
  'VRCHAT_MCP_DISABLE_GENERATED_READ_TOOLS',
  'VRCHAT_MCP_DISABLE_GENERATED_WRITE_TOOLS',
] as const;

interface RegisteredTool {
  name: string;
  config: {
    description?: string;
    inputSchema?: ZodTypeAny;
    outputSchema?: ZodTypeAny;
    annotations?: ToolAnnotations;
  };
}

interface ArgumentEntry {
  path: string;
  description?: string;
}

interface ToolMetric {
  name: string;
  category: string;
  args: number;
  missingArgDescriptions: number;
  toolNameTokens: number;
  toolDescriptionTokens: number;
  inputSchemaTokens: number;
  outputSchemaTokens: number;
  argumentNameTokens: number;
  argumentDescriptionTokens: number;
  inputSchemaStructureTokens: number;
  outputSchemaStructureTokens: number;
  llmInputTokens: number;
  mcpWireTokens: number;
  totalTokens: number;
}

interface CategoryMetric {
  category: string;
  tools: number;
  args: number;
  missingArgDescriptions: number;
  toolNameTokens: number;
  toolDescriptionTokens: number;
  inputSchemaTokens: number;
  outputSchemaTokens: number;
  argumentNameTokens: number;
  argumentDescriptionTokens: number;
  schemaStructureTokens: number;
  llmInputTokens: number;
  mcpWireTokens: number;
  totalTokens: number;
}

interface DuplicateDescriptionMetric {
  description: string;
  count: number;
  tokens: number;
  repeatedTokens: number;
}

interface SchemaFragmentMetric {
  label: string;
  count: number;
  tokens: number;
  repeatedTokens: number;
  examples: string[];
}

class ToolCollector {
  tools: RegisteredTool[] = [];

  registerTool(name: string, config: RegisteredTool['config']): void {
    this.tools.push({ name, config });
  }
}

function resetConfigEnv(): void {
  if (process.env.VRCHAT_MCP_TOOL_BUDGET_USE_ENV === 'true') return;
  for (const key of CONFIG_ENV_KEYS) {
    delete process.env[key];
  }
  const localSpec = path.resolve('specs', 'vrchat-openapi.yaml');
  if (existsSync(localSpec)) {
    process.env.VRCHAT_MCP_SPEC_URL = localSpec;
  }
}

function asNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function estimateTokens(value: string): number {
  if (!value.trim()) return 0;
  return Math.ceil(value.length / 4);
}

function estimateJsonTokens(value: unknown): number {
  return estimateTokens(JSON.stringify(value) ?? '');
}

function normalizeDescription(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function schemaToJson(schema: ZodTypeAny | undefined): unknown {
  if (!schema) return undefined;
  try {
    return toJSONSchema(schema);
  } catch {
    return undefined;
  }
}

function stripSchemaText(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((entry) => stripSchemaText(entry));
  if (!isRecord(value)) return value;

  const out: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (['description', 'title', '$comment', 'default', 'examples'].includes(key)) continue;
    if (key === 'properties' && isRecord(entry)) {
      const properties: Record<string, unknown> = {};
      let index = 0;
      for (const child of Object.values(entry)) {
        index += 1;
        properties[`arg${index}`] = stripSchemaText(child);
      }
      out.properties = properties;
      continue;
    }
    if (key === 'required' && Array.isArray(entry)) {
      out.required = entry.map(() => '*');
      continue;
    }
    out[key] = stripSchemaText(entry);
  }
  return out;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((entry) => canonicalize(entry));
  if (!isRecord(value)) return value;

  const out: Record<string, unknown> = {};
  for (const key of Object.keys(value).sort()) {
    out[key] = canonicalize(value[key]);
  }
  return out;
}

function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalize(value)) ?? '';
}

function describeSchemaFragment(value: unknown): string {
  if (Array.isArray(value)) return `array[${value.length}]`;
  if (!isRecord(value)) return typeof value;
  const description = normalizeDescription(value.description);
  if (description) return description;
  if (isRecord(value.properties)) {
    const keys = Object.keys(value.properties).slice(0, 6).join(',');
    return `object{${keys}${Object.keys(value.properties).length > 6 ? ',...' : ''}}`;
  }
  if (typeof value.type === 'string') return `type=${value.type}`;
  return 'schema object';
}

function collectArguments(
  schema: unknown,
  basePath = '',
  seen = new Set<unknown>()
): ArgumentEntry[] {
  if (!isRecord(schema)) return [];
  if (seen.has(schema)) return [];
  seen.add(schema);

  const entries: ArgumentEntry[] = [];
  const properties = schema.properties;
  if (isRecord(properties)) {
    for (const [name, value] of Object.entries(properties)) {
      if (!isRecord(value)) continue;
      const path = basePath ? `${basePath}.${name}` : name;
      entries.push({ path, description: normalizeDescription(value.description) });
      entries.push(...collectArguments(value, path, seen));
    }
  }

  for (const key of ['items', 'anyOf', 'oneOf', 'allOf'] as const) {
    const value = schema[key];
    if (Array.isArray(value)) {
      for (const entry of value) entries.push(...collectArguments(entry, basePath, seen));
    } else {
      entries.push(...collectArguments(value, basePath, seen));
    }
  }

  return entries;
}

function categorizeTool(name: string): string {
  if (name === 'vrchat_read') return 'generated-read';
  if (name === 'vrchat_write') return 'generated-write';
  if (name === 'vrchat_call') return 'raw';
  if (name.startsWith('vrchat_auth_') || name.startsWith('vrchat_cache_')) return 'support';
  if (name === 'vrchat_operations' || name === 'vrchat_operation_details') return 'support';
  return 'curated';
}

function metricForTool(tool: RegisteredTool): ToolMetric {
  const inputSchema = schemaToJson(tool.config.inputSchema);
  const outputSchema = schemaToJson(tool.config.outputSchema);
  const args = collectArguments(inputSchema);
  const toolNameTokens = estimateTokens(tool.name);
  const toolDescriptionTokens = estimateTokens(tool.config.description ?? '');
  const inputSchemaTokens = estimateJsonTokens(inputSchema);
  const outputSchemaTokens = estimateJsonTokens(outputSchema);
  const argumentNameTokens = estimateTokens(args.map((arg) => arg.path).join('\n'));
  const argumentDescriptionTokens = estimateTokens(
    args.map((arg) => arg.description ?? '').join('\n')
  );
  const inputSchemaStructureTokens = estimateJsonTokens(stripSchemaText(inputSchema));
  const outputSchemaStructureTokens = estimateJsonTokens(stripSchemaText(outputSchema));

  return {
    name: tool.name,
    category: categorizeTool(tool.name),
    args: args.length,
    missingArgDescriptions: args.filter((arg) => !normalizeDescription(arg.description)).length,
    toolNameTokens,
    toolDescriptionTokens,
    inputSchemaTokens,
    outputSchemaTokens,
    argumentNameTokens,
    argumentDescriptionTokens,
    inputSchemaStructureTokens,
    outputSchemaStructureTokens,
    llmInputTokens: toolNameTokens + toolDescriptionTokens + inputSchemaTokens,
    mcpWireTokens: toolNameTokens + toolDescriptionTokens + inputSchemaTokens + outputSchemaTokens,
    totalTokens:
      toolNameTokens +
      toolDescriptionTokens +
      argumentNameTokens +
      argumentDescriptionTokens +
      inputSchemaStructureTokens +
      outputSchemaStructureTokens,
  };
}

function topToolsByTokens(metrics: ToolMetric[]): ToolMetric[] {
  return metrics.sort((a, b) => b.totalTokens - a.totalTokens).slice(0, TOP_COUNT);
}

function summarizeCategories(metrics: ToolMetric[]): CategoryMetric[] {
  const byCategory = new Map<string, CategoryMetric>();
  for (const metric of metrics) {
    const current = byCategory.get(metric.category) ?? {
      category: metric.category,
      tools: 0,
      args: 0,
      missingArgDescriptions: 0,
      toolNameTokens: 0,
      toolDescriptionTokens: 0,
      inputSchemaTokens: 0,
      outputSchemaTokens: 0,
      argumentNameTokens: 0,
      argumentDescriptionTokens: 0,
      schemaStructureTokens: 0,
      llmInputTokens: 0,
      mcpWireTokens: 0,
      totalTokens: 0,
    };
    current.tools += 1;
    current.args += metric.args;
    current.missingArgDescriptions += metric.missingArgDescriptions;
    current.toolNameTokens += metric.toolNameTokens;
    current.toolDescriptionTokens += metric.toolDescriptionTokens;
    current.inputSchemaTokens += metric.inputSchemaTokens;
    current.outputSchemaTokens += metric.outputSchemaTokens;
    current.argumentNameTokens += metric.argumentNameTokens;
    current.argumentDescriptionTokens += metric.argumentDescriptionTokens;
    current.schemaStructureTokens +=
      metric.inputSchemaStructureTokens + metric.outputSchemaStructureTokens;
    current.llmInputTokens += metric.llmInputTokens;
    current.mcpWireTokens += metric.mcpWireTokens;
    current.totalTokens += metric.totalTokens;
    byCategory.set(metric.category, current);
  }
  return [...byCategory.values()].sort((a, b) => b.totalTokens - a.totalTokens);
}

function formatCategories(categories: CategoryMetric[]): string {
  return categories
    .map(
      (category) =>
        `${category.category}:total=${category.totalTokens},llmInput=${category.llmInputTokens},mcpWire=${category.mcpWireTokens},initial=${category.toolNameTokens + category.toolDescriptionTokens},argNames=${category.argumentNameTokens},argDesc=${category.argumentDescriptionTokens},schema=${category.schemaStructureTokens},tools=${category.tools},args=${category.args},missingArgDescriptions=${category.missingArgDescriptions}`
    )
    .join(' | ');
}

function formatTopTools(metrics: ToolMetric[]): string {
  return metrics
    .map(
      (metric) =>
        `${metric.name}:${metric.totalTokens}(llmInput=${metric.llmInputTokens},mcpWire=${metric.mcpWireTokens},name=${metric.toolNameTokens},desc=${metric.toolDescriptionTokens},argNames=${metric.argumentNameTokens},argDesc=${metric.argumentDescriptionTokens},schema=${metric.inputSchemaStructureTokens + metric.outputSchemaStructureTokens})`
    )
    .join(', ');
}

function formatTopSchemaTools(metrics: ToolMetric[]): string {
  return [...metrics]
    .sort((a, b) => b.llmInputTokens - a.llmInputTokens)
    .slice(0, TOP_COUNT)
    .map(
      (metric) =>
        `${metric.name}:${metric.llmInputTokens}(inputSchema=${metric.inputSchemaTokens},outputSchema=${metric.outputSchemaTokens})`
    )
    .join(', ');
}

function topDuplicateDescriptions(args: ArgumentEntry[]): DuplicateDescriptionMetric[] {
  const counts = new Map<string, { description: string; count: number }>();
  for (const arg of args) {
    const description = normalizeDescription(arg.description);
    if (!description) continue;
    const key = description.replace(/\s+/g, ' ').trim().toLowerCase();
    const current = counts.get(key) ?? { description, count: 0 };
    current.count += 1;
    counts.set(key, current);
  }

  return [...counts.values()]
    .filter((entry) => entry.count > 1)
    .map((entry) => {
      const tokens = estimateTokens(entry.description) * entry.count;
      return {
        description: entry.description,
        count: entry.count,
        tokens,
        repeatedTokens: tokens - estimateTokens(entry.description),
      };
    })
    .sort((a, b) => b.repeatedTokens - a.repeatedTokens)
    .slice(0, TOP_COUNT);
}

function shortText(value: string): string {
  return value.length <= 64 ? value : `${value.slice(0, 61).trimEnd()}...`;
}

function formatDuplicateDescriptions(duplicates: DuplicateDescriptionMetric[]): string {
  if (!duplicates.length) return '(none)';
  return duplicates
    .map(
      (entry) =>
        `"${shortText(entry.description)}":count=${entry.count},tokens=${entry.tokens},repeated=${entry.repeatedTokens}`
    )
    .join(' | ');
}

function topRepeatedSchemaFragments(tools: RegisteredTool[]): SchemaFragmentMetric[] {
  const fragments = new Map<
    string,
    { label: string; count: number; tokens: number; examples: Set<string> }
  >();

  function visit(value: unknown, example: string, seen: Set<unknown>): void {
    if (!value || typeof value !== 'object') return;
    if (seen.has(value)) return;
    seen.add(value);

    const json = canonicalJson(value);
    const tokens = estimateTokens(json);
    if (tokens >= 20) {
      const current = fragments.get(json) ?? {
        label: describeSchemaFragment(value),
        count: 0,
        tokens,
        examples: new Set<string>(),
      };
      current.count += 1;
      if (current.examples.size < 3) current.examples.add(example);
      fragments.set(json, current);
    }

    if (Array.isArray(value)) {
      for (const entry of value) visit(entry, example, seen);
      return;
    }
    if (isRecord(value)) {
      for (const entry of Object.values(value)) visit(entry, example, seen);
    }
  }

  for (const tool of tools) {
    visit(schemaToJson(tool.config.inputSchema), `${tool.name}:input`, new Set<unknown>());
    visit(schemaToJson(tool.config.outputSchema), `${tool.name}:output`, new Set<unknown>());
  }

  return [...fragments.values()]
    .filter((entry) => entry.count > 1)
    .map((entry) => ({
      label: entry.label,
      count: entry.count,
      tokens: entry.tokens * entry.count,
      repeatedTokens: entry.tokens * (entry.count - 1),
      examples: [...entry.examples],
    }))
    .sort((a, b) => b.repeatedTokens - a.repeatedTokens)
    .slice(0, TOP_COUNT);
}

function formatSchemaFragments(fragments: SchemaFragmentMetric[]): string {
  if (!fragments.length) return '(none)';
  return fragments
    .map(
      (entry) =>
        `"${shortText(entry.label)}":count=${entry.count},tokens=${entry.tokens},repeated=${entry.repeatedTokens},examples=${entry.examples.join('+')}`
    )
    .join(' | ');
}

async function collectTools(): Promise<RegisteredTool[]> {
  resetConfigEnv();
  const { registerAllTools } = await import('../../src/tools/registerAllTools.js');
  const { resetConfigCacheForTest } = await import('../../src/config/index.js');
  resetConfigCacheForTest();

  const collector = new ToolCollector();
  await registerAllTools(collector as never);
  return collector.tools.sort((a, b) => a.name.localeCompare(b.name));
}

function writeSummary(markdown: string): void {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) return;
  appendFileSync(summaryPath, markdown);
}

async function main(): Promise<void> {
  const tools = await collectTools();
  const metrics = tools.map(metricForTool);
  const categories = summarizeCategories(metrics);
  const allArgs = tools.flatMap((tool) => collectArguments(schemaToJson(tool.config.inputSchema)));

  const missingToolDescriptions = tools.filter(
    (tool) => !normalizeDescription(tool.config.description)
  );
  const missingArgumentDescriptions = allArgs.filter(
    (arg) => !normalizeDescription(arg.description)
  );
  const toolNameTokens = metrics.reduce((total, metric) => total + metric.toolNameTokens, 0);
  const toolDescriptionTokens = metrics.reduce(
    (total, metric) => total + metric.toolDescriptionTokens,
    0
  );
  const argumentNameTokens = metrics.reduce(
    (total, metric) => total + metric.argumentNameTokens,
    0
  );
  const argumentDescriptionTokens = metrics.reduce(
    (total, metric) => total + metric.argumentDescriptionTokens,
    0
  );
  const inputSchemaStructureTokens = metrics.reduce(
    (total, metric) => total + metric.inputSchemaStructureTokens,
    0
  );
  const outputSchemaStructureTokens = metrics.reduce(
    (total, metric) => total + metric.outputSchemaStructureTokens,
    0
  );
  const llmInputTokens = metrics.reduce((total, metric) => total + metric.llmInputTokens, 0);
  const mcpWireTokens = metrics.reduce((total, metric) => total + metric.mcpWireTokens, 0);
  const totalTokens = metrics.reduce((total, metric) => total + metric.totalTokens, 0);
  const maxTokens = asNumber(
    process.env.VRCHAT_MCP_TOOL_BUDGET_MAX_TOKENS,
    DEFAULT_MAX_ESTIMATED_TOKENS
  );
  const maxToolDescriptionTokens = asNumber(
    process.env.VRCHAT_MCP_TOOL_BUDGET_MAX_TOOL_DESCRIPTION_TOKENS,
    DEFAULT_MAX_TOOL_DESCRIPTION_TOKENS
  );
  const maxMissingToolDescriptions = asNumber(
    process.env.VRCHAT_MCP_TOOL_BUDGET_MAX_MISSING_TOOL_DESCRIPTIONS,
    DEFAULT_MAX_MISSING_TOOL_DESCRIPTIONS
  );

  const topTools = topToolsByTokens(metrics);
  const duplicates = topDuplicateDescriptions(allArgs);
  const schemaFragments = topRepeatedSchemaFragments(tools);
  const summary = [
    `tool-budget: tools=${tools.length}, args=${allArgs.length}`,
    `tool-budget: estimatedTokens total=${totalTokens}, llmInput=${llmInputTokens}, mcpWire=${mcpWireTokens}, initialToolList=${toolNameTokens + toolDescriptionTokens}, toolNames=${toolNameTokens}, toolDescriptions=${toolDescriptionTokens}, argumentNames=${argumentNameTokens}, argumentDescriptions=${argumentDescriptionTokens}, inputSchemaStructure=${inputSchemaStructureTokens}, outputSchemaStructure=${outputSchemaStructureTokens}`,
    `tool-budget: categories=${formatCategories(categories)}`,
    `tool-budget: missingDescriptions tools=${missingToolDescriptions.length}, args=${missingArgumentDescriptions.length}`,
    `tool-budget: duplicateArgDescriptions=${formatDuplicateDescriptions(duplicates)}`,
    `tool-budget: repeatedSchemaFragments=${formatSchemaFragments(schemaFragments)}`,
    `tool-budget: topLlmInputTools=${formatTopSchemaTools(metrics)}`,
    `tool-budget: topTools=${formatTopTools(topTools)}`,
  ];

  process.stderr.write(`${summary.join('\n')}\n`);
  writeSummary(`### Tool Metadata Budget\n\n${summary.map((line) => `- ${line}`).join('\n')}\n`);

  if (missingToolDescriptions.length > maxMissingToolDescriptions) {
    process.stderr.write(
      `tool-budget: missing tool descriptions over limit (${missingToolDescriptions.length} > ${maxMissingToolDescriptions})\n`
    );
    process.exitCode = 1;
  }
  if (toolDescriptionTokens > maxToolDescriptionTokens) {
    process.stderr.write(
      `tool-budget: tool name/description tokens over limit (${toolDescriptionTokens} > ${maxToolDescriptionTokens})\n`
    );
    process.exitCode = 1;
  }
  if (totalTokens > maxTokens) {
    process.stderr.write(
      `tool-budget: total metadata tokens over limit (${totalTokens} > ${maxTokens})\n`
    );
    process.exitCode = 1;
  }
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`tool-budget: ${message}\n`);
  process.exitCode = 1;
});
