import type { z } from 'zod';
import { callReadOperationParsed } from '../api/client.js';
import { buildCacheKey, cacheConfig, cacheManager } from '../cache.js';
import {
  buildWorldSummary,
  normalizeWorldName,
  type WorldFavoritesInput,
  type WorldInstancesSummary,
  type WorldResolution,
  type WorldSearchInput,
  type WorldSummary,
} from '../../models/worlds.js';
import type { schemas } from '../../generated/vrchat-schemas.js';

const CACHE_TTL_MS = cacheConfig.groupsTtlMs;
const CACHE_STALE_TTL_MS = cacheConfig.groupsStaleTtlMs;
const INSTANCE_TTL_MS = cacheConfig.notificationsTtlMs;
const INSTANCE_STALE_TTL_MS = cacheConfig.notificationsStaleTtlMs;

const DEFAULT_PAGE_SIZE = 50;
const DEFAULT_MAX_PAGES = 5;
type WorldRecord = Partial<z.infer<typeof schemas.World>>;
type FavoritedWorldRecord = Partial<z.infer<typeof schemas.FavoritedWorld>>;

interface PageOptions {
  pageSize: number;
  maxPages: number;
  maxItems?: number;
  offset?: number;
}

interface WorldSearchParams extends Record<string, unknown> {
  search?: string;
  n?: number;
  offset?: number;
  featured?: boolean;
  sort?: string;
  order?: string;
  tag?: string;
  notag?: string;
  releaseStatus?: string;
  maxUnityVersion?: string;
  minUnityVersion?: string;
  platform?: string;
  userId?: string;
}

interface CachedWorldList<T> {
  worlds: T[];
  page?: {
    pages: number;
    items: number;
    pageSize: number;
    offsetStart: number;
    truncated: boolean;
  };
}

function readPageOptions(
  input: {
    pageSize?: number;
    maxPages?: number;
    maxItems?: number;
    offset?: number;
  },
  defaults: { pageSize: number; maxPages: number },
): PageOptions {
  const pageSize =
    typeof input.pageSize === 'number' ? Math.floor(input.pageSize) : defaults.pageSize;
  const maxPages =
    typeof input.maxPages === 'number' ? Math.floor(input.maxPages) : defaults.maxPages;
  const maxItems =
    typeof input.maxItems === 'number' ? Math.floor(input.maxItems) : undefined;
  const offset =
    typeof input.offset === 'number' ? Math.floor(input.offset) : undefined;
  return { pageSize, maxPages, maxItems, offset };
}

async function fetchWorldSearchCached(
  cacheKeyParams: Record<string, string | number | boolean | null | undefined>,
  params: WorldSearchParams,
  page: PageOptions,
): Promise<{ value: CachedWorldList<WorldRecord>; stale: boolean }> {
  const cacheKey = buildCacheKey('worlds:search', cacheKeyParams);
  return await cacheManager.getOrSetStale(
    cacheKey,
    CACHE_TTL_MS,
    CACHE_STALE_TTL_MS,
    ['worlds', 'worlds:search'],
    async () => {
      const result = await callReadOperationParsed('searchWorlds', params, {
        page: {
          enabled: true,
          size: page.pageSize,
          maxPages: page.maxPages,
          maxItems: page.maxItems,
          offset: page.offset,
        },
      });
      return { worlds: result.data, page: result.page };
    },
  );
}

async function fetchWorldFavoritesCached(
  cacheKeyParams: Record<string, string | number | boolean | null | undefined>,
  params: WorldSearchParams,
  page: PageOptions,
): Promise<{
  value: CachedWorldList<FavoritedWorldRecord>;
  stale: boolean;
}> {
  const cacheKey = buildCacheKey('worlds:favorites', cacheKeyParams);
  return await cacheManager.getOrSetStale(
    cacheKey,
    CACHE_TTL_MS,
    CACHE_STALE_TTL_MS,
    ['worlds', 'worlds:favorites'],
    async () => {
      const result = await callReadOperationParsed('getFavoritedWorlds', params, {
        page: {
          enabled: true,
          size: page.pageSize,
          maxPages: page.maxPages,
          maxItems: page.maxItems,
          offset: page.offset,
        },
      });
      return { worlds: result.data, page: result.page };
    },
  );
}

async function fetchWorldProfileCached(
  worldId: string,
  ttlMs = CACHE_TTL_MS,
  staleTtlMs = CACHE_STALE_TTL_MS,
) {
  const cacheKey = buildCacheKey('worlds:profile', { worldId });
  return await cacheManager.getOrSetStale(
    cacheKey,
    ttlMs,
    staleTtlMs,
    ['worlds', 'worlds:profile'],
    async () => {
      const result = await callReadOperationParsed('getWorld', { worldId });
      return result.data;
    },
  );
}

function extractAccessType(location: string | undefined): string {
  if (!location) return 'unknown';
  if (location.includes('~group(') || location.includes('~groupAccessType')) {
    return 'group';
  }
  if (location.includes('~private')) return 'private';
  if (location.includes('~friends')) return 'friends';
  if (location.includes('~hidden')) return 'hidden';
  if (location.includes('~public')) return 'public';
  return location.includes('~') ? 'custom' : 'public';
}

function extractRegion(location: string | undefined): string | undefined {
  if (!location) return undefined;
  const match = /~region\(([^)]+)\)/i.exec(location);
  if (!match) return undefined;
  return match[1];
}

function summarizeInstances(raw: WorldRecord['instances']): WorldInstancesSummary {
  if (!Array.isArray(raw)) {
    return {
      totalInstances: 0,
      totalOccupants: 0,
      countsByAccess: {},
      countsByRegion: {},
    };
  }
  let totalInstances = 0;
  let totalOccupants = 0;
  const countsByAccess: Record<string, number> = {};
  const countsByRegion: Record<string, number> = {};

  for (const entry of raw) {
    if (!Array.isArray(entry) || entry.length === 0) continue;
    totalInstances += 1;
    const location = typeof entry[0] === 'string' ? entry[0] : undefined;
    const occupants = typeof entry[1] === 'number' ? entry[1] : 0;
    totalOccupants += occupants;

    const access = extractAccessType(location);
    countsByAccess[access] = (countsByAccess[access] ?? 0) + 1;

    const region = extractRegion(location);
    if (region) {
      countsByRegion[region] = (countsByRegion[region] ?? 0) + 1;
    }
  }

  return {
    totalInstances,
    totalOccupants,
    countsByAccess,
    countsByRegion,
  };
}

export async function searchWorlds(
  input: WorldSearchInput,
): Promise<{
  worlds: WorldSummary[];
  page?: CachedWorldList<WorldRecord>['page'];
  stale: boolean;
}> {
  const page = readPageOptions(input, {
    pageSize: DEFAULT_PAGE_SIZE,
    maxPages: DEFAULT_MAX_PAGES,
  });
  const cacheKeyParams: Record<string, string | number | boolean | null | undefined> = {
    search: input.query,
    n: page.pageSize,
    maxPages: page.maxPages,
    maxItems: page.maxItems,
    offset: page.offset,
    featured: input.featured,
    sort: input.sort,
    order: input.order,
    tag: input.tag,
    notag: input.notag,
    releaseStatus: input.releaseStatus,
    maxUnityVersion: input.maxUnityVersion,
    minUnityVersion: input.minUnityVersion,
    platform: input.platform,
  };
  const params: WorldSearchParams = {
    search: input.query,
    n: page.pageSize,
    offset: page.offset,
    featured: input.featured,
    sort: input.sort,
    order: input.order,
    tag: input.tag,
    notag: input.notag,
    releaseStatus: input.releaseStatus,
    maxUnityVersion: input.maxUnityVersion,
    minUnityVersion: input.minUnityVersion,
    platform: input.platform,
  };

  const { value, stale } = await fetchWorldSearchCached(cacheKeyParams, params, page);
  const summaries = value.worlds
    .map(buildWorldSummary)
    .filter((entry): entry is WorldSummary => Boolean(entry));

  return {
    worlds: summaries,
    page: value.page,
    stale,
  };
}

export async function listFavoriteWorlds(
  input: WorldFavoritesInput,
): Promise<{
  worlds: WorldSummary[];
  page?: CachedWorldList<FavoritedWorldRecord>['page'];
  stale: boolean;
}> {
  const page = readPageOptions(input, {
    pageSize: DEFAULT_PAGE_SIZE,
    maxPages: DEFAULT_MAX_PAGES,
  });
  const cacheKeyParams: Record<string, string | number | boolean | null | undefined> = {
    search: typeof input.query === 'string' ? input.query : undefined,
    n: page.pageSize,
    maxPages: page.maxPages,
    maxItems: page.maxItems,
    offset: page.offset,
    featured: input.featured,
    sort: input.sort,
    order: input.order,
    tag: input.tag,
    notag: input.notag,
    releaseStatus: input.releaseStatus,
    maxUnityVersion: input.maxUnityVersion,
    minUnityVersion: input.minUnityVersion,
    platform: input.platform,
    userId: input.userId,
  };
  const params: WorldSearchParams = {
    search: typeof input.query === 'string' ? input.query : undefined,
    n: page.pageSize,
    offset: page.offset,
    featured: input.featured,
    sort: input.sort,
    order: input.order,
    tag: input.tag,
    notag: input.notag,
    releaseStatus: input.releaseStatus,
    maxUnityVersion: input.maxUnityVersion,
    minUnityVersion: input.minUnityVersion,
    platform: input.platform,
    userId: input.userId,
  };

  const { value, stale } = await fetchWorldFavoritesCached(cacheKeyParams, params, page);
  const summaries = value.worlds
    .map(buildWorldSummary)
    .filter((entry): entry is WorldSummary => Boolean(entry));

  return {
    worlds: summaries,
    page: value.page,
    stale,
  };
}

export async function resolveWorldId(args: {
  worldId?: string;
  name?: string;
}): Promise<WorldResolution> {
  const worldId = typeof args.worldId === 'string' ? args.worldId : undefined;
  if (worldId) return { ok: true, worldId, resolvedBy: 'id' };
  const name = typeof args.name === 'string' ? args.name : undefined;
  if (!name) {
    return {
      ok: false,
      reason: 'Provide worldId or name.',
      status: 'not_found',
      nextSteps: ['vrchat_worlds_search'],
    };
  }

  const searchResult = await searchWorlds({
    query: name,
    pageSize: 50,
    maxPages: 1,
    maxItems: 50,
  });
  const normalized = normalizeWorldName(name);
  const matches = searchResult.worlds.filter(
    (world) => normalizeWorldName(world.name) === normalized,
  );

  if (matches.length === 1) {
    return { ok: true, worldId: matches[0].worldId, resolvedBy: 'name' };
  }

  const reason =
    matches.length === 0
      ? `No world found matching "${name}".`
      : `Multiple worlds matched "${name}".`;
  return {
    ok: false,
    reason,
    status: 'not_found',
    nextSteps: ['vrchat_worlds_search'],
  };
}

export async function getWorldProfile(
  worldId: string,
  ttlMs = CACHE_TTL_MS,
  staleTtlMs = CACHE_STALE_TTL_MS,
): Promise<{ world: WorldRecord | null; stale: boolean }> {
  const result = await fetchWorldProfileCached(worldId, ttlMs, staleTtlMs);
  return { world: result.value, stale: result.stale };
}

export async function getWorldInstancesOverview(
  worldId: string,
): Promise<{ summary: WorldInstancesSummary; stale: boolean }> {
  const result = await fetchWorldProfileCached(
    worldId,
    INSTANCE_TTL_MS,
    INSTANCE_STALE_TTL_MS,
  );
  const world = result.value;
  const summary = summarizeInstances(world?.instances);
  return { summary, stale: result.stale };
}
