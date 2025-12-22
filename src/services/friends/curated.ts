import { callReadOperation } from '../../core/readTools.js';
import type {
  FriendLocationDetailsInput,
  FriendSearchInput,
  FriendsListAllInput,
  FriendsListOnlineInput,
  FriendsOverviewInput,
} from '../../models/friends.js';
import { fetchFriends, fetchFriendsWithMeta, type FriendRecord } from './fetch.js';
import {
  findFriendByNameOrId,
  parseLocation,
  searchFriendsByName,
  type LocationInfo,
} from './match.js';

export type FriendLocationDetailsResult =
  | {
      ok: true;
      friend: FriendRecord;
      location: LocationInfo;
      instance: unknown;
      world: unknown;
    }
  | {
      ok: false;
      reason: string;
      status: 'not_found';
      nextSteps: string[];
    };

const DEFAULT_LIST_PAGE_SIZE = 100;
const DEFAULT_ALL_MAX_PAGES = 200;
const DEFAULT_ONLINE_MAX_PAGES = 50;
const DEFAULT_SEARCH_MAX_PAGES = 100;
const DEFAULT_SEARCH_MAX_RESULTS = 10;
const DEFAULT_OVERVIEW_MAX_ONLINE = 20;
const DEFAULT_OVERVIEW_MAX_LOCATIONS = 10;

function normalizePageSize(value: unknown, fallback: number): number {
  return typeof value === 'number' ? Math.floor(value) : fallback;
}

function normalizeMaxPages(value: unknown, fallback: number): number {
  return typeof value === 'number' ? Math.floor(value) : fallback;
}

export async function searchFriends(input: FriendSearchInput) {
  const query = input.query.trim();
  const includeOffline = input.includeOffline !== false;
  const maxResults =
    typeof input.maxResults === 'number'
      ? Math.floor(input.maxResults)
      : DEFAULT_SEARCH_MAX_RESULTS;
  const pageSize = DEFAULT_LIST_PAGE_SIZE;
  const maxPages = DEFAULT_SEARCH_MAX_PAGES;

  const friends = await fetchFriends({ includeOffline, pageSize, maxPages });
  const matches = searchFriendsByName(friends, query);

  return {
    query,
    includeOffline,
    totalFriends: friends.length,
    matches: matches.slice(0, Math.max(1, maxResults)),
  };
}

export async function listAllFriends(input: FriendsListAllInput) {
  const includeOffline = input.includeOffline !== false;
  const pageSize = normalizePageSize(input.pageSize, DEFAULT_LIST_PAGE_SIZE);
  const maxPages = normalizeMaxPages(input.maxPages, DEFAULT_ALL_MAX_PAGES);

  const { friends, meta } = await fetchFriendsWithMeta({
    includeOffline,
    pageSize,
    maxPages,
  });

  return {
    includeOffline,
    pageSize,
    maxPages,
    friends,
    meta,
  };
}

export async function listOnlineFriends(input: FriendsListOnlineInput) {
  const pageSize = normalizePageSize(input.pageSize, DEFAULT_LIST_PAGE_SIZE);
  const maxPages = normalizeMaxPages(input.maxPages, DEFAULT_ONLINE_MAX_PAGES);

  const { friends, meta } = await fetchFriendsWithMeta({
    includeOffline: false,
    pageSize,
    maxPages,
  });

  return {
    pageSize,
    maxPages,
    friends,
    meta,
  };
}

export async function getFriendsOverview(input: FriendsOverviewInput) {
  const includeOffline = input.includeOffline !== false;
  const maxOnline = normalizeMaxPages(input.maxOnline, DEFAULT_OVERVIEW_MAX_ONLINE);
  const maxLocations = normalizeMaxPages(
    input.maxLocations,
    DEFAULT_OVERVIEW_MAX_LOCATIONS,
  );
  const pageSize = normalizePageSize(input.pageSize, DEFAULT_LIST_PAGE_SIZE);
  const maxPages = normalizeMaxPages(input.maxPages, DEFAULT_ALL_MAX_PAGES);

  const { friends, meta } = await fetchFriendsWithMeta({
    includeOffline,
    pageSize,
    maxPages,
  });

  const statusCounts: Record<string, number> = {};
  const locationCounts = new Map<string, number>();
  const topOnline: {
    userId?: string;
    displayName?: string;
    status?: string;
    location?: string;
  }[] = [];
  let onlineCount = 0;
  let offlineCount = 0;

  for (const friend of friends) {
    const status = typeof friend.status === 'string' ? friend.status : undefined;
    const location = typeof friend.location === 'string' ? friend.location : undefined;
    const isOffline = status === 'offline' || location === 'offline';
    const statusKey = status ?? (isOffline ? 'offline' : 'unknown');
    statusCounts[statusKey] = (statusCounts[statusKey] ?? 0) + 1;

    if (isOffline) {
      offlineCount += 1;
    } else {
      onlineCount += 1;
      if (topOnline.length < maxOnline) {
        topOnline.push({
          userId: friend.id ? String(friend.id) : undefined,
          displayName: friend.displayName ? String(friend.displayName) : undefined,
          status,
          location,
        });
      }
      if (location) {
        locationCounts.set(location, (locationCounts.get(location) ?? 0) + 1);
      }
    }
  }

  const locationsTop = [...locationCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, Math.max(1, maxLocations))
    .map(([loc, count]) => ({ location: loc, count }));

  return {
    includeOffline,
    totalFriends: friends.length,
    onlineCount,
    offlineCount,
    statusCounts,
    topOnline,
    locationsTop,
    meta,
  };
}

export async function getFriendLocationDetails(
  input: FriendLocationDetailsInput,
): Promise<FriendLocationDetailsResult> {
  const name = typeof input.name === 'string' ? input.name : undefined;
  const userId = typeof input.userId === 'string' ? input.userId : undefined;
  const includeOffline = input.includeOffline !== false;

  const friends = await fetchFriends({ includeOffline });
  const target = findFriendByNameOrId(friends, { name, userId });

  if (!target) {
    const reason = name
      ? `No friend found with displayName "${name}".`
      : `No friend found with userId "${userId}".`;
    return {
      ok: false,
      reason,
      status: 'not_found',
      nextSteps: ['vrchat_friends_search'],
    };
  }

  const location = parseLocation(
    typeof target.location === 'string' ? target.location : undefined,
  );
  let instance: unknown = null;
  let world: unknown = null;

  if (location.type === 'instance' && location.worldId && location.instanceId) {
    const instanceResult = await callReadOperation('getInstance', {
      worldId: location.worldId,
      instanceId: location.instanceId,
    });
    instance = instanceResult.data ?? null;
    if (instance && typeof instance === 'object' && 'world' in (instance as Record<string, unknown>)) {
      world = (instance as Record<string, unknown>).world ?? null;
    }
  }

  return {
    ok: true,
    friend: target,
    location,
    instance,
    world,
  };
}
