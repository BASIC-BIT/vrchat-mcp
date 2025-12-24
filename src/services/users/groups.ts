import type { z } from 'zod';
import { callReadOperationParsed } from '../api/client.js';
import { buildCacheKey, cacheConfig, cacheManager } from '../cache.js';
import type { schemas } from '../../generated/vrchat-schemas.js';

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

function toUserGroupSummary(
  group: z.infer<typeof schemas.LimitedUserGroups>,
): UserGroupSummary | null {
  const groupId = group.groupId ?? '';
  if (!groupId) return null;
  return {
    groupId,
    name: group.name ?? undefined,
    shortCode: group.shortCode ?? undefined,
  };
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
      const result = await callReadOperationParsed('getUserGroups', {
        userId: options.userId,
      });
      const groups = result.data
        .map(toUserGroupSummary)
        .filter((group): group is UserGroupSummary => Boolean(group));
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
