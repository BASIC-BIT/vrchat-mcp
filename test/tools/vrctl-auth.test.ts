import { describe, it, expect, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakeServer } from '../helpers/fake-server.js';

vi.mock('../../src/vrctl/auth.js', () => ({
  vrctlAuthManager: {
    startLoginServer: vi.fn(),
    getStatus: vi.fn(),
    verifyStatus: vi.fn(),
    logout: vi.fn(),
  },
}));

import { registerVrctlAuthTools } from '../../src/tools/vrctlAuth.js';
import { vrctlAuthManager } from '../../src/vrctl/auth.js';

describe('vrctl auth tools', () => {
  it('registers and executes vrctl auth handlers', async () => {
    const server = new FakeServer();
    registerVrctlAuthTools(server as unknown as McpServer);

    vi.spyOn(vrctlAuthManager, 'startLoginServer').mockResolvedValue({
      url: 'http://localhost/vrctl-login',
      token: 'tok',
    });
    vi.spyOn(vrctlAuthManager, 'getStatus').mockReturnValue({
      loggedIn: false,
      verified: false,
      hasSessionCookie: false,
    });
    vi.spyOn(vrctlAuthManager, 'verifyStatus').mockResolvedValue({
      loggedIn: true,
      verified: true,
      hasSessionCookie: true,
    });
    vi.spyOn(vrctlAuthManager, 'logout').mockResolvedValue(undefined);

    const begin = server.tools.find((tool) => tool.name === 'vrctl_auth_begin');
    const status = server.tools.find((tool) => tool.name === 'vrctl_auth_status');
    const logoutTool = server.tools.find((tool) => tool.name === 'vrctl_auth_logout');

    const beginResult = await begin!.handler({});
    expect(beginResult).toMatchObject({
      structuredContent: { url: 'http://localhost/vrctl-login', token: 'tok' },
    });

    // Default (verify=false) returns cached status without network call
    const localResult = await status!.handler({});
    expect(localResult).toMatchObject({ structuredContent: { loggedIn: false, verified: false } });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(vrctlAuthManager.verifyStatus).not.toHaveBeenCalled();

    // Explicit verify=true makes network request
    const verifiedResult = await status!.handler({ verify: true });
    expect(verifiedResult).toMatchObject({ structuredContent: { loggedIn: true, verified: true } });

    const logoutResult = await logoutTool!.handler({});
    expect(logoutResult).toMatchObject({ structuredContent: { loggedIn: false } });
  });
});
