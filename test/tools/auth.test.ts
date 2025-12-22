import { describe, it, expect, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakeServer } from '../helpers/fake-server.js';

vi.mock('../../src/auth/index.js', () => ({
  authManager: {
    startLoginServer: vi.fn(),
    getStatus: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock('../../src/services/cache.js', () => ({
  cacheManager: { invalidateAll: vi.fn() },
}));

import { registerAuthTools } from '../../src/tools/auth.js';
import { authManager } from '../../src/auth/index.js';
import { cacheManager } from '../../src/services/cache.js';

describe('auth tools', () => {
  it('registers and executes auth handlers', async () => {
    const server = new FakeServer();
    registerAuthTools(server as unknown as McpServer);

    vi.spyOn(authManager, 'startLoginServer').mockResolvedValue({
      url: 'http://localhost/login',
      token: 'tok',
    });
    vi.spyOn(authManager, 'getStatus').mockReturnValue({ loggedIn: false });
    vi.spyOn(authManager, 'logout').mockResolvedValue(undefined);
    const invalidateSpy = vi.spyOn(cacheManager, 'invalidateAll').mockReturnValue(0);

    const begin = server.tools.find((tool) => tool.name === 'vrchat_auth_begin');
    const status = server.tools.find((tool) => tool.name === 'vrchat_auth_status');
    const logoutTool = server.tools.find((tool) => tool.name === 'vrchat_auth_logout');

    const beginResult = await begin!.handler({});
    expect(beginResult).toMatchObject({ structuredContent: { url: 'http://localhost/login', token: 'tok' } });

    const statusResult = status!.handler({});
    expect(statusResult).toMatchObject({ structuredContent: { loggedIn: false } });

    const logoutResult = await logoutTool!.handler({});
    expect(logoutResult).toMatchObject({ structuredContent: { loggedIn: false } });
    expect(invalidateSpy).toHaveBeenCalledTimes(1);
  });
});
