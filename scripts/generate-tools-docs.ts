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
import {
  GENERATED_READ_SKIP_IDS,
  GENERATED_WRITE_SKIP_IDS,
} from '../src/core/generatedToolSkips.js';
import { registerAuthTools } from '../src/tools/auth.js';
import { registerCacheTools } from '../src/tools/cache.js';
import { registerCuratedAvatarTools } from '../src/tools/curated/avatars.js';
import { registerCuratedEventTools } from '../src/tools/curated/events.js';
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
import { registerVrctlAuthTools } from '../src/tools/vrctlAuth.js';
import { registerVrctlEventTools } from '../src/tools/vrctlEvents.js';
import { registerVrctlMetadataTools } from '../src/tools/vrctlMetadata.js';
import { registerVrctlOrganizerTools } from '../src/tools/vrctlOrganizers.js';
import { readToolName, writeToolName } from '../src/utils/toolNames.js';
import { ReadOptionsSchema, ReadToolOutputSchema } from '../src/schemas/read.js';
import { WriteOptionsSchema, WriteToolOutputSchema } from '../src/schemas/write.js';

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
    summary: string;
    toolName: string;
    curated?: string;
  }[] = [];
  const writeOps: {
    operationId: string;
    method: string;
    path: string;
    summary: string;
    toolName: string;
    curated?: string;
  }[] = [];

  for (const [pathKey, pathItem] of Object.entries(spec.paths ?? {})) {
    for (const [method, op] of Object.entries<any>(pathItem ?? {})) {
      if (!op?.operationId) continue;
      const operationId = String(op.operationId);
      const summaryRaw = op.summary ?? op.description ?? '';
      const summary = toAscii(String(summaryRaw).split('\n')[0].trim());
      if (method.toLowerCase() === 'get') {
        const curated = getCuratedReadToolName(operationId);
        if (readSkip.has(operationId)) continue;
        readOps.push({
          operationId,
          method: method.toUpperCase(),
          path: String(pathKey),
          summary,
          toolName: readToolName(operationId),
          curated,
        });
      } else {
        const curated = getCuratedWriteToolName(operationId);
        if (writeSkip.has(operationId)) continue;
        writeOps.push({
          operationId,
          method: method.toUpperCase(),
          path: String(pathKey),
          summary,
          toolName: writeToolName(operationId),
          curated,
        });
      }
    }
  }

  readOps.sort((a, b) => a.operationId.localeCompare(b.operationId));
  writeOps.sort((a, b) => a.operationId.localeCompare(b.operationId));
  return { readOps, writeOps };
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
  registerVrctlAuthTools(collector.createServer('vrctl-auth'));
  registerVrctlMetadataTools(collector.createServer('vrctl'));
  registerVrctlEventTools(collector.createServer('vrctl'));
  registerVrctlOrganizerTools(collector.createServer('vrctl'));
  registerRawTools(collector.createServer('raw'));

  const curated = collector.tools.filter((tool) => tool.category === 'curated');
  const cache = collector.tools.filter((tool) => tool.category === 'cache');
  const system = collector.tools.filter((tool) => tool.category === 'system');
  const auth = collector.tools.filter((tool) => tool.category === 'auth');
  const vrctlAuth = collector.tools.filter((tool) => tool.category === 'vrctl-auth');
  const vrctl = collector.tools.filter((tool) => tool.category === 'vrctl');
  const raw = collector.tools.filter((tool) => tool.category === 'raw');

  const { readOps, writeOps } = buildGeneratedList(spec);

  const now = new Date().toISOString();
  const specTitle = typeof info.title === 'string' ? toAscii(info.title) : 'VRChat API';
  const specVersion = typeof info.version === 'string' ? toAscii(info.version) : 'unknown';

  let md = '# Tool Catalog (generated)\n\n';
  md += `Generated: ${now}\n\n`;
  md += `Spec: ${specTitle} (${specVersion})\n\n`;
  md +=
    'This file is generated without starting the MCP server. It reflects curated tools plus all possible auto-generated tools that are exposed (curated replacements are omitted).\n\n';

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

  md += '## VRC.TL auth tools\n';
  md += renderToolList(vrctlAuth) || '- (none)\n';
  md += '\n';

  md += '## VRC.TL tools\n';
  md += renderToolList(vrctl) || '- (none)\n';
  md += '\n';

  md += '## Optional raw tool\n';
  md += renderToolList(raw) || '- (none)\n';
  md += '\n';

  md += '## Auto-generated read tools (GET operations)\n';
  md +=
    'Input schemas are derived per operation from OpenAPI parameters (path/query/header/cookie).\n';
  md += 'Read options are shared across read tools:\n\n';
  md += `\`\`\`json\n${JSON.stringify(toJSONSchema(ReadOptionsSchema), null, 2)}\n\`\`\`\n\n`;
  md += `Output schema:\n\n\`\`\`json\n${JSON.stringify(toJSONSchema(ReadToolOutputSchema), null, 2)}\n\`\`\`\n\n`;
  for (const op of readOps) {
    const summary = op.summary ? ` - ${toAscii(op.summary)}` : '';
    const curated = op.curated ? ` (curated: ${op.curated})` : '';
    md += `- \`${op.toolName}\` (${op.method} ${op.path})${summary}${curated}\n`;
  }
  md += '\n';

  md += '## Auto-generated write tools (non-GET operations)\n';
  md +=
    'Input schemas are derived per operation from OpenAPI parameters and request bodies (writes still require `writes.allow = true`).\n';
  md += 'Write options are shared across write tools:\n\n';
  md += `\`\`\`json\n${JSON.stringify(toJSONSchema(WriteOptionsSchema), null, 2)}\n\`\`\`\n\n`;
  md += `Output schema:\n\n\`\`\`json\n${JSON.stringify(toJSONSchema(WriteToolOutputSchema), null, 2)}\n\`\`\`\n\n`;
  for (const op of writeOps) {
    const summary = op.summary ? ` - ${toAscii(op.summary)}` : '';
    const curated = op.curated ? ` (curated: ${op.curated})` : '';
    md += `- \`${op.toolName}\` (${op.method} ${op.path})${summary}${curated}\n`;
  }

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, md, 'utf8');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
