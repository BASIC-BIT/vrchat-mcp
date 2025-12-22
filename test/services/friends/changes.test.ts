import { describe, it, expect, beforeEach } from 'vitest';
import { cacheManager } from '../../../src/services/cache.js';
import {
  applyFriendEventToCache,
  FriendsChangeStore,
  recordFriendChange,
  type FriendPipelineEvent,
} from '../../../src/services/friends/changes.js';

describe('friends change store', () => {
  it('records and snapshots changes', () => {
    const store = new FriendsChangeStore();
    const event = store.record({
      type: 'friend-online',
      userId: 'usr_1',
    });
    const snapshot = store.snapshot(0, 10);
    expect(event.sequence).toBe(1);
    expect(snapshot.events).toHaveLength(1);
    expect(snapshot.changedIds).toEqual(['usr_1']);
  });
});

describe('friends cache updates', () => {
  beforeEach(() => {
    cacheManager.invalidateAll();
  });

  it('removes offline friends from online cache', () => {
    cacheManager.set(
      'friends:list:includeOffline=false',
      {
        friends: [
          { id: 'usr_1', displayName: 'Nakk', location: 'wrld_1', status: 'active' },
        ],
        meta: { segments: [], truncated: false, total: 1, stale: false },
      },
      1000,
      ['friends', 'friends:online'],
    );

    const event: FriendPipelineEvent = {
      type: 'friend-offline',
      content: { userId: 'usr_1' },
      receivedAt: new Date().toISOString(),
    };
    const updated = applyFriendEventToCache(event);
    const cached = cacheManager.get<{ friends: { id: string }[] }>(
      'friends:list:includeOffline=false',
    );
    expect(updated).toBeGreaterThan(0);
    expect(cached?.friends).toHaveLength(0);
  });

  it('updates offline cache with new location', () => {
    cacheManager.set(
      'friends:list:includeOffline=true',
      {
        friends: [{ id: 'usr_2', displayName: 'Foo', location: 'offline', status: 'offline' }],
        meta: { segments: [], truncated: false, total: 1, stale: false },
      },
      1000,
      ['friends', 'friends:offline'],
    );

    const event: FriendPipelineEvent = {
      type: 'friend-location',
      content: { userId: 'usr_2', location: 'wrld_2:123' },
      receivedAt: new Date().toISOString(),
    };
    const updated = applyFriendEventToCache(event);
    const cached = cacheManager.get<{
      friends: { id: string; location?: string }[];
      meta: { total: number };
    }>('friends:list:includeOffline=true');
    expect(updated).toBeGreaterThan(0);
    expect(cached?.friends[0]?.location).toBe('wrld_2:123');
    expect(cached?.meta.total).toBe(1);
  });

  it('adds online friend to cache', () => {
    cacheManager.set(
      'friends:list:includeOffline=false',
      {
        friends: [],
        meta: { segments: [], truncated: false, total: 0, stale: false },
      },
      1000,
      ['friends', 'friends:online'],
    );

    const event: FriendPipelineEvent = {
      type: 'friend-online',
      content: { userId: 'usr_3', location: 'wrld_3:1', user: { displayName: 'Sky' } },
      receivedAt: new Date().toISOString(),
    };
    const updated = applyFriendEventToCache(event);
    const cached = cacheManager.get<{ friends: { id: string; displayName?: string }[] }>(
      'friends:list:includeOffline=false',
    );
    expect(updated).toBeGreaterThan(0);
    expect(cached?.friends).toHaveLength(1);
    expect(cached?.friends[0]?.displayName).toBe('Sky');
  });

  it('removes friend on delete in offline cache', () => {
    cacheManager.set(
      'friends:list:includeOffline=true',
      {
        friends: [{ id: 'usr_4', displayName: 'RemoveMe', location: 'offline', status: 'offline' }],
        meta: { segments: [], truncated: false, total: 1, stale: false },
      },
      1000,
      ['friends', 'friends:offline'],
    );

    const event: FriendPipelineEvent = {
      type: 'friend-delete',
      content: { userId: 'usr_4' },
      receivedAt: new Date().toISOString(),
    };
    const updated = applyFriendEventToCache(event);
    const cached = cacheManager.get<{ friends: { id: string }[]; meta: { total: number } }>(
      'friends:list:includeOffline=true',
    );
    expect(updated).toBeGreaterThan(0);
    expect(cached?.friends).toHaveLength(0);
    expect(cached?.meta.total).toBe(0);
  });

  it('returns 0 for unsupported events', () => {
    const updated = applyFriendEventToCache({
      type: 'world-update',
      content: {},
      receivedAt: new Date().toISOString(),
    });
    expect(updated).toBe(0);
  });
});

describe('record friend change', () => {
  it('returns null for non-friend events', () => {
    const result = recordFriendChange({
      type: 'world-update',
      content: {},
      receivedAt: new Date().toISOString(),
    });
    expect(result).toBeNull();
  });

  it('extracts user id and details from payload', () => {
    const result = recordFriendChange({
      type: 'friend-location',
      content: {
        user: { id: 'usr_10', displayName: 'Nova' },
        travelingToLocation: 'wrld_10:1',
        platform: 'android',
        canRequestInvite: true,
      },
      receivedAt: '2025-12-22T12:00:00Z',
    });

    expect(result).toMatchObject({
      type: 'friend-location',
      userId: 'usr_10',
      displayName: 'Nova',
      location: 'wrld_10:1',
      platform: 'android',
      canRequestInvite: true,
      receivedAt: '2025-12-22T12:00:00Z',
    });
  });
});
