import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import { fetch } from 'undici';
import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import { toJSONSchema, type ZodTypeAny } from 'zod';
import {
  getCuratedReadToolName,
  getCuratedWriteToolName,
} from '../src/core/generatedToolOverrides.js';
import { buildGeneratedToolDescription } from '../src/core/generatedToolDescriptions.js';
import {
  GENERATED_READ_SKIP_IDS,
  GENERATED_WRITE_SKIP_IDS,
} from '../src/core/generatedToolSkips.js';
import { registerAuthTools } from '../src/tools/auth.js';
import { registerCacheTools } from '../src/tools/cache.js';
import { registerCuratedAvatarTools } from '../src/tools/curated/avatars.js';
import { registerCuratedEventTools } from '../src/tools/curated/events.js';
import { registerCuratedFavoriteTools } from '../src/tools/curated/favorites.js';
import { registerCuratedFriendTools } from '../src/tools/curated/friends.js';
import { registerCuratedGroupTools } from '../src/tools/curated/groups.js';
import { registerCuratedInstanceTools } from '../src/tools/curated/instances.js';
import { registerCuratedInviteTools } from '../src/tools/curated/invites.js';
import { registerCuratedNotificationTools } from '../src/tools/curated/notifications.js';
import { registerCuratedStatusTools } from '../src/tools/curated/status.js';
import { registerCuratedUserTools } from '../src/tools/curated/users.js';
import { registerCuratedVrcxTools } from '../src/tools/curated/vrcx/index.js';
import { registerCuratedWorldTools } from '../src/tools/curated/worlds.js';
import { registerRawTools } from '../src/tools/raw.js';
import { registerSystemReadTools } from '../src/tools/read/system.js';
import { toolName } from '../src/utils/toolNames.js';
import {
  GeneratedReadToolInputSchema,
  GeneratedReadToolOutputSchema,
} from '../src/schemas/read.js';
import {
  GeneratedWriteToolInputSchema,
  GeneratedWriteToolOutputSchema,
} from '../src/schemas/write.js';

const SPEC_PATH = process.env.VRCHAT_MCP_SPEC_PATH ?? 'specs/vrchat-openapi.yaml';
const SPEC_URL = process.env.VRCHAT_MCP_SPEC_URL ?? 'https://vrchat.community/openapi.yaml';
const OUTPUT_PATH = 'docs/tools.md';

type ToolEntry = {
  name: string;
  description?: string;
  annotations?: ToolAnnotations;
  inputSchema?: ZodTypeAny;
  outputSchema?: ZodTypeAny;
  category: string;
};

class ToolCollector {
  tools: ToolEntry[] = [];

  createServer(category: string) {
    return {
      registerTool: (
        name: string,
        config: {
          description?: string;
          annotations?: ToolAnnotations;
          inputSchema?: ZodTypeAny;
          outputSchema?: ZodTypeAny;
        }
      ) => {
        this.tools.push({
          name,
          description: config.description,
          annotations: config.annotations,
          inputSchema: config.inputSchema,
          outputSchema: config.outputSchema,
          category,
        });
      },
    };
  }
}

async function loadSpecText() {
  try {
    return await fs.readFile(SPEC_PATH, 'utf8');
  } catch {
    const res = await fetch(SPEC_URL);
    if (!res.ok) {
      throw new Error(`Failed to fetch spec (${res.status}) from ${SPEC_URL}`);
    }
    const text = await res.text();
    await fs.mkdir(path.dirname(SPEC_PATH), { recursive: true });
    await fs.writeFile(SPEC_PATH, text, 'utf8');
    return text;
  }
}

function formatAnnotations(annotations?: ToolAnnotations): string {
  if (!annotations) return '';
  const tags: string[] = [];
  if (annotations.readOnlyHint === true) tags.push('read-only');
  if (annotations.readOnlyHint === false) tags.push('write');
  if (annotations.destructiveHint) tags.push('destructive');
  if (annotations.openWorldHint) tags.push('open-world');
  return tags.length ? ` (${tags.join(', ')})` : '';
}

function toAscii(value: string): string {
  return value.replace(/[\u2012\u2013\u2014\u2015]/g, '-').replace(/[^\x20-\x7E]/g, '');
}

function buildGeneratedList(spec: any) {
  const readSkip = new Set<string>(GENERATED_READ_SKIP_IDS);
  const writeSkip = new Set<string>(GENERATED_WRITE_SKIP_IDS);
  const readOps: {
    operationId: string;
    method: string;
    path: string;
    description: string;
    toolName: string;
  }[] = [];
  const writeOps: {
    operationId: string;
    method: string;
    path: string;
    description: string;
    toolName: string;
  }[] = [];
  const deleteOps: {
    operationId: string;
    method: string;
    path: string;
    description: string;
    toolName: string;
  }[] = [];

  for (const [pathKey, pathItem] of Object.entries(spec.paths ?? {})) {
    for (const [method, op] of Object.entries<any>(pathItem ?? {})) {
      if (!op?.operationId) continue;
      const operationId = String(op.operationId);
      if (method.toLowerCase() === 'get') {
        const curated = getCuratedReadToolName(operationId);
        if (readSkip.has(operationId) || curated) continue;
        readOps.push({
          operationId,
          method: method.toUpperCase(),
          path: String(pathKey),
          description: toAscii(buildGeneratedToolDescription('read', operationId, op)),
          toolName: toolName('vrchat.read'),
        });
      } else if (method.toLowerCase() === 'delete') {
        if (writeSkip.has(operationId) || getCuratedWriteToolName(operationId)) continue;
        deleteOps.push({
          operationId,
          method: method.toUpperCase(),
          path: String(pathKey),
          description: toAscii(buildGeneratedToolDescription('write', operationId, op)),
          toolName: toolName('vrchat.delete'),
        });
      } else {
        if (writeSkip.has(operationId) || getCuratedWriteToolName(operationId)) continue;
        writeOps.push({
          operationId,
          method: method.toUpperCase(),
          path: String(pathKey),
          description: toAscii(buildGeneratedToolDescription('write', operationId, op)),
          toolName: toolName('vrchat.write'),
        });
      }
    }
  }

  readOps.sort((a, b) => a.operationId.localeCompare(b.operationId));
  writeOps.sort((a, b) => a.operationId.localeCompare(b.operationId));
  deleteOps.sort((a, b) => a.operationId.localeCompare(b.operationId));
  return { readOps, writeOps, deleteOps };
}

function renderToolList(entries: ToolEntry[]) {
  const sorted = [...entries].sort((a, b) => a.name.localeCompare(b.name));
  let out = '';
  for (const entry of sorted) {
    const suffix = formatAnnotations(entry.annotations);
    const desc = entry.description ? ` - ${toAscii(entry.description)}${suffix}` : suffix;
    out += `### ${entry.name}\n`;
    if (desc.trim()) {
      out += `${desc.replace(/^ - /, '')}\n\n`;
    } else {
      out += '\n';
    }
    if (entry.inputSchema) {
      out += `Input schema:\n\n\`\`\`json\n${JSON.stringify(toJSONSchema(entry.inputSchema), null, 2)}\n\`\`\`\n\n`;
    }
    if (entry.outputSchema) {
      out += `Output schema:\n\n\`\`\`json\n${JSON.stringify(toJSONSchema(entry.outputSchema), null, 2)}\n\`\`\`\n\n`;
    }
  }
  return out;
}

async function main() {
  const specText = await loadSpecText();
  const spec = YAML.parse(specText);
  const info = spec.info ?? {};

  const collector = new ToolCollector();
  registerCuratedAvatarTools(collector.createServer('curated'));
  registerCuratedFriendTools(collector.createServer('curated'));
  registerCuratedEventTools(collector.createServer('curated'));
  registerCuratedFavoriteTools(collector.createServer('curated'));
  registerCuratedGroupTools(collector.createServer('curated'));
  registerCuratedInstanceTools(collector.createServer('curated'));
  registerCuratedInviteTools(collector.createServer('curated'));
  registerCuratedNotificationTools(collector.createServer('curated'));
  registerCuratedStatusTools(collector.createServer('curated'));
  registerCuratedUserTools(collector.createServer('curated'));
  registerCuratedWorldTools(collector.createServer('curated'));
  registerCuratedVrcxTools(collector.createServer('curated'));
  registerCacheTools(collector.createServer('cache'));
  registerSystemReadTools(collector.createServer('system'));
  registerAuthTools(collector.createServer('auth'));
  registerRawTools(collector.createServer('raw'));

  const curated = collector.tools.filter((tool) => tool.category === 'curated');
  const cache = collector.tools.filter((tool) => tool.category === 'cache');
  const system = collector.tools.filter((tool) => tool.category === 'system');
  const auth = collector.tools.filter((tool) => tool.category === 'auth');
  const raw = collector.tools.filter((tool) => tool.category === 'raw');

  const { readOps, writeOps, deleteOps } = buildGeneratedList(spec);

  const now = new Date().toISOString();
  const specTitle = typeof info.title === 'string' ? toAscii(info.title) : 'VRChat API';
  const specVersion = typeof info.version === 'string' ? toAscii(info.version) : 'unknown';

  let md = '# Tool Catalog (generated)\n\n';
  md += `Generated: ${now}\n\n`;
  md += `Spec: ${specTitle} (${specVersion})\n\n`;
  md +=
    'This file is generated without starting the MCP server. It reflects curated tools plus the auto-generated tool catalog (curated read/write replacements are omitted).\n\n';

  md += '## Curated tools\n';
  md += renderToolList(curated) || '- (none)\n';
  md += '\n';

  md += '## Cache tools\n';
  md += renderToolList(cache) || '- (none)\n';
  md += '\n';

  md += '## System tools\n';
  md += renderToolList(system) || '- (none)\n';
  md += '\n';

  md += '## Auth tools\n';
  md += renderToolList(auth) || '- (none)\n';
  md += '\n';

  md += '## Optional raw tool\n';
  md += renderToolList(raw) || '- (none)\n';
  md += '\n';

  md += '## Auto-generated read router (GET operations)\n';
  md +=
    'Use `vrchat_read` with `operationId` plus OpenAPI path/query/header/cookie values under `params`. Use `vrchat_operations` to discover operationIds and `vrchat_operation_details` for exact per-operation parameter schemas.\n';
  md += 'Generated read input schema:\n\n';
  md += `\`\`\`json\n${JSON.stringify(toJSONSchema(GeneratedReadToolInputSchema), null, 2)}\n\`\`\`\n\n`;
  md +=
    'Generated output uses a compact envelope; exact API response content is under `data` and optional metadata may be present when requested:\n\n';
  md += `\`\`\`json\n${JSON.stringify(toJSONSchema(GeneratedReadToolOutputSchema), null, 2)}\n\`\`\`\n\n`;
  for (const op of readOps) {
    md += `- \`${op.operationId}\` via \`${op.toolName}\` (${op.method} ${op.path}) - ${op.description}\n`;
  }
  md += '\n';

  md += '## Auto-generated write router (POST/PUT/PATCH operations)\n';
  md +=
    'Use `vrchat_write` with `operationId`, OpenAPI path/query/header/cookie values under `params`, and JSON payloads under `body`. Use `vrchat_operations` to discover operationIds and `vrchat_operation_details` for exact per-operation parameter and body schemas. Set `writes.allow = false` for read-only mode.\n';
  md += 'Generated write input schema:\n\n';
  md += `\`\`\`json\n${JSON.stringify(toJSONSchema(GeneratedWriteToolInputSchema), null, 2)}\n\`\`\`\n\n`;
  md +=
    'Generated output uses a compact envelope; exact API response content is under `data` and optional metadata may be present when requested:\n\n';
  md += `\`\`\`json\n${JSON.stringify(toJSONSchema(GeneratedWriteToolOutputSchema), null, 2)}\n\`\`\`\n\n`;
  for (const op of writeOps) {
    md += `- \`${op.operationId}\` via \`${op.toolName}\` (${op.method} ${op.path}) - ${op.description}\n`;
  }
  md += '\n';

  md += '## Auto-generated delete router (DELETE operations)\n';
  md +=
    'Use `vrchat_delete` with `operationId`, OpenAPI path/query/header/cookie values under `params`, and optional JSON payloads under `body`. This router is annotated destructive. Use `vrchat_operations` to discover operationIds and `vrchat_operation_details` for exact per-operation schemas.\n';
  md += 'Generated delete input schema:\n\n';
  md += `\`\`\`json\n${JSON.stringify(toJSONSchema(GeneratedWriteToolInputSchema), null, 2)}\n\`\`\`\n\n`;
  md +=
    'Generated output uses a compact envelope; exact API response content is under `data` and optional metadata may be present when requested:\n\n';
  md += `\`\`\`json\n${JSON.stringify(toJSONSchema(GeneratedWriteToolOutputSchema), null, 2)}\n\`\`\`\n\n`;
  for (const op of deleteOps) {
    md += `- \`${op.operationId}\` via \`${op.toolName}\` (${op.method} ${op.path}) - ${op.description}\n`;
  }

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, md, 'utf8');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
