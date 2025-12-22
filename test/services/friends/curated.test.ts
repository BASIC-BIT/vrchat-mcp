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

import { callReadOperation } from '../../../src/core/readTools.js';
import { fetchFriends, fetchFriendsWithMeta } from '../../../src/services/friends/fetch.js';
import {
  findFriendByNameOrId,
  parseLocation,
  searchFriendsByName,
} from '../../../src/services/friends/match.js';
import {
  getFriendLocationDetails,
  getFriendsOverview,
  listAllFriends,
  listOnlineFriends,
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
  });

  it('returns not-found for missing friend', async () => {
    vi.mocked(fetchFriends).mockResolvedValue([]);
    vi.mocked(findFriendByNameOrId).mockReturnValue(undefined);

    const result = await getFriendLocationDetails({ name: 'Missing', includeOffline: true });
    expect(result).toMatchObject({
      ok: false,
      status: 'not_found',
      nextSteps: ['vrchat_friends_search'],
    });
  });

  it('fetches instance details for friend location', async () => {
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
      data: { id: 'inst', world: { id: 'wrld_1' } },
    });

    const result = await getFriendLocationDetails({ name: 'Test', includeOffline: true });
    expect(callReadOperation).toHaveBeenCalledWith('getInstance', {
      worldId: 'wrld_1',
      instanceId: 'inst',
    });
    expect(result).toMatchObject({
      ok: true,
      friend: { id: 'u1' },
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

  it('lists all friends with normalized paging', async () => {
    vi.mocked(fetchFriendsWithMeta).mockResolvedValue({
      friends: [{ id: 'u1' }],
      meta: { segments: [], truncated: false, total: 1, stale: false },
    });

    const result = await listAllFriends({ pageSize: 75.9, maxPages: 10.2 });
    expect(fetchFriendsWithMeta).toHaveBeenCalledWith({
      includeOffline: true,
      pageSize: 75,
      maxPages: 10,
    });
    expect(result.pageSize).toBe(75);
    expect(result.maxPages).toBe(10);
  });

  it('lists online friends only', async () => {
    vi.mocked(fetchFriendsWithMeta).mockResolvedValue({
      friends: [{ id: 'u1' }],
      meta: { segments: [], truncated: false, total: 1, stale: false },
    });

    const result = await listOnlineFriends({ pageSize: 50, maxPages: 3 });
    expect(fetchFriendsWithMeta).toHaveBeenCalledWith({
      includeOffline: false,
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

    const result = await getFriendsOverview({});
    expect(result).toMatchObject({
      totalFriends: 2,
      onlineCount: 1,
      offlineCount: 1,
    });
  });

  it('limits top online and top locations', async () => {
    vi.mocked(fetchFriendsWithMeta).mockResolvedValue({
      friends: [
        { id: 'u1', displayName: 'A', status: 'active', location: 'wrld_1:inst' },
        { id: 'u2', displayName: 'B', status: 'active', location: 'wrld_1:inst' },
        { id: 'u3', displayName: 'C', status: 'active', location: 'wrld_2:inst' },
        { id: 'u4', displayName: 'D', status: 'offline', location: 'offline' },
      ],
      meta: { segments: [], truncated: false, total: 4, stale: false },
    });

    const result = await getFriendsOverview({ maxOnline: 2, maxLocations: 1 });
    expect(result.topOnline).toHaveLength(2);
    expect(result.locationsTop).toHaveLength(1);
    expect(result.locationsTop[0]?.location).toBe('wrld_1:inst');
  });
});
