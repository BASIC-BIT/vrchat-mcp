import { describe, it, expect, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerCuratedUserTools } from '../../../src/tools/curated/users.js';
import { DEFAULT_SELF_FIELDS, PRESENCE_SELF_FIELDS } from '../../../src/models/users.js';
import { FakeServer } from '../../helpers/fake-server.js';

vi.mock('../../../src/services/users/index.js', () => ({
  resolveUserProfile: vi.fn(),
  resolveUserId: vi.fn(),
  listUserGroups: vi.fn(),
  updateProfile: vi.fn(),
}));

vi.mock('../../../src/config/index.js', () => ({
  getConfig: vi.fn(() => ({
    vrcx: { enabled: true, databasePath: '', worldDbPath: '' },
  })),
}));

vi.mock('../../../src/services/vrcx/index.js', () => ({
  getVrcxUserMemo: vi.fn().mockResolvedValue({
    ok: false,
    status: 'disabled',
    reason: 'disabled',
  }),
}));

vi.mock('../../../src/core/readTools.js', () => ({
  shapeReadData: vi.fn((value: unknown) => value),
}));

import {
  listUserGroups,
  resolveUserId,
  resolveUserProfile,
  updateProfile,
} from '../../../src/services/users/index.js';
import { shapeReadData } from '../../../src/core/readTools.js';
import { getVrcxUserMemo } from '../../../src/services/vrcx/index.js';

describe('curated user tools', () => {
  it('includes VRCX memo when available', async () => {
    vi.mocked(resolveUserProfile).mockResolvedValue({
      ok: true,
      user: { id: 'usr_1', displayName: 'Tester' },
      userId: 'usr_1',
    });
    vi.mocked(getVrcxUserMemo).mockResolvedValue({
      ok: true,
      userId: 'usr_1',
      editedAt: '2026-01-01T00:00:00.000Z',
      memo: 'hello',
    });

    const server = new FakeServer();
    registerCuratedUserTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_user_profile');
    const result = await tool!.handler({ userId: 'usr_1' });

    expect(result).toMatchObject({
      structuredContent: {
        userId: 'usr_1',
        vrcxMemo: { memo: 'hello' },
      },
    });
  });

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

  it('returns current user profile with default field selection', async () => {
    vi.mocked(resolveUserProfile).mockResolvedValue({
      ok: true,
      user: { id: 'usr_1', displayName: 'Tester', friends: ['usr_2'] },
      userId: 'usr_1',
    });

    const server = new FakeServer();
    registerCuratedUserTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_me');
    const result = await tool!.handler({});

    expect(vi.mocked(shapeReadData)).toHaveBeenCalledWith(
      { id: 'usr_1', displayName: 'Tester', friends: ['usr_2'] },
      expect.objectContaining({ fields: DEFAULT_SELF_FIELDS })
    );
    expect(result).toMatchObject({
      structuredContent: {
        userId: 'usr_1',
        user: { id: 'usr_1', displayName: 'Tester', friends: ['usr_2'] },
      },
    });
  });

  it('uses presence view preset for vrchat_me', async () => {
    vi.mocked(resolveUserProfile).mockResolvedValue({
      ok: true,
      user: { id: 'usr_1', displayName: 'Tester', location: 'wrld_1:inst_1' },
      userId: 'usr_1',
    });

    const server = new FakeServer();
    registerCuratedUserTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_me');
    await tool!.handler({ view: 'presence' });

    expect(vi.mocked(shapeReadData)).toHaveBeenCalledWith(
      { id: 'usr_1', displayName: 'Tester', location: 'wrld_1:inst_1' },
      expect.objectContaining({ fields: PRESENCE_SELF_FIELDS })
    );
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
    });
    const content = (result as { content: { text?: string }[] }).content;
    expect(content[0]?.text).toContain('User not found');
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
    });
    const content = (result as { content: { text?: string }[] }).content;
    expect(content[0]?.text).toContain('Missing user');
  });

  it('updates profile and returns shaped user', async () => {
    vi.mocked(updateProfile).mockResolvedValue({
      userId: 'usr_self',
      user: { id: 'usr_self', bio: 'Hi' },
    });

    const server = new FakeServer();
    registerCuratedUserTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_profile_update');
    const result = await tool!.handler({ bio: 'Hi' });

    expect(vi.mocked(updateProfile)).toHaveBeenCalledWith({ bio: 'Hi' });
    expect(vi.mocked(shapeReadData)).toHaveBeenCalled();
    expect(result).toMatchObject({
      structuredContent: {
        userId: 'usr_self',
        user: { id: 'usr_self', bio: 'Hi' },
      },
    });
  });
});
