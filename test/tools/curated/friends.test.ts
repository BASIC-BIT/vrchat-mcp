import { describe, it, expect, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakeServer } from '../../helpers/fake-server.js';

vi.mock('../../../src/services/friends/index.js', () => ({
  searchFriends: vi.fn(),
  listAllFriends: vi.fn(),
  listOnlineFriends: vi.fn(),
  getFriendsOverview: vi.fn(),
  getFriendLocationDetails: vi.fn(),
}));

vi.mock('../../../src/core/readTools.js', () => ({
  shapeReadData: vi.fn((value: unknown) => value),
}));

import { registerCuratedFriendTools } from '../../../src/tools/curated/friends.js';
import {
  getFriendLocationDetails,
  getFriendsOverview,
  listAllFriends,
  listOnlineFriends,
  searchFriends,
} from '../../../src/services/friends/index.js';

describe('curated friend tools', () => {
  it('returns matches from friends search', async () => {
    vi.mocked(searchFriends).mockResolvedValue({
      query: 'Test',
      includeOffline: true,
      totalFriends: 1,
      matches: [
        { userId: 'u1', displayName: 'Test', matchScore: 100, matchType: 'exact' },
      ],
    });

    const server = new FakeServer();
    registerCuratedFriendTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_friends_search');

    const result = await Promise.resolve(tool!.handler({ query: 'Test' }));
    expect(result).toMatchObject({ structuredContent: { totalFriends: 1 } });
  });

  it('requires a non-empty search query', async () => {
    const server = new FakeServer();
    registerCuratedFriendTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_friends_search');

    const result = await Promise.resolve(tool!.handler({ query: '   ' }));
    expect(result).toMatchObject({ isError: true });
  });

  it('returns all friends with meta', async () => {
    vi.mocked(listAllFriends).mockResolvedValue({
      includeOffline: true,
      pageSize: 100,
      maxPages: 200,
      friends: [{ id: 'u1', displayName: 'Test' }],
      meta: {
        segments: [{ offline: false }],
        truncated: false,
        total: 1,
        stale: false,
      },
    });

    const server = new FakeServer();
    registerCuratedFriendTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_friends_all');

    const result = await Promise.resolve(tool!.handler({}));
    expect(result).toMatchObject({
      structuredContent: { includeOffline: true, totalFriends: 1 },
    });
    expect(listAllFriends).toHaveBeenCalledWith(expect.objectContaining({}));
  });

  it('returns online friends only', async () => {
    vi.mocked(listOnlineFriends).mockResolvedValue({
      pageSize: 100,
      maxPages: 50,
      friends: [{ id: 'u1', displayName: 'Test' }],
      meta: {
        segments: [{ offline: false }],
        truncated: false,
        total: 1,
        stale: false,
      },
    });

    const server = new FakeServer();
    registerCuratedFriendTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_friends_online');

    const result = await Promise.resolve(tool!.handler({}));
    expect(result).toMatchObject({
      structuredContent: { totalFriends: 1 },
    });
    expect(listOnlineFriends).toHaveBeenCalledWith(expect.objectContaining({}));
  });

  it('returns overview counts', async () => {
    vi.mocked(getFriendsOverview).mockResolvedValue({
      includeOffline: true,
      statusFilter: ['active'],
      minInstanceUserCount: 5,
      totalFriends: 2,
      onlineCount: 1,
      offlineCount: 1,
      statusCounts: { active: 1, offline: 1 },
      totals: {
        all: {
          totalFriends: 2,
          onlineCount: 1,
          offlineCount: 1,
          statusCounts: { active: 1, offline: 1 },
        },
        filtered: {
          totalFriends: 2,
          onlineCount: 1,
          offlineCount: 1,
          statusCounts: { active: 1, offline: 1 },
        },
      },
      locations: [
        {
          location: 'wrld_1:inst',
          raw: 'wrld_1:inst',
          type: 'instance',
          worldId: 'wrld_1',
          instanceId: 'inst',
          friendCount: 1,
          friends: [{ displayName: 'Online' }],
        },
      ],
      meta: {
        segments: [{ offline: false }, { offline: true }],
        truncated: false,
        total: 2,
        stale: false,
      },
    });

    const server = new FakeServer();
    registerCuratedFriendTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_friends_overview');

    const result = await Promise.resolve(tool!.handler({}));
    expect(result).toMatchObject({
      structuredContent: {
        totalFriends: 2,
        onlineCount: 1,
        offlineCount: 1,
      },
    });
  });

  it('returns location details for a friend', async () => {
    vi.mocked(getFriendLocationDetails).mockResolvedValue({
      ok: true,
      friend: { id: 'u1', displayName: 'Test' },
      location: {
        type: 'instance',
        worldId: 'wrld_1',
        instanceId: 'inst',
        raw: 'wrld_1:inst',
      },
      instance: { id: 'inst' },
      world: { id: 'wrld_1' },
    });

    const server = new FakeServer();
    registerCuratedFriendTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_friend_location_details');

    const result = await Promise.resolve(tool!.handler({ name: 'Test' }));
    expect(result).toMatchObject({ structuredContent: { friend: { id: 'u1' } } });
  });

  it('requires name or userId for location details', async () => {
    const server = new FakeServer();
    registerCuratedFriendTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_friend_location_details');

    const result = await Promise.resolve(tool!.handler({}));
    expect(result).toMatchObject({ isError: true });
  });

  it('returns not-found payload when friend is missing', async () => {
    vi.mocked(getFriendLocationDetails).mockResolvedValue({
      ok: false,
      reason: 'No friend found with displayName "Missing".',
      status: 'not_found',
      nextSteps: ['vrchat_friends_search'],
    });

    const server = new FakeServer();
    registerCuratedFriendTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_friend_location_details');

    const result = await Promise.resolve(tool!.handler({ name: 'Missing' }));
    expect(result).toMatchObject({ isError: true });
    expect(result.structuredContent).toMatchObject({ status: 'not_found' });
  });
});
