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

export const GROUP_POST_LOOKUP_MAX_ELAPSED_MS = 60_000;

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
 * ponytail: offset paging with no stable sort guarantee, so a post deleted mid-scan shifts
 * later items down and can carry one past a page boundary unseen. (An added post shifts the
 * other way and only causes a duplicate.) A miss falls back to the caller's full body.
 * Revisit only if the API grows a single-post GET.
 */
export async function findGroupPostById(
  groupId: string,
  postId: string
): Promise<GroupPostSummary | null> {
  const startedAt = Date.now();
  for (let page = 0; page < GROUP_POST_LOOKUP_MAX_PAGES; page += 1) {
    const remainingMs = GROUP_POST_LOOKUP_MAX_ELAPSED_MS - (Date.now() - startedAt);
    if (remainingMs <= 0) {
      throw new Error(
        `Group post lookup exceeded its ${GROUP_POST_LOOKUP_MAX_ELAPSED_MS}ms deadline.`
      );
    }
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
      { ...GROUP_POST_RETRY, maxElapsedMs: remainingMs }
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
  // Optional here because the caller's schema defaults it; CreateGroupPostRequest
  // re-applies the false default, so an omitted flag never notifies.
  sendNotification?: boolean;
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
  // finally, not after: a response that fails to parse still created the post, and an agent
  // retrying against a stale cached list could post (and notify) twice.
  try {
    const result = await callWriteOperationParsed(
      'addGroupPost',
      { groupId: input.groupId },
      request
    );
    return result.data ? toGroupPostSummary(result.data) : null;
  } finally {
    invalidateGroupPostCaches(input.groupId);
  }
}

function hasAnyContentField(input: GroupPostUpdateInput): boolean {
  return (
    input.title !== undefined ||
    input.text !== undefined ||
    input.visibility !== undefined ||
    input.roleIds !== undefined ||
    input.imageId !== undefined
  );
}

/** Enough to rebuild the post without reading it, at the cost of clearing roleIds/imageId. */
function hasFullPostBody(input: GroupPostUpdateInput): boolean {
  return input.title !== undefined && input.text !== undefined && input.visibility !== undefined;
}

export async function updateGroupPost(input: GroupPostUpdateInput): Promise<{
  post: GroupPostSummary | null;
  mergedFromExisting: boolean;
}> {
  if (!hasAnyContentField(input)) {
    throw new Error(
      'Provide at least one of title, text, visibility, roleIds, or imageId to change. Re-sending an unchanged post would bump its timestamp and could re-notify members.'
    );
  }

  // Always look the post up first. The PUT replaces the whole post, so skipping the read
  // would drop roleIds and imageId whenever the caller did not resend them, quietly
  // widening a role-restricted post to the entire group.
  const existing = await findGroupPostById(input.groupId, input.postId);

  // A full body still lets the edit land when the post is older than the lookup window.
  // That path cannot preserve roleIds/imageId, so it is reported via mergedFromExisting.
  if (!existing && !hasFullPostBody(input)) {
    throw new Error(
      `Group post ${input.postId} was not found in the most recent ${GROUP_POST_LOOKUP_MAX_ITEMS} posts for ${input.groupId}. Supply title, text, and visibility to replace it without the lookup, which also clears its roleIds and imageId.`
    );
  }

  const request = buildGroupPostRequest({
    title: input.title ?? existing?.title,
    text: input.text ?? existing?.text,
    visibility: input.visibility ?? existing?.visibility,
    roleIds: input.roleIds ?? existing?.roleIds,
    imageId: input.imageId ?? existing?.imageId,
    sendNotification: input.sendNotification,
  });

  // Invalidate even when the response fails to parse: the write already landed, and leaving
  // the cached list intact would hide it from vrchat_group_posts_recent for the full TTL.
  try {
    const result = await callWriteOperationParsed(
      'updateGroupPost',
      { groupId: input.groupId, notificationId: input.postId },
      request
    );
    return {
      post: result.data ? toGroupPostSummary(result.data) : null,
      mergedFromExisting: existing !== null,
    };
  } finally {
    invalidateGroupPostCaches(input.groupId);
  }
}

export async function deleteGroupPost(input: GroupPostDeleteInput): Promise<void> {
  try {
    await callWriteOperationParsed('deleteGroupPost', {
      groupId: input.groupId,
      notificationId: input.postId,
    });
  } finally {
    invalidateGroupPostCaches(input.groupId);
  }
}
