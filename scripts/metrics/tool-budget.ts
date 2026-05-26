import { appendFileSync } from 'node:fs';
import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import { toJSONSchema, type ZodTypeAny } from 'zod';

const DEFAULT_MAX_ESTIMATED_TOKENS = 40_000;
const DEFAULT_MAX_TOOL_DESCRIPTION_TOKENS = 8_000;
const DEFAULT_MAX_MISSING_TOOL_DESCRIPTIONS = 0;

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function collectArguments(schema: unknown, basePath = '', seen = new Set<unknown>()): ArgumentEntry[] {
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

function topToolsByTokens(tools: RegisteredTool[]): { name: string; tokens: number }[] {
  return tools
    .map((tool) => {
      const args = collectArguments(schemaToJson(tool.config.inputSchema));
      const text = [
        tool.name,
        tool.config.description ?? '',
        ...args.flatMap((arg) => [arg.path, arg.description ?? '']),
      ].join('\n');
      return { name: tool.name, tokens: estimateTokens(text) };
    })
    .sort((a, b) => b.tokens - a.tokens)
    .slice(0, 10);
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
  const toolDescriptionText = tools.map((tool) => `${tool.name}\n${tool.config.description ?? ''}`).join('\n');
  const allArgs = tools.flatMap((tool) => collectArguments(schemaToJson(tool.config.inputSchema)));
  const argumentText = allArgs.map((arg) => `${arg.path}\n${arg.description ?? ''}`).join('\n');

  const missingToolDescriptions = tools.filter((tool) => !normalizeDescription(tool.config.description));
  const missingArgumentDescriptions = allArgs.filter((arg) => !normalizeDescription(arg.description));
  const toolDescriptionTokens = estimateTokens(toolDescriptionText);
  const argumentTokens = estimateTokens(argumentText);
  const totalTokens = toolDescriptionTokens + argumentTokens;
  const maxTokens = asNumber(process.env.VRCHAT_MCP_TOOL_BUDGET_MAX_TOKENS, DEFAULT_MAX_ESTIMATED_TOKENS);
  const maxToolDescriptionTokens = asNumber(
    process.env.VRCHAT_MCP_TOOL_BUDGET_MAX_TOOL_DESCRIPTION_TOKENS,
    DEFAULT_MAX_TOOL_DESCRIPTION_TOKENS
  );
  const maxMissingToolDescriptions = asNumber(
    process.env.VRCHAT_MCP_TOOL_BUDGET_MAX_MISSING_TOOL_DESCRIPTIONS,
    DEFAULT_MAX_MISSING_TOOL_DESCRIPTIONS
  );

  const topTools = topToolsByTokens(tools);
  const summary = [
    `tool-budget: tools=${tools.length}, args=${allArgs.length}`,
    `tool-budget: estimatedTokens total=${totalTokens}, toolNamesDescriptions=${toolDescriptionTokens}, argumentNamesDescriptions=${argumentTokens}`,
    `tool-budget: missingDescriptions tools=${missingToolDescriptions.length}, args=${missingArgumentDescriptions.length}`,
    `tool-budget: topTools=${topTools.map((tool) => `${tool.name}:${tool.tokens}`).join(', ')}`,
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
    process.stderr.write(`tool-budget: total metadata tokens over limit (${totalTokens} > ${maxTokens})\n`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`tool-budget: ${message}\n`);
  process.exitCode = 1;
});
