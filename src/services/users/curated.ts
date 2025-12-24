import type { z } from 'zod';
import type { schemas } from '../../generated/vrchat-schemas.js';
import { type ProfileUpdateInput, type ProfileUpdateOutput, type UserGroupsOutput } from '../../models/users.js';
import {
  callReadOperationParsed,
  callWriteOperationParsed,
  type ReadOperationData,
} from '../api/client.js';
import { fetchUserGroupsWithMeta, type UserGroupSummary } from './groups.js';

export type UserResolution =
  | { ok: true; userId: string }
  | { ok: false; reason: string };

export type UserProfileResolution =
  | { ok: true; user: UserProfileRecord; userId: string }
  | { ok: false; reason: string };

type UserProfileRecord = NonNullable<ReadOperationData<'getUser'>> | NonNullable<ReadOperationData<'getCurrentUser'>>;
type CurrentUserRecord = NonNullable<ReadOperationData<'getCurrentUser'>>;
type UpdateUserRequest = z.infer<typeof schemas.UpdateUserRequest>;

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
    const result = await callReadOperationParsed('getUserByName', {
      username: args.username,
    });
    const user = result.data;
    const userId =
      user && typeof user.id === 'string' ? String(user.id) : '';
    if (!userId) {
      return { ok: false, reason: 'Unable to resolve userId from username.' };
    }
    return { ok: true, userId };
  }

  const result = await callReadOperationParsed('getCurrentUser', {});
  const user = result.data;
  const userId = user && typeof user.id === 'string' ? String(user.id) : '';
  if (!userId) {
    return { ok: false, reason: 'Unable to resolve current user id.' };
  }
  return { ok: true, userId };
}

export async function resolveUserProfile(
  args: { userId?: string; username?: string } | undefined,
): Promise<UserProfileResolution> {
  if (args?.userId) {
    const result = await callReadOperationParsed('getUser', { userId: args.userId });
    const user = result.data;
    if (!user) {
      return { ok: false, reason: 'User not found.' };
    }
    const userId = user && typeof user.id === 'string' ? String(user.id) : String(args.userId);
    return { ok: true, user, userId };
  }

  if (args?.username) {
    const result = await callReadOperationParsed('getUserByName', {
      username: args.username,
    });
    const user = result.data;
    if (!user) {
      return { ok: false, reason: 'User not found for username.' };
    }
    const userId = user && typeof user.id === 'string' ? String(user.id) : '';
    if (!userId) {
      return { ok: false, reason: 'Unable to resolve userId from username.' };
    }
    return { ok: true, user, userId };
  }

  const result = await callReadOperationParsed('getCurrentUser', {});
  const user = result.data;
  if (!user) {
    return { ok: false, reason: 'Unable to resolve current user profile.' };
  }
  const userId = user && typeof user.id === 'string' ? String(user.id) : '';
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

function buildProfileUpdateBody(input: ProfileUpdateInput, current: CurrentUserRecord) {
  const body: UpdateUserRequest = {};
  if (typeof input.bio === 'string') body.bio = input.bio;
  if (Array.isArray(input.bioLinks)) body.bioLinks = input.bioLinks;
  if (typeof input.pronouns === 'string') body.pronouns = input.pronouns;
  if (typeof input.userIcon === 'string') body.userIcon = input.userIcon;
  if (typeof input.isBoopingEnabled === 'boolean') body.isBoopingEnabled = input.isBoopingEnabled;
  if (Array.isArray(input.contentFilters)) body.contentFilters = input.contentFilters;

  const status = typeof current.status === 'string' ? current.status : undefined;
  if (!status) {
    throw new Error('Unable to resolve current status.');
  }
  body.status = status;
  if (typeof current.statusDescription === 'string') {
    body.statusDescription = current.statusDescription;
  }

  const profileKeys = Object.keys(body).filter(
    (key) => key !== 'status' && key !== 'statusDescription',
  );
  if (profileKeys.length === 0) {
    throw new Error('Provide at least one profile field to update.');
  }
  return body;
}

export async function updateProfile(input: ProfileUpdateInput): Promise<ProfileUpdateOutput> {
  const currentResult = await callReadOperationParsed('getCurrentUser', {});
  const current = currentResult.data;
  const userId = current && typeof current.id === 'string' ? current.id : '';
  if (!current || !userId) {
    throw new Error('Unable to resolve current user id.');
  }

  const body = buildProfileUpdateBody(input, current);
  const result = await callWriteOperationParsed('updateUser', { userId }, body);
  if (!result.data) {
    throw new Error('Profile update returned no user data.');
  }
  return { userId, user: result.data };
}
