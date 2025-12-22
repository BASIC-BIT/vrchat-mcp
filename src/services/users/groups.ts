import { callOperation } from '../../core/client.js';
import { buildCacheKey, cacheConfig, cacheManager } from '../cache.js';

export interface UserGroupSummary {
  groupId: string;
  name?: string;
  shortCode?: string;
}

export interface UserGroupsPageInfo {
  pages: number;
  items: number;
  pageSize: number;
  offsetStart: number;
  truncated: boolean;
}

export interface UserGroupsMeta {
  total: number;
  truncated: boolean;
  stale: boolean;
  page: UserGroupsPageInfo;
}

export interface UserGroupsFetchOptions {
  userId: string;
  pageSize?: number;
  maxPages?: number;
  offset?: number;
}

export interface UserGroupsFetchResult {
  userId: string;
  groups: UserGroupSummary[];
  meta: UserGroupsMeta;
}

function mapGroup(entry: unknown): UserGroupSummary | null {
  if (!entry || typeof entry !== 'object') return null;
  const record = entry as Record<string, unknown>;
  const idRaw = record.groupId ?? record.id;
  const groupId = typeof idRaw === 'string' ? idRaw : '';
  if (!groupId) return null;
  const name = typeof record.name === 'string' ? record.name : undefined;
  const shortCode = typeof record.shortCode === 'string' ? record.shortCode : undefined;
  return { groupId, name, shortCode };
}

export async function fetchUserGroupsWithMeta(
  options: UserGroupsFetchOptions,
): Promise<UserGroupsFetchResult> {
  const pageSize = Math.max(1, Math.floor(options.pageSize ?? 100));
  const maxPages = Math.max(1, Math.floor(options.maxPages ?? 100));
  const offset = Math.max(0, Math.floor(options.offset ?? 0));
  const maxItems = pageSize * maxPages;
  const cacheKey = buildCacheKey('user:groups', { userId: options.userId });
  const tags = ['user-groups', `user-groups:${options.userId}`];

  const { value, stale } = await cacheManager.getOrSetStale(
    cacheKey,
    cacheConfig.userGroupsTtlMs,
    cacheConfig.userGroupsStaleTtlMs,
    tags,
    async () => {
      const result = await callOperation({
        operationId: 'getUserGroups',
        params: { userId: options.userId },
      });
      const data = Array.isArray(result.data) ? result.data : [];
      const groups = data.map(mapGroup).filter((group): group is UserGroupSummary => Boolean(group));
      return { groups };
    },
  );

  const total = value.groups.length;
  const groups = value.groups.slice(offset, offset + maxItems);
  const truncated = offset + groups.length < total;
  const pageInfo: UserGroupsPageInfo = {
    pages: Math.ceil(groups.length / pageSize),
    items: groups.length,
    pageSize,
    offsetStart: offset,
    truncated,
  };

  return {
    userId: options.userId,
    groups,
    meta: {
      total,
      truncated,
      stale,
      page: pageInfo,
    },
  };
}

export async function fetchUserGroups(options: UserGroupsFetchOptions): Promise<UserGroupSummary[]> {
  const result = await fetchUserGroupsWithMeta(options);
  return result.groups;
}
