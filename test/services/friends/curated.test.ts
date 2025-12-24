import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/core/readTools.js', () => ({
  callReadOperation: vi.fn(),
}));

vi.mock('../../../src/services/friends/fetch.js', () => ({
  fetchFriends: vi.fn(),
  fetchFriendsWithMeta: vi.fn(),
}));

vi.mock('../../../src/services/friends/match.js', () => ({
  findFriendByNameOrId: vi.fn(),
  parseLocation: vi.fn(),
  searchFriendsByName: vi.fn(),
}));
vi.mock('../../../src/services/groups/index.js', () => ({
  getGroupProfile: vi.fn(),
}));
vi.mock('../../../src/services/instances/index.js', () => ({
  getInstanceDetails: vi.fn(),
}));

import { callReadOperation } from '../../../src/core/readTools.js';
import { fetchFriends, fetchFriendsWithMeta } from '../../../src/services/friends/fetch.js';
import {
  findFriendByNameOrId,
  parseLocation,
  searchFriendsByName,
} from '../../../src/services/friends/match.js';
import { getGroupProfile } from '../../../src/services/groups/index.js';
import { getInstanceDetails } from '../../../src/services/instances/index.js';
import {
  getFriendDetails,
  getFriendsOverview,
  listFriends,
  searchFriends,
} from '../../../src/services/friends/curated.js';

describe('friends curated service', () => {
  beforeEach(() => {
    vi.mocked(fetchFriends).mockReset();
    vi.mocked(fetchFriendsWithMeta).mockReset();
    vi.mocked(findFriendByNameOrId).mockReset();
    vi.mocked(parseLocation).mockReset();
    vi.mocked(callReadOperation).mockReset();
    vi.mocked(searchFriendsByName).mockReset();
    vi.mocked(getGroupProfile).mockReset();
    vi.mocked(getInstanceDetails).mockReset();
  });

  it('returns not-found for missing friend', async () => {
    vi.mocked(fetchFriends).mockResolvedValue([]);
    vi.mocked(findFriendByNameOrId).mockReturnValue(undefined);

    const result = await getFriendDetails({ name: 'Missing', includeOffline: true });
    expect(result).toMatchObject({
      ok: false,
      status: 'not_found',
      nextSteps: ['vrchat_friends_search'],
    });
  });

  it('fetches friend profile + instance details', async () => {
    vi.mocked(fetchFriends).mockResolvedValue([{ id: 'u1', displayName: 'Test' }]);
    vi.mocked(findFriendByNameOrId).mockReturnValue({
      id: 'u1',
      displayName: 'Test',
      location: 'wrld_1:inst',
    });
    vi.mocked(parseLocation).mockReturnValue({
      type: 'instance',
      worldId: 'wrld_1',
      instanceId: 'inst',
      raw: 'wrld_1:inst',
    });
    vi.mocked(callReadOperation).mockResolvedValue({
      data: { id: 'u1', displayName: 'Test' },
    });
    vi.mocked(getInstanceDetails).mockResolvedValue({
      instance: { id: 'inst', world: { id: 'wrld_1' } },
      stale: false,
    });

    const result = await getFriendDetails({ name: 'Test', includeOffline: true });
    expect(callReadOperation).toHaveBeenCalledWith('getUser', { userId: 'u1' }, undefined);
    expect(result).toMatchObject({
      ok: true,
      friend: { id: 'u1' },
      profile: { id: 'u1' },
      world: { id: 'wrld_1' },
    });
  });

  it('searches friends by name and enforces max results', async () => {
    vi.mocked(fetchFriends).mockResolvedValue([{ id: 'u1' }, { id: 'u2' }]);
    vi.mocked(searchFriendsByName).mockReturnValue([
      { id: 'u1' },
      { id: 'u2' },
      { id: 'u3' },
    ]);

    const result = await searchFriends({ query: 'na', includeOffline: false, maxResults: 2 });
    expect(fetchFriends).toHaveBeenCalledWith({
      includeOffline: false,
      pageSize: 100,
      maxPages: 100,
    });
    expect(result.matches).toHaveLength(2);
  });

  it('lists friends with normalized paging', async () => {
    vi.mocked(fetchFriendsWithMeta).mockResolvedValue({
      friends: [{ id: 'u1' }],
      meta: { segments: [], truncated: false, total: 1, stale: false },
    });

    const result = await listFriends({ pageSize: 75.9, maxPages: 10.2 });
    expect(fetchFriendsWithMeta).toHaveBeenCalledWith({
      includeOffline: false,
      pageSize: 75,
      maxPages: 10,
    });
    expect(result.pageSize).toBe(75);
    expect(result.maxPages).toBe(10);
  });

  it('includes offline friends when requested', async () => {
    vi.mocked(fetchFriendsWithMeta).mockResolvedValue({
      friends: [{ id: 'u1' }],
      meta: { segments: [], truncated: false, total: 1, stale: false },
    });

    const result = await listFriends({ includeOffline: true, pageSize: 50, maxPages: 3 });
    expect(fetchFriendsWithMeta).toHaveBeenCalledWith({
      includeOffline: true,
      pageSize: 50,
      maxPages: 3,
    });
    expect(result.friends).toHaveLength(1);
  });

  it('computes overview counts', async () => {
    vi.mocked(fetchFriendsWithMeta).mockResolvedValue({
      friends: [
        { id: 'u1', displayName: 'Online', status: 'active', location: 'wrld_1:inst' },
        { id: 'u2', displayName: 'Offline', status: 'offline', location: 'offline' },
      ],
      meta: {
        segments: [{ offline: false }, { offline: true }],
        truncated: false,
        total: 2,
        stale: false,
      },
    });
    vi.mocked(parseLocation).mockImplementation((raw?: string) => ({
      raw: raw ?? null,
      type: raw?.startsWith('wrld_') ? 'instance' : 'unknown',
      worldId: raw?.startsWith('wrld_') ? raw.split(':')[0] : undefined,
      instanceId: raw?.startsWith('wrld_') ? raw.split(':')[1] : undefined,
    }));
    vi.mocked(getInstanceDetails).mockResolvedValue({
      instance: { id: 'inst', world: { name: 'Mock World' }, userCount: 3 },
      stale: false,
    });

    const result = await getFriendsOverview({});
    expect(result).toMatchObject({
      totalFriends: 2,
      onlineCount: 1,
      offlineCount: 1,
    });
    expect(result.totals.all.totalFriends).toBe(2);
    expect(result.totals.filtered.totalFriends).toBe(2);
    expect(result.locations).toHaveLength(1);
  });

  it('enriches locations with instance and group info', async () => {
    vi.mocked(fetchFriendsWithMeta).mockResolvedValue({
      friends: [
        {
          id: 'u1',
          displayName: 'A',
          status: 'active',
          location: 'wrld_1:inst~group(grp_1)~region(use)',
        },
        {
          id: 'u2',
          displayName: 'B',
          status: 'active',
          location: 'wrld_1:inst~group(grp_1)~region(use)',
        },
      ],
      meta: { segments: [], truncated: false, total: 2, stale: false },
    });
    vi.mocked(parseLocation).mockImplementation((raw?: string) => ({
      raw: raw ?? null,
      type: 'instance',
      worldId: 'wrld_1',
      instanceId: 'inst',
      groupId: 'grp_1',
      accessType: 'group',
      region: 'use',
    }));
    vi.mocked(getInstanceDetails).mockResolvedValue({
      instance: { id: 'inst', world: { name: 'Mock World' }, userCount: 42 },
      stale: false,
    });
    vi.mocked(getGroupProfile).mockResolvedValue({
      group: { name: 'Mock Group', shortCode: 'MG' },
      stale: false,
    });

    const result = await getFriendsOverview({});
    expect(result.locations).toHaveLength(1);
    expect(result.locations[0]).toMatchObject({
      location: 'wrld_1:inst~group(grp_1)~region(use)',
      worldId: 'wrld_1',
      worldName: 'Mock World',
      groupId: 'grp_1',
      groupName: 'Mock Group',
      groupShortCode: 'MG',
      region: 'use',
      friendCount: 2,
    });
    expect(result.locations[0]?.instance).toMatchObject({ userCount: 42 });
    expect(getInstanceDetails).toHaveBeenCalledTimes(1);
    expect(getGroupProfile).toHaveBeenCalledTimes(1);
  });

  it('filters by status', async () => {
    vi.mocked(fetchFriendsWithMeta).mockResolvedValue({
      friends: [
        { id: 'u1', displayName: 'A', status: 'active', location: 'wrld_1:inst' },
        { id: 'u2', displayName: 'B', status: 'busy', location: 'wrld_2:inst' },
      ],
      meta: { segments: [], truncated: false, total: 2, stale: false },
    });
    vi.mocked(parseLocation).mockImplementation((raw?: string) => ({
      raw: raw ?? null,
      type: 'instance',
      worldId: raw?.split(':')[0],
      instanceId: raw?.split(':')[1],
    }));
    vi.mocked(getInstanceDetails).mockResolvedValue({
      instance: { id: 'inst', world: { name: 'Mock World' }, userCount: 7 },
      stale: false,
    });

    const result = await getFriendsOverview({ status: 'busy' });
    expect(result.totalFriends).toBe(1);
    expect(result.statusCounts).toEqual({ busy: 1 });
    expect(result.locations[0]?.friends).toHaveLength(1);
    expect(result.totals.all.totalFriends).toBe(2);
    expect(result.totals.filtered.totalFriends).toBe(1);
  });

  it('filters locations by min instance user count', async () => {
    vi.mocked(fetchFriendsWithMeta).mockResolvedValue({
      friends: [
        { id: 'u1', displayName: 'A', status: 'active', location: 'wrld_1:inst' },
        { id: 'u2', displayName: 'B', status: 'active', location: 'wrld_2:inst' },
      ],
      meta: { segments: [], truncated: false, total: 2, stale: false },
    });
    vi.mocked(parseLocation).mockImplementation((raw?: string) => ({
      raw: raw ?? null,
      type: 'instance',
      worldId: raw?.split(':')[0],
      instanceId: raw?.split(':')[1],
    }));
    vi.mocked(getInstanceDetails).mockImplementation((worldId: string) => {
      if (worldId === 'wrld_1') {
        return { instance: { id: 'inst', userCount: 2 }, stale: false };
      }
      return { instance: { id: 'inst', userCount: 10 }, stale: false };
    });

    const result = await getFriendsOverview({ minInstanceUserCount: 5 });
    expect(result.locations).toHaveLength(1);
    expect(result.locations[0]?.worldId).toBe('wrld_2');
    expect(result.onlineCount).toBe(1);
    expect(result.totals.all.totalFriends).toBe(2);
    expect(result.totals.filtered.totalFriends).toBe(1);
  });

  it('throws when min instance user count is set and instance fetch fails', async () => {
    vi.mocked(fetchFriendsWithMeta).mockResolvedValue({
      friends: [{ id: 'u1', displayName: 'A', status: 'active', location: 'wrld_1:inst' }],
      meta: { segments: [], truncated: false, total: 1, stale: false },
    });
    vi.mocked(parseLocation).mockReturnValue({
      raw: 'wrld_1:inst',
      type: 'instance',
      worldId: 'wrld_1',
      instanceId: 'inst',
    });
    vi.mocked(getInstanceDetails).mockRejectedValue(new Error('boom'));

    await expect(getFriendsOverview({ minInstanceUserCount: 5 })).rejects.toThrow(
      /Failed to fetch instance/,
    );
  });
});
