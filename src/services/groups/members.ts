import { callWithRetry, sleep, type RetryOptions } from '../../core/retry.js';
import {
  toGroupMemberSummary,
  type GroupMemberSummary,
  type GroupMembersInput,
} from '../../models/groups.js';
import { callReadOperationParsed } from '../api/client.js';
import { buildCacheKey, cacheConfig, cacheManager, isCacheEnabled } from '../cache.js';

interface PageInfo {
  pages: number;
  items: number;
  pageSize: number;
  offsetStart: number;
  truncated: boolean;
}

interface GroupMemberPageValue {
  members: GroupMemberSummary[];
  rawItems: number;
  page: PageInfo;
}

interface GroupMemberSnapshotValue {
  members: GroupMemberSummary[];
  page: PageInfo;
  truncated: boolean;
}

export interface GroupMembersResult extends GroupMemberSnapshotValue {
  view: 'page' | 'all';
  stale: boolean;
}

export const GROUP_MEMBER_PAGE_SIZE = 100;
export const GROUP_MEMBER_SNAPSHOT_MAX_PAGES = 100;
export const GROUP_MEMBER_SNAPSHOT_MAX_ITEMS =
  GROUP_MEMBER_PAGE_SIZE * GROUP_MEMBER_SNAPSHOT_MAX_PAGES;
export const GROUP_MEMBER_INTER_PAGE_DELAY_MS = 250;
export const GROUP_MEMBER_SNAPSHOT_MAX_ELAPSED_MS = 120_000;

const GROUP_MEMBER_RETRY: RetryOptions = {
  maxAttempts: 4,
  baseDelayMs: 1_000,
  maxDelayMs: 30_000,
};

function groupMemberTags(groupId: string): string[] {
  return ['groups', `groups:${groupId}`, `group-members:${groupId}`];
}

function pageCacheKey(input: {
  groupId: string;
  roleId?: string;
  sort?: string;
  pageSize: number;
  offset: number;
}): string {
  return buildCacheKey('groups:members:page', input);
}

function snapshotCacheKey(input: { groupId: string; roleId?: string; sort?: string }): string {
  return buildCacheKey('groups:members:snapshot', input);
}

function dedupeMembers(members: GroupMemberSummary[]): GroupMemberSummary[] {
  const byId = new Map<string, GroupMemberSummary>();
  for (const member of members) {
    if (!byId.has(member.userId)) byId.set(member.userId, member);
  }
  return [...byId.values()];
}

async function fetchGroupMemberPage(input: {
  groupId: string;
  roleId?: string;
  sort?: string;
  pageSize: number;
  offset: number;
  maxElapsedMs?: number;
}): Promise<GroupMemberPageValue> {
  const { data: result } = await callWithRetry(
    () =>
      callReadOperationParsed(
        'getGroupMembers',
        {
          groupId: input.groupId,
          roleId: input.roleId,
          sort: input.sort,
          offset: input.offset,
        },
        {
          page: {
            enabled: true,
            size: input.pageSize,
            maxPages: 1,
            maxItems: input.pageSize,
          },
        }
      ),
    { ...GROUP_MEMBER_RETRY, maxElapsedMs: input.maxElapsedMs }
  );

  const members = result.data
    .map(toGroupMemberSummary)
    .filter((member): member is GroupMemberSummary => Boolean(member));
  const page = result.page ?? {
    pages: 1,
    items: result.data.length,
    pageSize: input.pageSize,
    offsetStart: input.offset,
    truncated: result.data.length >= input.pageSize,
  };

  return {
    members: dedupeMembers(members),
    rawItems: result.data.length,
    page,
  };
}

async function getFreshSnapshotPage(input: {
  groupId: string;
  roleId?: string;
  sort?: string;
  offset: number;
  maxElapsedMs: number;
}): Promise<{ value: GroupMemberPageValue; fetched: boolean }> {
  const keyInput = {
    groupId: input.groupId,
    roleId: input.roleId,
    sort: input.sort,
    pageSize: GROUP_MEMBER_PAGE_SIZE,
    offset: input.offset,
  };
  const key = pageCacheKey(keyInput);
  const cacheEnabled = isCacheEnabled();
  const cached = cacheEnabled ? cacheManager.get<GroupMemberPageValue>(key) : undefined;
  if (cached) return { value: cached, fetched: false };

  const value = await fetchGroupMemberPage({ ...keyInput, maxElapsedMs: input.maxElapsedMs });
  if (cacheEnabled) {
    cacheManager.set(key, value, cacheConfig.groupsTtlMs, groupMemberTags(input.groupId));
  }
  return { value, fetched: true };
}

async function loadGroupMemberSnapshot(input: {
  groupId: string;
  roleId?: string;
  sort?: string;
}): Promise<GroupMemberSnapshotValue> {
  const startedAt = Date.now();
  const members: GroupMemberSummary[] = [];
  let rawItems = 0;
  let pages = 0;
  let lastBatchSize = 0;

  while (pages < GROUP_MEMBER_SNAPSHOT_MAX_PAGES && rawItems < GROUP_MEMBER_SNAPSHOT_MAX_ITEMS) {
    const elapsedMs = Date.now() - startedAt;
    const remainingMs = GROUP_MEMBER_SNAPSHOT_MAX_ELAPSED_MS - elapsedMs;
    if (remainingMs <= 0) {
      throw new Error('Group member snapshot exceeded its 120 second deadline.');
    }

    const { value, fetched } = await getFreshSnapshotPage({
      ...input,
      offset: pages * GROUP_MEMBER_PAGE_SIZE,
      maxElapsedMs: remainingMs,
    });
    members.push(...value.members);
    rawItems += value.rawItems;
    pages += 1;
    lastBatchSize = value.rawItems;

    if (!value.page.truncated || lastBatchSize < GROUP_MEMBER_PAGE_SIZE) break;
    if (pages >= GROUP_MEMBER_SNAPSHOT_MAX_PAGES) break;

    if (fetched) {
      const remainingAfterFetch = GROUP_MEMBER_SNAPSHOT_MAX_ELAPSED_MS - (Date.now() - startedAt);
      if (remainingAfterFetch <= GROUP_MEMBER_INTER_PAGE_DELAY_MS) {
        throw new Error('Group member snapshot exceeded its 120 second deadline.');
      }
      await sleep(GROUP_MEMBER_INTER_PAGE_DELAY_MS);
    }
  }

  const deduped = dedupeMembers(members);
  const truncated =
    pages >= GROUP_MEMBER_SNAPSHOT_MAX_PAGES && lastBatchSize >= GROUP_MEMBER_PAGE_SIZE;
  return {
    members: deduped,
    page: {
      pages,
      items: deduped.length,
      pageSize: GROUP_MEMBER_PAGE_SIZE,
      offsetStart: 0,
      truncated,
    },
    truncated,
  };
}

async function listGroupMemberPage(
  groupId: string,
  input: GroupMembersInput
): Promise<GroupMembersResult> {
  const pageSize =
    typeof input.pageSize === 'number' ? Math.floor(input.pageSize) : GROUP_MEMBER_PAGE_SIZE;
  const offset = typeof input.offset === 'number' ? Math.floor(input.offset) : 0;
  const roleId = typeof input.roleId === 'string' ? input.roleId : undefined;
  const sort = typeof input.sort === 'string' ? input.sort : undefined;
  const key = pageCacheKey({ groupId, roleId, sort, pageSize, offset });
  const { value, stale } = await cacheManager.getOrSetStale(
    key,
    cacheConfig.groupsTtlMs,
    cacheConfig.groupsStaleTtlMs,
    groupMemberTags(groupId),
    () => fetchGroupMemberPage({ groupId, roleId, sort, pageSize, offset })
  );

  return {
    view: 'page',
    members: value.members,
    page: value.page,
    truncated: value.page.truncated,
    stale,
  };
}

async function listAllGroupMembers(
  groupId: string,
  input: GroupMembersInput
): Promise<GroupMembersResult> {
  const roleId = typeof input.roleId === 'string' ? input.roleId : undefined;
  const sort = typeof input.sort === 'string' ? input.sort : undefined;
  const key = snapshotCacheKey({ groupId, roleId, sort });
  const { value, stale } = await cacheManager.getOrSetStale(
    key,
    cacheConfig.groupsTtlMs,
    cacheConfig.groupsStaleTtlMs,
    groupMemberTags(groupId),
    () => loadGroupMemberSnapshot({ groupId, roleId, sort })
  );

  return { view: 'all', ...value, stale };
}

export async function listGroupMembers(
  groupId: string,
  input: GroupMembersInput
): Promise<GroupMembersResult> {
  return input.view === 'all'
    ? listAllGroupMembers(groupId, input)
    : listGroupMemberPage(groupId, input);
}
