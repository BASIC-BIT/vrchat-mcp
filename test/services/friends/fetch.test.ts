import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/core/readTools.js', () => ({
  callReadOperation: vi.fn(),
}));

import { fetchFriends, fetchFriendsWithMeta } from '../../../src/services/friends/fetch.js';
import { cacheManager } from '../../../src/services/cache.js';
import { callReadOperation } from '../../../src/core/readTools.js';

describe('fetchFriends service', () => {
  beforeEach(() => {
    cacheManager.invalidateAll();
    vi.mocked(callReadOperation).mockReset();
  });

  it('fetches online friends when includeOffline is false', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: [{ id: 'u1' }, { id: 'u2' }],
    });

    const result = await fetchFriends({ includeOffline: false, pageSize: 2, maxPages: 1 });
    expect(result.map((friend) => friend.id)).toEqual(['u1', 'u2']);
    expect(callReadOperation).toHaveBeenCalledWith('getFriends', { offline: false }, expect.any(Object));
  });

  it('deduplicates friends across online/offline segments', async () => {       
    vi.mocked(callReadOperation)
      .mockResolvedValueOnce({ data: [{ id: 'u1' }, { id: 'u2' }] })
      .mockResolvedValueOnce({ data: [{ id: 'u2' }, { id: 'u3' }] });

    const result = await fetchFriends({ includeOffline: true, pageSize: 2, maxPages: 1 });
    expect(result.map((friend) => friend.id)).toEqual(['u1', 'u2', 'u3']);      
  });

  it('returns pagination meta when requested', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: [{ id: 'u1' }],
      page: {
        pages: 1,
        items: 1,
        pageSize: 1,
        offsetStart: 0,
        truncated: false,
      },
    });

    const result = await fetchFriendsWithMeta({
      includeOffline: false,
      pageSize: 1,
      maxPages: 1,
    });

    expect(result.meta.total).toBe(1);
    expect(result.meta.truncated).toBe(false);
    expect(result.meta.stale).toBe(false);
    expect(result.meta.segments[0]?.offline).toBe(false);
    expect(result.meta.segments[0]?.page?.items).toBe(1);
  });
});
