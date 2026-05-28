import {
  type FavoriteAddInput,
  type FavoriteGroupSummary,
  type FavoriteRemoveInput,
  type FavoriteSummary,
  type FavoritesReadInput,
  type FavoritedAvatarSummary,
  toFavoriteGroupSummary,
  toFavoriteSummary,
  toFavoritedAvatarSummary,
} from '../../models/favorites.js';
import { callReadOperationParsed, callWriteOperationParsed } from '../api/client.js';
import { cacheManager } from '../cache.js';
import { nonEmptyString } from '../../utils/strings.js';

const DEFAULT_PAGE_SIZE = 50;
const DEFAULT_MAX_PAGES = 5;

interface PageInfo {
  pages: number;
  items: number;
  pageSize: number;
  offsetStart: number;
  truncated: boolean;
}

function pageOptions(input: FavoritesReadInput): {
  pageSize: number;
  maxPages: number;
  maxItems?: number;
  offset?: number;
} {
  return {
    pageSize: typeof input.pageSize === 'number' ? Math.floor(input.pageSize) : DEFAULT_PAGE_SIZE,
    maxPages: typeof input.maxPages === 'number' ? Math.floor(input.maxPages) : DEFAULT_MAX_PAGES,
    maxItems: typeof input.maxItems === 'number' ? Math.floor(input.maxItems) : undefined,
    offset: typeof input.offset === 'number' ? Math.floor(input.offset) : undefined,
  };
}

function readPage(input: FavoritesReadInput) {
  const page = pageOptions(input);
  return {
    enabled: true,
    size: page.pageSize,
    maxPages: page.maxPages,
    maxItems: page.maxItems,
    offset: page.offset,
  };
}

function compact<T>(items: T[], map: (item: T) => FavoriteSummary | FavoriteGroupSummary | FavoritedAvatarSummary | null) {
  return items.map(map).filter((entry): entry is NonNullable<ReturnType<typeof map>> => Boolean(entry));
}

export async function listFavorites(input: FavoritesReadInput): Promise<{
  favorites: FavoriteSummary[];
  page?: PageInfo;
}> {
  const result = await callReadOperationParsed(
    'getFavorites',
    {
      type: input.type,
      tag: nonEmptyString(input.tag),
      n: pageOptions(input).pageSize,
      offset: pageOptions(input).offset,
    },
    { page: readPage(input) }
  );
  return {
    favorites: compact(result.data, toFavoriteSummary) as FavoriteSummary[],
    page: result.page,
  };
}

export async function listFavoriteGroups(input: FavoritesReadInput): Promise<{
  groups: FavoriteGroupSummary[];
  page?: PageInfo;
}> {
  const result = await callReadOperationParsed(
    'getFavoriteGroups',
    {
      userId: input.userId,
      ownerId: input.ownerId,
      n: pageOptions(input).pageSize,
      offset: pageOptions(input).offset,
    },
    { page: readPage(input) }
  );
  return {
    groups: compact(result.data, toFavoriteGroupSummary) as FavoriteGroupSummary[],
    page: result.page,
  };
}

export async function getFavoriteGroup(input: FavoritesReadInput): Promise<{
  group: FavoriteGroupSummary | null;
}> {
  if (!input.favoriteGroupType || !input.favoriteGroupName || !input.userId) {
    throw new Error('favoriteGroupType, favoriteGroupName, and userId are required for view="group".');
  }
  const result = await callReadOperationParsed('getFavoriteGroup', {
    favoriteGroupType: input.favoriteGroupType,
    favoriteGroupName: input.favoriteGroupName,
    userId: input.userId,
  });
  return { group: result.data ? toFavoriteGroupSummary(result.data) : null };
}

export async function getFavoriteLimits(): Promise<{ limits: unknown }> {
  const result = await callReadOperationParsed('getFavoriteLimits');
  return { limits: result.data };
}

export async function listFavoritedAvatars(input: FavoritesReadInput): Promise<{
  avatars: FavoritedAvatarSummary[];
  page?: PageInfo;
}> {
  const page = pageOptions(input);
  const result = await callReadOperationParsed(
    'getFavoritedAvatars',
    {
      search: nonEmptyString(input.query),
      featured: input.featured,
      sort: nonEmptyString(input.sort),
      order: nonEmptyString(input.order),
      tag: nonEmptyString(input.tag),
      notag: nonEmptyString(input.notag),
      releaseStatus: nonEmptyString(input.releaseStatus),
      maxUnityVersion: nonEmptyString(input.maxUnityVersion),
      minUnityVersion: nonEmptyString(input.minUnityVersion),
      platform: nonEmptyString(input.platform),
      userId: input.userId,
      n: page.pageSize,
      offset: page.offset,
    },
    { page: readPage(input) }
  );
  return {
    avatars: compact(result.data, toFavoritedAvatarSummary) as FavoritedAvatarSummary[],
    page: result.page,
  };
}

export async function addFavorite(input: FavoriteAddInput): Promise<{ favorite: FavoriteSummary | null }> {
  const result = await callWriteOperationParsed('addFavorite', undefined, {
    type: input.type,
    favoriteId: input.targetId,
    tags: input.tags,
  });
  cacheManager.invalidateByTag('worlds:favorites');
  const favorite = result.data ? toFavoriteSummary(result.data) : null;
  return { favorite };
}

export async function removeFavorite(input: FavoriteRemoveInput): Promise<{ result: unknown }> {
  const result = await callWriteOperationParsed('removeFavorite', {
    favoriteId: input.favoriteRecordId,
  });
  cacheManager.invalidateByTag('worlds:favorites');
  return { result: result.data };
}
