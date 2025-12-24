import type { InstanceSummary } from '../../models/instances.js';
import type {
  FriendDetailsInput,
  FriendSearchInput,
  FriendsListInput,
  FriendsOverviewInput,
} from '../../models/friends.js';
import { fetchFriends, fetchFriendsWithMeta, type FriendRecord } from './fetch.js';
import {
  findFriendByNameOrId,
  parseLocation,
  searchFriendsByName,
  type LocationInfo,
} from './match.js';
import { getGroupProfile } from '../groups/index.js';
import { getInstanceDetails } from '../instances/index.js';
import {
  callReadOperationParsed,
  type ReadOperationData,
} from '../api/client.js';

export type FriendDetailsResult =
  | {
      ok: true;
      friend: FriendRecord;
      profile: ReadOperationData<'getUser'>;
      location: LocationInfo;
      instance: InstanceSummary | null;
      world: ReadOperationData<'getWorld'> | null;
      group: ReadOperationData<'getGroup'> | null;
    }
  | {
      ok: false;
      reason: string;
      status: 'not_found';
      nextSteps: string[];
    };

interface EnrichedLocationInfo extends LocationInfo {
  worldName?: string;
  groupName?: string;
  groupShortCode?: string;
}

type InstanceRecord = ReadOperationData<'getInstance'>;
type WorldRecord = ReadOperationData<'getWorld'>;
type GroupRecord = ReadOperationData<'getGroup'>;

interface FriendSummary {
  userId?: string;
  displayName?: string;
  status?: string;
}

interface LocationBucket {
  info: EnrichedLocationInfo;
  friends: FriendSummary[];
  instance?: InstanceRecord | InstanceSummary | null;
}

const DEFAULT_LIST_PAGE_SIZE = 100;
const DEFAULT_ALL_MAX_PAGES = 200;
const DEFAULT_ONLINE_MAX_PAGES = 50;
const DEFAULT_SEARCH_MAX_PAGES = 100;
const DEFAULT_SEARCH_MAX_RESULTS = 10;
function normalizePageSize(value: number | undefined, fallback: number): number {
  return typeof value === 'number' ? Math.floor(value) : fallback;
}

function normalizeMaxPages(value: number | undefined, fallback: number): number {
  return typeof value === 'number' ? Math.floor(value) : fallback;
}

function normalizeStatusFilter(
  value: string | string[] | undefined,
): string[] | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? [trimmed.toLowerCase()] : undefined;
  }
  if (Array.isArray(value)) {
    const normalized = value
      .filter((entry) => typeof entry === 'string')
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean);
    return normalized.length > 0 ? Array.from(new Set(normalized)) : undefined;
  }
  return undefined;
}

function matchesStatusFilter(
  statusKey: string,
  isOffline: boolean,
  filter: Set<string> | null,
): boolean {
  if (!filter || filter.size === 0) return true;
  const normalized = statusKey.toLowerCase();
  const matchesOffline = filter.has('offline') && isOffline;
  const matchesOnline = filter.has('online') && !isOffline;
  return matchesOffline || matchesOnline || filter.has(normalized);
}

function buildInstanceSummary(instance: InstanceRecord | null | undefined): InstanceSummary | undefined {
  if (!instance) return undefined;
  const region = instance.region ?? instance.photonRegion ?? undefined;

  return {
    id: instance.id,
    instanceId: instance.instanceId,
    location: instance.location,
    worldId: instance.worldId,
    userCount: instance.userCount,
    n_users: instance.n_users,
    capacity: instance.capacity,
    recommendedCapacity: instance.recommendedCapacity,
    full: instance.full,
    hasCapacityForYou: instance.hasCapacityForYou,
    queueEnabled: instance.queueEnabled,
    queueSize: instance.queueSize,
    type: instance.type,
    groupAccessType: instance.groupAccessType,
    region,
    photonRegion: instance.photonRegion,
    canRequestInvite: instance.canRequestInvite,
    tags: instance.tags,
    displayName: instance.displayName,
    shortName: instance.shortName,
    name: instance.name,
  };
}

function getInstanceUserCount(instance: InstanceRecord | InstanceSummary | null | undefined): number | null {
  if (!instance) return null;
  const count =
    typeof instance.userCount === 'number'
      ? instance.userCount
      : typeof instance.n_users === 'number'
        ? instance.n_users
        : null;
  if (count === null || !Number.isFinite(count)) return null;
  return Math.max(0, Math.floor(count));
}

interface InstanceErrorInfo {
  status?: number;
  message?: string;
}

function toInstanceErrorInfo(err: unknown): InstanceErrorInfo {
  if (err instanceof Error) {
    return { message: err.message };
  }
  if (!err || typeof err !== 'object') return {};
  const status =
    'status' in err && typeof err.status === 'number' ? err.status : undefined;
  const message =
    'message' in err && typeof err.message === 'string' ? err.message : undefined;
  return { status, message };
}

function formatInstanceError(
  worldId: string,
  instanceId: string,
  err: InstanceErrorInfo,
): string {
  const status = err.status;
  if (status === 401) {
    return `Not authorized to access instance ${worldId}:${instanceId}.`;
  }
  if (status === 404) {
    return `Instance ${worldId}:${instanceId} not found.`;
  }
  if (err.message) {
    return `Failed to fetch instance ${worldId}:${instanceId}: ${err.message}`;
  }
  return `Failed to fetch instance ${worldId}:${instanceId}.`;
}

function extractGroupInfo(
  group: GroupRecord | null,
): { name?: string; shortCode?: string } | null {
  if (!group) return null;
  const name = typeof group.name === 'string' ? group.name : undefined;
  const shortCode = typeof group.shortCode === 'string' ? group.shortCode : undefined;
  if (!name && !shortCode) return null;
  return { name, shortCode };
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

export async function listFriends(input: FriendsListInput) {
  const includeOffline = input.includeOffline === true;
  const pageSize = normalizePageSize(input.pageSize, DEFAULT_LIST_PAGE_SIZE);
  const maxPages = normalizeMaxPages(
    input.maxPages,
    includeOffline ? DEFAULT_ALL_MAX_PAGES : DEFAULT_ONLINE_MAX_PAGES,
  );

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

export async function getFriendsOverview(input: FriendsOverviewInput) {
  const requestedIncludeOffline = input.includeOffline !== false;
  const statusFilterValues =
    normalizeStatusFilter(input.status) ??
    normalizeStatusFilter(input.statusFilter);
  const statusFilterSet = statusFilterValues
    ? new Set(statusFilterValues)
    : null;
  const includeOffline =
    requestedIncludeOffline || statusFilterSet?.has('offline') === true;
  const minInstanceUserCount =
    typeof input.minInstanceUserCount === 'number'
      ? Math.max(0, Math.floor(input.minInstanceUserCount))
      : undefined;
  const instanceDetailLevel =
    input.instanceDetailLevel === 'full' ? 'full' : 'summary';
  const strictInstanceFilter = minInstanceUserCount !== undefined;
  const pageSize = DEFAULT_LIST_PAGE_SIZE;
  const maxPages = DEFAULT_ALL_MAX_PAGES;

  const { friends, meta } = await fetchFriendsWithMeta({
    includeOffline,
    pageSize,
    maxPages,
  });

  const overallStatusCounts: Record<string, number> = {};
  const filteredOfflineStatusCounts: Record<string, number> = {};
  const locations = new Map<string, LocationBucket>();
  let overallOnlineCount = 0;
  let overallOfflineCount = 0;
  let filteredOfflineCount = 0;

  for (const friend of friends) {
    const status = typeof friend.status === 'string' ? friend.status : undefined;
    const location = typeof friend.location === 'string' ? friend.location : undefined;
    const isOffline = status === 'offline' || location === 'offline';
    const statusKey = status ?? (isOffline ? 'offline' : 'unknown');
    overallStatusCounts[statusKey] = (overallStatusCounts[statusKey] ?? 0) + 1;
    if (isOffline) {
      overallOfflineCount += 1;
    } else {
      overallOnlineCount += 1;
    }
    if (!matchesStatusFilter(statusKey, isOffline, statusFilterSet)) {
      continue;
    }
    if (isOffline) {
      filteredOfflineCount += 1;
      filteredOfflineStatusCounts[statusKey] =
        (filteredOfflineStatusCounts[statusKey] ?? 0) + 1;
      continue;
    }

    const locationKey = location ?? 'unknown';
    const existing = locations.get(locationKey);
    if (existing) {
      existing.friends.push({
        userId: friend.id ? String(friend.id) : undefined,
        displayName: friend.displayName ? String(friend.displayName) : undefined,
        status,
      });
    } else {
      const info = parseLocation(locationKey) as EnrichedLocationInfo;
      info.raw = locationKey;
      locations.set(locationKey, {
        info,
        friends: [
          {
            userId: friend.id ? String(friend.id) : undefined,
            displayName: friend.displayName ? String(friend.displayName) : undefined,
            status,
          },
        ],
      });
    }
  }

  const groupIds = new Set<string>();
  const instanceTargets: {
    key: string;
    worldId: string;
    instanceId: string;
  }[] = [];

  for (const [key, bucket] of locations.entries()) {
    const { worldId, instanceId, groupId, type } = bucket.info;
    if (type === 'instance' && worldId && instanceId) {
      instanceTargets.push({ key, worldId, instanceId });
    }
    if (groupId) groupIds.add(groupId);
  }

  await Promise.all(
    instanceTargets.map(async ({ key, worldId, instanceId }) => {
      try {
        const { instance } = await getInstanceDetails(worldId, instanceId);
        if (!instance) {
          if (strictInstanceFilter) {
            throw new Error(`Instance ${worldId}:${instanceId} not found.`);
          }
          return;
        }
        const bucket = locations.get(key);
        if (!bucket) return;
        bucket.instance =
          instanceDetailLevel === 'full'
            ? instance
            : (buildInstanceSummary(instance) ?? instance);
        if (instance) {
          const worldName = instance.world?.name ?? undefined;
          if (worldName) bucket.info.worldName = worldName;
          const worldIdFromInstance = instance.worldId ?? instance.world?.id ?? undefined;
          if (!bucket.info.worldId && worldIdFromInstance) {
            bucket.info.worldId = worldIdFromInstance;
          }
          const region = instance.region ?? instance.photonRegion ?? undefined;
          if (region) bucket.info.region = region;
          const typeValue = instance.type ?? undefined;
          if (typeValue) bucket.info.accessType = typeValue;
        }
      } catch (err) {
        if (strictInstanceFilter) {
          throw new Error(
            formatInstanceError(worldId, instanceId, toInstanceErrorInfo(err)),
          );
        }
        // best-effort enrichment
      }
    }),
  );

  const groupInfo = new Map<string, { name?: string; shortCode?: string }>();
  await Promise.all(
    [...groupIds].map(async (groupId) => {
      try {
        const { group } = await getGroupProfile(groupId);
        const info = extractGroupInfo(group);
        if (info) groupInfo.set(groupId, info);
      } catch {
        // best-effort enrichment
      }
    }),
  );

  for (const bucket of locations.values()) {
    const groupId = bucket.info.groupId;
    if (groupId && groupInfo.has(groupId)) {
      const info = groupInfo.get(groupId);
      bucket.info.groupName = info?.name;
      bucket.info.groupShortCode = info?.shortCode;
    }
  }

  const locationList = [...locations.entries()]
    .sort((a, b) => b[1].friends.length - a[1].friends.length)
    .map(([locationKey, bucket]) => ({
      location: locationKey,
      ...bucket.info,
      instance: bucket.instance,
      friendCount: bucket.friends.length,
      friends: bucket.friends,
    }));

  const filteredLocations =
    minInstanceUserCount !== undefined
      ? locationList.filter((entry) => {
          const count = getInstanceUserCount(entry.instance);
          return count !== null && count >= minInstanceUserCount;
        })
      : locationList;

  const filteredOnlineStatusCounts: Record<string, number> = {};
  let filteredOnlineCount = 0;
  for (const entry of filteredLocations) {
    for (const friend of entry.friends) {
      filteredOnlineCount += 1;
      const key = friend.status ?? 'unknown';
      filteredOnlineStatusCounts[key] = (filteredOnlineStatusCounts[key] ?? 0) + 1;
    }
  }

  const statusCounts: Record<string, number> = { ...filteredOfflineStatusCounts };
  for (const [key, count] of Object.entries(filteredOnlineStatusCounts)) {
    statusCounts[key] = (statusCounts[key] ?? 0) + count;
  }

  const filteredTotal = filteredOnlineCount + filteredOfflineCount;
  const overallTotal = overallOnlineCount + overallOfflineCount;

  return {
    includeOffline,
    statusFilter: statusFilterValues,
    minInstanceUserCount,
    instanceDetailLevel,
    totalFriends: filteredTotal,
    onlineCount: filteredOnlineCount,
    offlineCount: filteredOfflineCount,
    statusCounts,
    totals: {
      all: {
        totalFriends: overallTotal,
        onlineCount: overallOnlineCount,
        offlineCount: overallOfflineCount,
        statusCounts: overallStatusCounts,
      },
      filtered: {
        totalFriends: filteredTotal,
        onlineCount: filteredOnlineCount,
        offlineCount: filteredOfflineCount,
        statusCounts,
      },
    },
    locations: filteredLocations,
    meta,
  };
}

export async function getFriendDetails(
  input: FriendDetailsInput,
): Promise<FriendDetailsResult> {
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
  let instance: InstanceSummary | null = null;
  let world: WorldRecord | null = null;
  let group: GroupRecord | null = null;

  const resolvedUserId =
    typeof target.id === 'string' ? target.id : userId ? String(userId) : '';
  if (!resolvedUserId) {
    return {
      ok: false,
      reason: 'Unable to resolve friend userId.',
      status: 'not_found',
      nextSteps: ['vrchat_friends_search'],
    };
  }

  const profileResult = await callReadOperationParsed('getUser', {
    userId: resolvedUserId,
  });
  const profile = profileResult.data ?? {};

  if (location.type === 'instance' && location.worldId && location.instanceId) {
    const { instance: instanceResult } = await getInstanceDetails(
      location.worldId,
      location.instanceId,
    );
    if (instanceResult) {
      instance = buildInstanceSummary(instanceResult) ?? null;
      if (instanceResult.world) {
        world = instanceResult.world ?? null;
        const worldName = instanceResult.world.name;
        if (typeof worldName === 'string' && worldName) {
          (location as EnrichedLocationInfo).worldName = worldName;
        }
      }
      const region = instanceResult.region ?? instanceResult.photonRegion ?? undefined;
      if (region) (location as EnrichedLocationInfo).region = region;
      const typeValue = instanceResult.type ?? undefined;
      if (typeValue) (location as EnrichedLocationInfo).accessType = typeValue;
    }
  }

  if (location.groupId) {
    const groupResult = await getGroupProfile(location.groupId);
    group = groupResult.group ?? null;
    const groupInfo = extractGroupInfo(group);
    if (groupInfo) {
      (location as EnrichedLocationInfo).groupName = groupInfo.name;
      (location as EnrichedLocationInfo).groupShortCode = groupInfo.shortCode;
    }
  }

  return {
    ok: true,
    friend: target,
    profile,
    location,
    instance,
    world,
    group,
  };
}
