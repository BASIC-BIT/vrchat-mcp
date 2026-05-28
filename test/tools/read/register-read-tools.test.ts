import { afterEach, beforeEach, describe, it, expect } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import path from 'node:path';
import { FakeServer } from '../../helpers/fake-server.js';
import { registerSystemReadTools } from '../../../src/tools/read/system.js';
import { clearSpecCache } from '../../../src/core/spec.js';

const fixtureSpecPath = path.join(process.cwd(), 'test', 'fixtures', 'spec.yaml');

describe('read tool registration modules', () => {
  const prevSpec = process.env.VRCHAT_MCP_SPEC_URL;

  beforeEach(() => {
    process.env.VRCHAT_MCP_SPEC_URL = fixtureSpecPath;
    clearSpecCache();
  });

  afterEach(() => {
    if (prevSpec === undefined) {
      delete process.env.VRCHAT_MCP_SPEC_URL;
    } else {
      process.env.VRCHAT_MCP_SPEC_URL = prevSpec;
    }
    clearSpecCache();
  });

  it('registers expected read tools', () => {
    const server = new FakeServer();
    const cast = server as unknown as McpServer;

    registerSystemReadTools(cast);

    const names = server.tools.map((tool) => tool.name);
    const required = ['vrchat_config_get', 'vrchat_operation_details', 'vrchat_system_time'];

    for (const name of required) {
      expect(names).toContain(name);
    }
  });

  it('returns operation details from the support tool', async () => {
    const server = new FakeServer();
    registerSystemReadTools(server as unknown as McpServer);

    const tool = server.tools.find((entry) => entry.name === 'vrchat_operation_details');
    expect(tool).toBeDefined();

    const response = (await Promise.resolve(tool!.handler({ operationId: 'getUser' }))) as {
      structuredContent?: { path?: string; parameters?: unknown[] };
    };

    expect(response.structuredContent?.path).toBe('/users/{userId}');
    expect(response.structuredContent?.generatedToolStatus).toBe('curated_replacement');
    expect(response.structuredContent?.parameters).toEqual([
      expect.objectContaining({ name: 'userId', in: 'path', required: true }),
    ]);
  });
});
