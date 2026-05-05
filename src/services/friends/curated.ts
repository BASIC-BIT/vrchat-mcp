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
import { callReadOperationParsed, type ReadOperationData } from '../api/client.js';

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

type InstanceRecord = NonNullable<ReadOperationData<'getInstance'>>;
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
const DEFAULT_OVERVIEW_MAX_LOCATIONS = 25;
function normalizePageSize(value: number | undefined, fallback: number): number {
  return typeof value === 'number' ? Math.floor(value) : fallback;
}

function normalizeMaxPages(value: number | undefined, fallback: number): number {
  return typeof value === 'number' ? Math.floor(value) : fallback;
}

function normalizeStatusFilter(value: string | string[] | undefined): string[] | undefined {
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
  filter: Set<string> | null
): boolean {
  if (!filter || filter.size === 0) return true;
  const normalized = statusKey.toLowerCase();
  const matchesOffline = filter.has('offline') && isOffline;
  const matchesOnline = filter.has('online') && !isOffline;
  return matchesOffline || matchesOnline || filter.has(normalized);
}

function buildInstanceSummary(
  instance: InstanceRecord | null | undefined
): InstanceSummary | undefined {
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

function getInstanceUserCount(
  instance: InstanceRecord | InstanceSummary | null | undefined
): number | null {
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
  const status = 'status' in err && typeof err.status === 'number' ? err.status : undefined;
  const message = 'message' in err && typeof err.message === 'string' ? err.message : undefined;
  return { status, message };
}

function formatInstanceError(worldId: string, instanceId: string, err: InstanceErrorInfo): string {
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

function extractGroupInfo(group: GroupRecord | null): { name?: string; shortCode?: string } | null {
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
    includeOffline ? DEFAULT_ALL_MAX_PAGES : DEFAULT_ONLINE_MAX_PAGES
  );
  const maxItems =
    typeof input.maxItems === 'number' ? Math.max(1, Math.floor(input.maxItems)) : undefined;

  const { friends, meta } = await fetchFriendsWithMeta({
    includeOffline,
    pageSize,
    maxPages,
    maxItems,
  });

  return {
    includeOffline,
    pageSize,
    maxPages,
    maxItems,
    friends,
    meta,
  };
}

interface OverviewBuckets {
  overallStatusCounts: Record<string, number>;
  overallOnlineCount: number;
  overallOfflineCount: number;
  filteredOfflineStatusCounts: Record<string, number>;
  filteredOfflineCount: number;
  locations: Map<string, LocationBucket>;
}

type OverviewLocationEntry = {
  location: string;
  instance?: InstanceRecord | InstanceSummary | null;
  friendCount: number;
  friends: FriendSummary[];
} & EnrichedLocationInfo;

function toFriendSummary(friend: FriendRecord, status: string | undefined): FriendSummary {
  return {
    userId: friend.id ? String(friend.id) : undefined,
    displayName: friend.displayName ? String(friend.displayName) : undefined,
    status,
  };
}

function buildOverviewBuckets(
  friends: FriendRecord[],
  statusFilterSet: Set<string> | null
): OverviewBuckets {
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
      filteredOfflineStatusCounts[statusKey] = (filteredOfflineStatusCounts[statusKey] ?? 0) + 1;
      continue;
    }

    const locationKey = location ?? 'unknown';
    const summary = toFriendSummary(friend, status);
    const existing = locations.get(locationKey);
    if (existing) {
      existing.friends.push(summary);
      continue;
    }

    const info = parseLocation(locationKey) as EnrichedLocationInfo;
    info.raw = locationKey;
    locations.set(locationKey, {
      info,
      friends: [summary],
    });
  }

  return {
    overallStatusCounts,
    overallOnlineCount,
    overallOfflineCount,
    filteredOfflineStatusCounts,
    filteredOfflineCount,
    locations,
  };
}

function collectEnrichmentTargets(locations: Map<string, LocationBucket>): {
  groupIds: Set<string>;
  instanceTargets: { key: string; worldId: string; instanceId: string }[];
} {
  const groupIds = new Set<string>();
  const instanceTargets: { key: string; worldId: string; instanceId: string }[] = [];

  for (const [key, bucket] of locations.entries()) {
    const { worldId, instanceId, groupId, type } = bucket.info;
    if (type === 'instance' && worldId && instanceId) {
      instanceTargets.push({ key, worldId, instanceId });
    }
    if (groupId) groupIds.add(groupId);
  }

  return { groupIds, instanceTargets };
}

function applyInstanceEnrichment(
  bucket: LocationBucket,
  instance: InstanceRecord,
  instanceDetailLevel: 'full' | 'summary'
): void {
  bucket.instance =
    instanceDetailLevel === 'full' ? instance : (buildInstanceSummary(instance) ?? instance);

  const info = bucket.info;
  applyInstanceWorldInfo(info, instance);
  applyInstanceWorldId(info, instance);
  applyInstanceRegion(info, instance);
  applyInstanceAccessType(info, instance);
}

function applyInstanceWorldInfo(info: EnrichedLocationInfo, instance: InstanceRecord): void {
  const worldName = instance.world?.name ?? undefined;
  if (worldName) info.worldName = worldName;
}

function applyInstanceWorldId(info: EnrichedLocationInfo, instance: InstanceRecord): void {
  if (info.worldId) return;
  const worldIdFromInstance = instance.worldId ?? instance.world?.id ?? undefined;
  if (worldIdFromInstance) {
    info.worldId = worldIdFromInstance;
  }
}

function applyInstanceRegion(info: EnrichedLocationInfo, instance: InstanceRecord): void {
  const region = instance.region ?? instance.photonRegion ?? undefined;
  if (region) info.region = region;
}

function applyInstanceAccessType(info: EnrichedLocationInfo, instance: InstanceRecord): void {
  const typeValue = instance.type ?? undefined;
  if (typeValue) info.accessType = typeValue;
}

async function enrichLocationsWithInstances(input: {
  locations: Map<string, LocationBucket>;
  instanceTargets: { key: string; worldId: string; instanceId: string }[];
  instanceDetailLevel: 'full' | 'summary';
  strictInstanceFilter: boolean;
}): Promise<void> {
  const { locations, instanceTargets, instanceDetailLevel, strictInstanceFilter } = input;

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
        applyInstanceEnrichment(bucket, instance, instanceDetailLevel);
      } catch (err) {
        if (strictInstanceFilter) {
          throw new Error(formatInstanceError(worldId, instanceId, toInstanceErrorInfo(err)));
        }
        // best-effort enrichment
      }
    })
  );
}

async function fetchGroupInfo(
  groupIds: Set<string>
): Promise<Map<string, { name?: string; shortCode?: string }>> {
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
    })
  );
  return groupInfo;
}

function applyGroupEnrichment(
  locations: Map<string, LocationBucket>,
  groupInfo: Map<string, { name?: string; shortCode?: string }>
): void {
  for (const bucket of locations.values()) {
    const groupId = bucket.info.groupId;
    if (!groupId) continue;
    const info = groupInfo.get(groupId);
    if (!info) continue;
    bucket.info.groupName = info.name;
    bucket.info.groupShortCode = info.shortCode;
  }
}

function buildLocationList(locations: Map<string, LocationBucket>): OverviewLocationEntry[] {
  return [...locations.entries()]
    .sort((a, b) => b[1].friends.length - a[1].friends.length)
    .map(([locationKey, bucket]) => ({
      location: locationKey,
      ...bucket.info,
      instance: bucket.instance,
      friendCount: bucket.friends.length,
      friends: bucket.friends,
    }));
}

function filterLocationsByMinUserCount(
  locations: OverviewLocationEntry[],
  minInstanceUserCount: number | undefined
): OverviewLocationEntry[] {
  if (minInstanceUserCount === undefined) return locations;
  return locations.filter((entry) => {
    const count = getInstanceUserCount(entry.instance);
    return count !== null && count >= minInstanceUserCount;
  });
}

function computeOnlineStatusCounts(locations: OverviewLocationEntry[]): {
  onlineCount: number;
  statusCounts: Record<string, number>;
} {
  const statusCounts: Record<string, number> = {};
  let onlineCount = 0;
  for (const entry of locations) {
    for (const friend of entry.friends) {
      onlineCount += 1;
      const key = friend.status ?? 'unknown';
      statusCounts[key] = (statusCounts[key] ?? 0) + 1;
    }
  }
  return { onlineCount, statusCounts };
}

export async function getFriendsOverview(input: FriendsOverviewInput) {
  const requestedIncludeOffline = input.includeOffline !== false;
  const statusFilterValues =
    normalizeStatusFilter(input.status) ?? normalizeStatusFilter(input.statusFilter);
  const statusFilterSet = statusFilterValues ? new Set(statusFilterValues) : null;
  const includeOffline = requestedIncludeOffline || statusFilterSet?.has('offline') === true;
  const minInstanceUserCount =
    typeof input.minInstanceUserCount === 'number'
      ? Math.max(0, Math.floor(input.minInstanceUserCount))
      : undefined;
  const instanceDetailLevel = input.instanceDetailLevel === 'full' ? 'full' : 'summary';
  const strictInstanceFilter = minInstanceUserCount !== undefined;
  const maxLocations =
    typeof input.maxLocations === 'number'
      ? Math.max(1, Math.floor(input.maxLocations))
      : DEFAULT_OVERVIEW_MAX_LOCATIONS;
  const pageSize = DEFAULT_LIST_PAGE_SIZE;
  const maxPages = DEFAULT_ALL_MAX_PAGES;

  const { friends, meta } = await fetchFriendsWithMeta({
    includeOffline,
    pageSize,
    maxPages,
  });

  const buckets = buildOverviewBuckets(friends, statusFilterSet);
  const { groupIds, instanceTargets } = collectEnrichmentTargets(buckets.locations);

  await enrichLocationsWithInstances({
    locations: buckets.locations,
    instanceTargets,
    instanceDetailLevel,
    strictInstanceFilter,
  });

  const groupInfo = await fetchGroupInfo(groupIds);
  applyGroupEnrichment(buckets.locations, groupInfo);

  const locationList = buildLocationList(buckets.locations);
  const filteredLocations = filterLocationsByMinUserCount(locationList, minInstanceUserCount);
  const returnedLocations = filteredLocations.slice(0, maxLocations);
  const online = computeOnlineStatusCounts(filteredLocations);
  const omittedLocations = Math.max(0, filteredLocations.length - returnedLocations.length);

  const statusCounts: Record<string, number> = { ...buckets.filteredOfflineStatusCounts };
  for (const [key, count] of Object.entries(online.statusCounts)) {
    statusCounts[key] = (statusCounts[key] ?? 0) + count;
  }

  const filteredTotal = online.onlineCount + buckets.filteredOfflineCount;
  const overallTotal = buckets.overallOnlineCount + buckets.overallOfflineCount;

  return {
    includeOffline,
    statusFilter: statusFilterValues,
    minInstanceUserCount,
    instanceDetailLevel,
    totalFriends: filteredTotal,
    onlineCount: online.onlineCount,
    offlineCount: buckets.filteredOfflineCount,
    statusCounts,
    maxLocations,
    totalLocations: filteredLocations.length,
    returnedLocations: returnedLocations.length,
    omittedLocations,
    locationsTruncated: omittedLocations > 0,
    totals: {
      all: {
        totalFriends: overallTotal,
        onlineCount: buckets.overallOnlineCount,
        offlineCount: buckets.overallOfflineCount,
        statusCounts: buckets.overallStatusCounts,
      },
      filtered: {
        totalFriends: filteredTotal,
        onlineCount: online.onlineCount,
        offlineCount: buckets.filteredOfflineCount,
        statusCounts,
      },
    },
    locations: returnedLocations,
    meta,
  };
}

function buildFriendNotFoundResult(
  name: string | undefined,
  userId: string | undefined
): FriendDetailsResult {
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

function buildFriendUserIdNotFoundResult(): FriendDetailsResult {
  return {
    ok: false,
    reason: 'Unable to resolve friend userId.',
    status: 'not_found',
    nextSteps: ['vrchat_friends_search'],
  };
}

function resolveFriendUserId(
  friend: FriendRecord,
  fallbackUserId: string | undefined
): string | null {
  if (typeof friend.id === 'string' && friend.id) return friend.id;
  if (fallbackUserId) return String(fallbackUserId);
  return null;
}

async function enrichLocationWithInstanceContext(
  location: EnrichedLocationInfo
): Promise<{ instance: InstanceSummary | null; world: WorldRecord | null }> {
  if (location.type !== 'instance' || !location.worldId || !location.instanceId) {
    return { instance: null, world: null };
  }

  const { instance: instanceResult } = await getInstanceDetails(
    location.worldId,
    location.instanceId
  );
  if (!instanceResult) {
    return { instance: null, world: null };
  }

  const instance = buildInstanceSummary(instanceResult) ?? null;
  let world: WorldRecord | null = null;
  if (instanceResult.world) {
    world = instanceResult.world ?? null;
    const worldName = instanceResult.world.name;
    if (typeof worldName === 'string' && worldName) {
      location.worldName = worldName;
    }
  }

  const region = instanceResult.region ?? instanceResult.photonRegion ?? undefined;
  if (region) location.region = region;
  const typeValue = instanceResult.type ?? undefined;
  if (typeValue) location.accessType = typeValue;

  return { instance, world };
}

async function enrichLocationWithGroupContext(
  location: EnrichedLocationInfo
): Promise<GroupRecord | null> {
  if (!location.groupId) return null;

  const groupResult = await getGroupProfile(location.groupId);
  const group = groupResult.group ?? null;
  const groupInfo = extractGroupInfo(group);
  if (groupInfo) {
    location.groupName = groupInfo.name;
    location.groupShortCode = groupInfo.shortCode;
  }
  return group;
}

export async function getFriendDetails(input: FriendDetailsInput): Promise<FriendDetailsResult> {
  const name = typeof input.name === 'string' ? input.name : undefined;
  const userId = typeof input.userId === 'string' ? input.userId : undefined;
  const includeOffline = input.includeOffline !== false;

  const friends = await fetchFriends({ includeOffline });
  const target = findFriendByNameOrId(friends, { name, userId });

  if (!target) return buildFriendNotFoundResult(name, userId);

  const location = parseLocation(
    typeof target.location === 'string' ? target.location : undefined
  ) as EnrichedLocationInfo;

  const resolvedUserId = resolveFriendUserId(target, userId);
  if (!resolvedUserId) return buildFriendUserIdNotFoundResult();

  const profileResult = await callReadOperationParsed('getUser', {
    userId: resolvedUserId,
  });
  const profile = profileResult.data ?? {};

  const { instance, world } = await enrichLocationWithInstanceContext(location);
  const group = await enrichLocationWithGroupContext(location);

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
