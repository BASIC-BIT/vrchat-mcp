import { callOperation } from '../../core/client.js';
import { type UserGroupsOutput } from '../../models/users.js';
import { fetchUserGroupsWithMeta, type UserGroupSummary } from './groups.js';

export type UserResolution =
  | { ok: true; userId: string }
  | { ok: false; reason: string };

export type UserProfileResolution =
  | { ok: true; user: unknown; userId: string }
  | { ok: false; reason: string };

function buildGroupsPayload(
  userId: string,
  groups: UserGroupSummary[],
  meta: { total: number; truncated: boolean; stale: boolean; page: { pages: number; items: number; pageSize: number; offsetStart: number; truncated: boolean } },
  pageSize: number,
  maxPages: number,
): UserGroupsOutput {
  return {
    userId,
    pageSize,
    maxPages,
    totalGroups: meta.total,
    truncated: meta.truncated,
    stale: meta.stale,
    page: meta.page,
    groups,
  };
}

export async function resolveUserId(
  args: { userId?: string; username?: string } | undefined,
): Promise<UserResolution> {
  if (args?.userId) {
    return { ok: true, userId: String(args.userId) };
  }

  if (args?.username) {
    const result = await callOperation({
      operationId: 'getUserByName',
      params: { username: args.username },
    });
    const user = result.data ?? null;
    const userId =
      typeof (user as Record<string, unknown> | null)?.id === 'string'
        ? String((user as Record<string, unknown>).id)
        : '';
    if (!userId) {
      return { ok: false, reason: 'Unable to resolve userId from username.' };
    }
    return { ok: true, userId };
  }

  const result = await callOperation({ operationId: 'getCurrentUser' });
  const user = result.data ?? null;
  const userId =
    typeof (user as Record<string, unknown> | null)?.id === 'string'
      ? String((user as Record<string, unknown>).id)
      : '';
  if (!userId) {
    return { ok: false, reason: 'Unable to resolve current user id.' };
  }
  return { ok: true, userId };
}

export async function resolveUserProfile(
  args: { userId?: string; username?: string } | undefined,
): Promise<UserProfileResolution> {
  if (args?.userId) {
    const result = await callOperation({
      operationId: 'getUser',
      params: { userId: args.userId },
    });
    const user = result.data ?? null;
    const userId =
      typeof (user as Record<string, unknown> | null)?.id === 'string'
        ? String((user as Record<string, unknown>).id)
        : String(args.userId);
    return { ok: true, user, userId };
  }

  if (args?.username) {
    const result = await callOperation({
      operationId: 'getUserByName',
      params: { username: args.username },
    });
    const user = result.data ?? null;
    const userId =
      typeof (user as Record<string, unknown> | null)?.id === 'string'
        ? String((user as Record<string, unknown>).id)
        : '';
    if (!userId) {
      return { ok: false, reason: 'Unable to resolve userId from username.' };
    }
    return { ok: true, user, userId };
  }

  const result = await callOperation({ operationId: 'getCurrentUser' });
  const user = result.data ?? null;
  const userId =
    typeof (user as Record<string, unknown> | null)?.id === 'string'
      ? String((user as Record<string, unknown>).id)
      : '';
  if (!userId) {
    return { ok: false, reason: 'Unable to resolve current user id.' };
  }
  return { ok: true, user, userId };
}

export async function listUserGroups(input: {
  userId: string;
  pageSize: number;
  maxPages: number;
  offset: number;
}): Promise<UserGroupsOutput> {
  const { groups, meta } = await fetchUserGroupsWithMeta({
    userId: input.userId,
    pageSize: input.pageSize,
    maxPages: input.maxPages,
    offset: input.offset,
  });

  return buildGroupsPayload(input.userId, groups, meta, input.pageSize, input.maxPages);
}
