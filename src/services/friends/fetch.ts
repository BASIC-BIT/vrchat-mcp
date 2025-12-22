import { buildCacheKey, cacheConfig, cacheManager } from '../cache.js';
import { callReadOperation } from '../../core/readTools.js';

export type FriendRecord = Record<string, unknown> & {
  id?: string;
  displayName?: string;
  location?: string;
  status?: string;
};

export interface FriendsPageInfo {
  pages: number;
  items: number;
  pageSize: number;
  offsetStart: number;
  truncated: boolean;
}

export interface FriendsFetchMeta {
  segments: { offline: boolean; page?: FriendsPageInfo }[];
  truncated: boolean;
  total: number;
  stale: boolean;
}

export interface FriendsFetchOptions {
  includeOffline: boolean;
  pageSize?: number;
  maxPages?: number;
  maxItems?: number;
}

export interface FriendsFetchResult {
  friends: FriendRecord[];
  meta: FriendsFetchMeta;
}

export async function fetchFriendsWithMeta(options: FriendsFetchOptions): Promise<FriendsFetchResult> {
  const pageSize = options.pageSize ?? 100;
  const maxPages = options.maxPages ?? 10;
  const maxItems = options.maxItems;
  const cacheKey = buildCacheKey('friends:list', {
    includeOffline: options.includeOffline,
    pageSize,
    maxPages,
    maxItems,
  });
  const tags = [
    'friends',
    options.includeOffline ? 'friends:offline' : 'friends:online',
  ];

  const { value, stale } = await cacheManager.getOrSetStale(
    cacheKey,
    cacheConfig.friendsTtlMs,
    cacheConfig.friendsStaleTtlMs,
    tags,
    async () => {
    const segments = options.includeOffline ? [false, true] : [false];
    const collected: FriendRecord[] = [];
    const segmentMeta: { offline: boolean; page?: FriendsPageInfo }[] = [];
    let truncated = false;

    for (const offline of segments) {
      const result = await callReadOperation(
        'getFriends',
        { offline },
        {
          page: {
            enabled: true,
            size: pageSize,
            maxPages,
            maxItems,
          },
        },
      );
      if (Array.isArray(result.data)) {
        collected.push(...(result.data as FriendRecord[]));
      }
      if (result.page) {
        segmentMeta.push({ offline, page: result.page as FriendsPageInfo });
        if (result.page.truncated) truncated = true;
      } else {
        segmentMeta.push({ offline });
      }
    }

    const byId = new Map<string, FriendRecord>();
    for (const friend of collected) {
      const id = friend?.id ? String(friend.id) : '';
      if (!id) continue;
      if (!byId.has(id)) byId.set(id, friend);
    }
    const friends = [...byId.values()];
    return {
      friends,
      meta: {
        segments: segmentMeta,
        truncated,
        total: friends.length,
        stale: false,
      },
    };
  },
  );

  return {
    friends: value.friends,
    meta: { ...value.meta, stale },
  };
}

export async function fetchFriends(options: FriendsFetchOptions): Promise<FriendRecord[]> {
  const result = await fetchFriendsWithMeta(options);
  return result.friends;
}
