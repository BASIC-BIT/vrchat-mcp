import { describe, it, expect, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerCuratedUserTools } from '../../../src/tools/curated/users.js';
import { FakeServer } from '../../helpers/fake-server.js';

vi.mock('../../../src/services/users/index.js', () => ({
  resolveUserProfile: vi.fn(),
  resolveUserId: vi.fn(),
  listUserGroups: vi.fn(),
}));

vi.mock('../../../src/core/readTools.js', () => ({
  shapeReadData: vi.fn((value: unknown) => value),
}));

import { listUserGroups, resolveUserId, resolveUserProfile } from '../../../src/services/users/index.js';

describe('curated user tools', () => {
  it('returns user groups with pagination meta', async () => {
    vi.mocked(resolveUserId).mockResolvedValue({ ok: true, userId: 'usr_1' });
    vi.mocked(listUserGroups).mockResolvedValue({
      userId: 'usr_1',
      pageSize: 100,
      maxPages: 100,
      totalGroups: 1,
      truncated: false,
      stale: false,
      page: { pages: 1, items: 1, pageSize: 100, offsetStart: 0, truncated: false },
      groups: [{ groupId: 'grp_1', name: 'Group One' }],
    });

    const server = new FakeServer();
    registerCuratedUserTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_user_groups');
    const result = await tool!.handler({ userId: 'usr_1' });

    expect(result).toMatchObject({
      structuredContent: {
        userId: 'usr_1',
        totalGroups: 1,
        groups: [{ groupId: 'grp_1', name: 'Group One' }],
      },
    });
  });

  it('includes groups in user profile when requested', async () => {
    vi.mocked(resolveUserProfile).mockResolvedValue({
      ok: true,
      user: { id: 'usr_1', displayName: 'Tester' },
      userId: 'usr_1',
    });
    vi.mocked(listUserGroups).mockResolvedValue({
      userId: 'usr_1',
      pageSize: 100,
      maxPages: 100,
      totalGroups: 1,
      truncated: false,
      stale: false,
      page: { pages: 1, items: 1, pageSize: 100, offsetStart: 0, truncated: false },
      groups: [{ groupId: 'grp_1', name: 'Group One' }],
    });

    const server = new FakeServer();
    registerCuratedUserTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_user_profile');
    const result = await tool!.handler({ userId: 'usr_1', includeGroups: true });

    expect(result).toMatchObject({
      structuredContent: {
        userId: 'usr_1',
        user: { id: 'usr_1', displayName: 'Tester' },
        groups: {
          userId: 'usr_1',
          totalGroups: 1,
          groups: [{ groupId: 'grp_1', name: 'Group One' }],
        },
      },
    });
  });

  it('returns tool error when profile resolution fails', async () => {
    vi.mocked(resolveUserProfile).mockResolvedValue({
      ok: false,
      reason: 'User not found',
    });

    const server = new FakeServer();
    registerCuratedUserTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_user_profile');
    const result = await tool!.handler({ userId: 'usr_missing' });

    expect(result).toMatchObject({
      isError: true,
      structuredContent: { error: 'User not found' },
    });
  });

  it('returns tool error when user group resolution fails', async () => {
    vi.mocked(resolveUserId).mockResolvedValue({
      ok: false,
      reason: 'Missing user',
    });

    const server = new FakeServer();
    registerCuratedUserTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_user_groups');
    const result = await tool!.handler({ userId: 'usr_missing' });

    expect(result).toMatchObject({
      isError: true,
      structuredContent: { error: 'Missing user' },
    });
  });
});
