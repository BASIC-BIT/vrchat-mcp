import type { z } from 'zod';
import { schemas } from '../../generated/vrchat-schemas.js';
import { callWithRetry, type RetryOptions } from '../../core/retry.js';
import {
  toGroupPostSummary,
  type GroupPostCreateInput,
  type GroupPostDeleteInput,
  type GroupPostSummary,
  type GroupPostUpdateInput,
} from '../../models/groups.js';
import { callReadOperationParsed, callWriteOperationParsed } from '../api/client.js';
import { cacheManager } from '../cache.js';

type CreateGroupPostRequest = z.infer<typeof schemas.CreateGroupPostRequest>;

export const GROUP_POST_LOOKUP_PAGE_SIZE = 100;
export const GROUP_POST_LOOKUP_MAX_PAGES = 3;
export const GROUP_POST_LOOKUP_MAX_ITEMS =
  GROUP_POST_LOOKUP_PAGE_SIZE * GROUP_POST_LOOKUP_MAX_PAGES;

const GROUP_POST_RETRY: RetryOptions = {
  maxAttempts: 4,
  baseDelayMs: 1_000,
  maxDelayMs: 30_000,
};

function invalidateGroupPostCaches(groupId: string): void {
  cacheManager.invalidateByTag(`groups:${groupId}`);
}

/**
 * Find one post by ID, reading straight through the API rather than via listGroupPosts.
 * The cached list is up to 30 minutes stale, and merging an edit onto stale text would
 * silently revert anything changed in the VRChat client since the cache filled.
 *
 * ponytail: offset paging with no stable sort guarantee, so a post added mid-scan can shift
 * the window and hide a match. Callers fall back to supplying the full body. Revisit only if
 * the API grows a single-post GET.
 */
export async function findGroupPostById(
  groupId: string,
  postId: string
): Promise<GroupPostSummary | null> {
  for (let page = 0; page < GROUP_POST_LOOKUP_MAX_PAGES; page += 1) {
    const { data: result } = await callWithRetry(
      () =>
        callReadOperationParsed(
          'getGroupPosts',
          { groupId, offset: page * GROUP_POST_LOOKUP_PAGE_SIZE },
          {
            page: {
              enabled: true,
              size: GROUP_POST_LOOKUP_PAGE_SIZE,
              maxPages: 1,
              maxItems: GROUP_POST_LOOKUP_PAGE_SIZE,
            },
          }
        ),
      GROUP_POST_RETRY
    );

    const batch = result.data;
    const match = batch.find((post) => post.id === postId);
    if (match) return toGroupPostSummary(match);
    if (batch.length < GROUP_POST_LOOKUP_PAGE_SIZE) break;
  }
  return null;
}

export function buildGroupPostRequest(input: {
  title?: string;
  text?: string;
  visibility?: string;
  roleIds?: string[];
  imageId?: string;
  sendNotification: boolean;
}): CreateGroupPostRequest {
  if (!input.title || !input.text || !input.visibility) {
    throw new Error(
      'A group post needs title, text, and visibility. Supply all three to replace the post outright.'
    );
  }
  return schemas.CreateGroupPostRequest.parse({
    title: input.title,
    text: input.text,
    visibility: input.visibility,
    roleIds: input.roleIds,
    imageId: input.imageId,
    sendNotification: input.sendNotification,
  });
}

export async function createGroupPost(
  input: GroupPostCreateInput
): Promise<GroupPostSummary | null> {
  const request = buildGroupPostRequest(input);
  const result = await callWriteOperationParsed(
    'addGroupPost',
    { groupId: input.groupId },
    request
  );
  invalidateGroupPostCaches(input.groupId);
  return result.data ? toGroupPostSummary(result.data) : null;
}

export async function updateGroupPost(input: GroupPostUpdateInput): Promise<{
  post: GroupPostSummary | null;
  mergedFromExisting: boolean;
}> {
  // A full body means we can replace outright and skip the lookup entirely.
  const hasFullBody =
    input.title !== undefined && input.text !== undefined && input.visibility !== undefined;

  let existing: GroupPostSummary | null = null;
  if (!hasFullBody) {
    existing = await findGroupPostById(input.groupId, input.postId);
    if (!existing) {
      throw new Error(
        `Group post ${input.postId} was not found in the last ${GROUP_POST_LOOKUP_MAX_ITEMS} posts for ${input.groupId}. Supply title, text, and visibility to replace it without the lookup.`
      );
    }
  }

  const request = buildGroupPostRequest({
    title: input.title ?? existing?.title,
    text: input.text ?? existing?.text,
    visibility: input.visibility ?? existing?.visibility,
    roleIds: input.roleIds ?? existing?.roleIds,
    imageId: input.imageId ?? existing?.imageId,
    sendNotification: input.sendNotification,
  });

  const result = await callWriteOperationParsed(
    'updateGroupPost',
    { groupId: input.groupId, notificationId: input.postId },
    request
  );
  invalidateGroupPostCaches(input.groupId);
  return {
    post: result.data ? toGroupPostSummary(result.data) : null,
    mergedFromExisting: existing !== null,
  };
}

export async function deleteGroupPost(input: GroupPostDeleteInput): Promise<void> {
  await callWriteOperationParsed('deleteGroupPost', {
    groupId: input.groupId,
    notificationId: input.postId,
  });
  invalidateGroupPostCaches(input.groupId);
}
