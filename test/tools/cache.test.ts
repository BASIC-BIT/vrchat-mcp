import { describe, it, expect } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakeServer } from '../helpers/fake-server.js';
import { cacheManager } from '../../src/services/cache.js';
import { registerCacheTools } from '../../src/tools/cache.js';

describe('cache tool', () => {
  it('validates required args for scoped invalidation', () => {
    const server = new FakeServer();
    registerCacheTools(server as unknown as McpServer);

    const tool = server.tools.find((entry) => entry.name === 'vrchat_cache_invalidate');
    expect(tool).toBeDefined();

    expect(tool!.handler({ scope: 'area' })).toMatchObject({ isError: true });

    expect(tool!.handler({ scope: 'key' })).toMatchObject({ isError: true });
  });

  it('clears cached entries by scope', () => {
    cacheManager.invalidateAll();
    cacheManager.set('alpha', { ok: true }, 1000, ['friends']);
    cacheManager.set('beta', { ok: true }, 1000, ['groups']);

    const server = new FakeServer();
    registerCacheTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_cache_invalidate');

    const areaResult = tool!.handler({ scope: 'area', area: 'friends' }) as {
      structuredContent?: { cleared?: number };
    };
    expect(areaResult.structuredContent?.cleared).toBe(1);

    const allResult = tool!.handler({ scope: 'all' }) as {
      structuredContent?: { cleared?: number };
    };
    expect(typeof allResult.structuredContent?.cleared).toBe('number');
  });
});
