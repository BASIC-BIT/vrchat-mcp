import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { readToolName } from '../../src/utils/toolNames.js';
import { createMockServer, type MockServer } from '../helpers/mock-server.js';
import { createMcpHarness, type McpHarness } from '../helpers/mcp-harness.js';

const SPEC_PATH = fileURLToPath(new URL('../fixtures/spec.yaml', import.meta.url));

interface SpecParameter {
  name?: string;
  required?: boolean;
  $ref?: string;
}

interface SpecOperation {
  operationId?: string;
  parameters?: SpecParameter[];
}

interface Spec {
  paths: Record<string, Record<string, SpecOperation>>;
  components?: {
    parameters?: Record<string, SpecParameter>;
  };
}

describe('mcp e2e (mock generated tools)', () => {
  let server: MockServer | null = null;
  let harness: McpHarness | null = null;
  let spec: Spec | null = null;

  beforeAll(async () => {
    server = await createMockServer();
    harness = await createMcpHarness({
      env: {
        VRCHAT_MCP_API_BASE: server.baseUrl,
        VRCHAT_MCP_SPEC_URL: SPEC_PATH,
        VRCHAT_MCP_COOKIE_STORE: 'memory',
        VRCHAT_MCP_USER_AGENT: 'vrchat-mcp-e2e',
        VRCHAT_MCP_ALLOW_WRITES: 'false',
      },
    });
    const raw = await readFile(SPEC_PATH, 'utf8');
    spec = YAML.parse(raw) as Spec;
  }, 20000);

  afterAll(async () => {
    if (harness) await harness.close();
    if (server) await server.close();
  }, 20000);

  function getParamValue(name: string): string | number {
    const data = server!.data;
    switch (name) {
      case 'userId':
        return data.users[0].id;
      case 'username':
        return data.users[0].username ?? data.users[0].displayName;
      case 'worldId':
        return data.worlds[0].id;
      case 'instanceId': {
        const key = Object.keys(data.instances)[0];
        const parts = key.split(':');
        return parts[1] ?? 'inst_1';
      }
      case 'shortName':
        return Object.keys(data.instancesByShortName)[0];
      case 'groupId':
        return data.groups[0].id;
      case 'notificationId':
        return data.notifications[0].id;
      case 'avatarId':
        return data.avatars[0].id;
      case 'calendarId':
        return data.calendarGroupEvents[data.groups[0].id][0].id;
      case 'searchTerm':
        return 'Event';
      case 'search':
        return 'Mock';
      case 'messageType':
        return data.inviteMessages[0].messageType;
      case 'slot':
        return data.inviteMessages[0].slot;
      default:
        throw new Error(`Missing fixture for required param: ${name}`);
    }
  }

  function resolveParam(param: SpecParameter): SpecParameter {
    if (param.$ref && spec?.components?.parameters) {
      const key = String(param.$ref).split('/').pop() ?? '';
      return spec.components.parameters[key] ?? {};
    }
    return param;
  }

  function buildParams(params: SpecParameter[] | undefined): Record<string, unknown> {
    const args: Record<string, unknown> = {};
    for (const param of params ?? []) {
      const resolved = resolveParam(param);
      const name = resolved.name;
      if (!name) continue;
      if (resolved.required) {
        args[name] = getParamValue(name);
      }
    }
    return args;
  }

  it('invokes every generated read tool for GET operations', async () => {
    const listed = await harness!.client.listTools();
    const available = new Set((listed.tools ?? []).map((tool) => tool.name));
    const operations: { operationId: string; params?: SpecParameter[] }[] = [];
    for (const pathItem of Object.values(spec!.paths)) {
      for (const [method, op] of Object.entries(pathItem)) {
        if (method.toLowerCase() !== 'get') continue;
        if (!op.operationId) continue;
        operations.push({ operationId: op.operationId, params: op.parameters });
      }
    }

    for (const op of operations) {
      const tool = readToolName(op.operationId);
      if (!available.has(tool)) continue;
      const params = buildParams(op.params);
      const args = Object.keys(params).length ? { params } : {};
      try {
        const result = await harness!.client.callTool({ name: tool, arguments: args });
        const structured = result as {
          isError?: boolean;
          structuredContent?: { data?: unknown; error?: string };
        };
        if (structured.isError) {
          throw new Error(structured.structuredContent?.error ?? 'unknown');
        }
        expect(structured.structuredContent?.data).toBeDefined();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Generated tool ${tool} failed: ${message}`);
      }
    }
  });
});
