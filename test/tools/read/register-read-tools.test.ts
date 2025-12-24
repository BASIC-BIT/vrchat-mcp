import { describe, it, expect } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakeServer } from '../../helpers/fake-server.js';
import { registerSystemReadTools } from '../../../src/tools/read/system.js';

describe('read tool registration modules', () => {
  it('registers expected read tools', () => {
    const server = new FakeServer();
    const cast = server as unknown as McpServer;

    registerSystemReadTools(cast);

    const names = server.tools.map((tool) => tool.name);
    const required = [
      'vrchat_config_get',
      'vrchat_system_time',
    ];

    for (const name of required) {
      expect(names).toContain(name);
    }
  });
});
