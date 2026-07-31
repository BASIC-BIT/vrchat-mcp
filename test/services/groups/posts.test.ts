import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/core/readTools.js', () => ({
  callReadOperation: vi.fn(),
}));
vi.mock('../../../src/core/client.js', () => ({
  callOperation: vi.fn(),
}));

import { callReadOperation } from '../../../src/core/readTools.js';
import { callOperation } from '../../../src/core/client.js';
import { cacheManager } from '../../../src/services/cache.js';
import {
  createGroupPost,
  deleteGroupPost,
  findGroupPostById,
  GROUP_POST_LOOKUP_MAX_ITEMS,
  GROUP_POST_LOOKUP_MAX_PAGES,
  GROUP_POST_LOOKUP_PAGE_SIZE,
  updateGroupPost,
} from '../../../src/services/groups/posts.js';
import { listGroupPosts } from '../../../src/services/groups/curated.js';

const GROUP_ID = 'grp_00000000-0000-0000-0000-000000000000';
const POST_ID = 'not_00000000-0000-0000-0000-000000000001';
const ROLE_ID = 'grol_00000000-0000-0000-0000-000000000002';
const IMAGE_ID = 'file_00000000-0000-0000-0000-000000000003';

const EXISTING_POST = {
  id: POST_ID,
  groupId: GROUP_ID,
  title: 'Doors open',
  text: 'Come join us.',
  visibility: 'group',
  roleId: [ROLE_ID],
  imageId: IMAGE_ID,
};

function mockPostsPage(posts: unknown[]) {
  vi.mocked(callReadOperation).mockResolvedValueOnce({
    data: posts,
    page: {
      pages: 1,
      items: posts.length,
      pageSize: GROUP_POST_LOOKUP_PAGE_SIZE,
      offsetStart: 0,
      truncated: false,
    },
  });
}

function filledPage(size = GROUP_POST_LOOKUP_PAGE_SIZE) {
  return Array.from({ length: size }, (_, index) => ({
    id: `not_filler_${index}`,
    title: 'Filler',
    text: 'Filler',
    visibility: 'group',
  }));
}

function lastWriteCall() {
  const calls = vi.mocked(callOperation).mock.calls;
  return calls[calls.length - 1]?.[0];
}

/** The body as it reaches the wire, with undefined-valued keys dropped by JSON. */
function wireBody(): unknown {
  return JSON.parse(JSON.stringify(lastWriteCall()?.body ?? null));
}

describe('group posts service', () => {
  beforeEach(() => {
    cacheManager.invalidateAll();
    vi.mocked(callReadOperation).mockReset();
    vi.mocked(callOperation).mockReset();
  });

  describe('createGroupPost', () => {
    it('posts the full body and returns a summary with roleIds mapped from roleId', async () => {
      vi.mocked(callOperation).mockResolvedValueOnce({ url: 'u', data: EXISTING_POST });

      const post = await createGroupPost(GROUP_ID, {
        title: 'Doors open',
        text: 'Come join us.',
        visibility: 'group',
        roleIds: [ROLE_ID],
        imageId: IMAGE_ID,
        sendNotification: false,
      });

      expect(lastWriteCall()).toMatchObject({
        operationId: 'addGroupPost',
        params: { groupId: GROUP_ID },
        body: {
          title: 'Doors open',
          text: 'Come join us.',
          visibility: 'group',
          roleIds: [ROLE_ID],
          imageId: IMAGE_ID,
          sendNotification: false,
        },
      });
      expect(post).toMatchObject({ id: POST_ID, roleIds: [ROLE_ID], imageId: IMAGE_ID });
    });

    it('passes sendNotification through when explicitly opted in', async () => {
      vi.mocked(callOperation).mockResolvedValueOnce({ url: 'u', data: EXISTING_POST });

      await createGroupPost(GROUP_ID, {
        title: 'Doors open',
        text: 'Come join us.',
        visibility: 'public',
        sendNotification: true,
      });

      expect(lastWriteCall()?.body).toMatchObject({ sendNotification: true });
    });

    it('invalidates cached group reads so posts_recent does not serve a stale list', async () => {
      const invalidate = vi.spyOn(cacheManager, 'invalidateByTag');
      vi.mocked(callOperation).mockResolvedValueOnce({ url: 'u', data: EXISTING_POST });

      await createGroupPost(GROUP_ID, {
        title: 'T',
        text: 'B',
        visibility: 'group',
        sendNotification: false,
      });

      expect(invalidate).toHaveBeenCalledWith(`groups:${GROUP_ID}`);
      invalidate.mockRestore();
    });

    it('keeps groupId out of the request body', async () => {
      // CreateGroupPostRequest is a passthrough schema, so a refactor that spreads the
      // whole input would silently POST groupId inside the body.
      vi.mocked(callOperation).mockResolvedValueOnce({ url: 'u', data: EXISTING_POST });

      await createGroupPost(GROUP_ID, {
        title: 'T',
        text: 'B',
        visibility: 'group',
        sendNotification: false,
      });

      expect(lastWriteCall()?.body).not.toHaveProperty('groupId');
    });

    it('does not notify when sendNotification is omitted entirely', async () => {
      vi.mocked(callOperation).mockResolvedValueOnce({ url: 'u', data: EXISTING_POST });

      await createGroupPost(GROUP_ID, {
        title: 'T',
        text: 'B',
        visibility: 'group',
      });

      expect(lastWriteCall()?.body).toMatchObject({ sendNotification: false });
    });

    it('reports the created post as unavailable rather than failing when the response cannot be parsed', async () => {
      vi.mocked(callOperation).mockResolvedValueOnce({
        url: 'u',
        data: { id: POST_ID, visibility: 'nonsense-value' },
      });

      // Creation is not idempotent: reporting an error here would invite a retry that
      // posts twice and could notify the group twice.
      await expect(
        createGroupPost(GROUP_ID, {
          title: 'T',
          text: 'B',
          visibility: 'group',
          sendNotification: true,
        })
      ).resolves.toBeNull();
    });

    it('rejects an empty title before calling the API', async () => {
      await expect(
        createGroupPost(GROUP_ID, {
          title: '',
          text: 'B',
          visibility: 'group',
          sendNotification: false,
        })
      ).rejects.toThrow(/title, text, and visibility/);
      expect(callOperation).not.toHaveBeenCalled();
    });
  });

  describe('updateGroupPost', () => {
    it('preserves roleIds and imageId even when the caller supplies a full body', async () => {
      // Regression: a full body used to skip the lookup, so the replacing PUT dropped
      // roleIds and imageId and widened a role-restricted post to the whole group.
      mockPostsPage([EXISTING_POST]);
      vi.mocked(callOperation).mockResolvedValueOnce({ url: 'u', data: EXISTING_POST });

      const result = await updateGroupPost(GROUP_ID, {
        postId: POST_ID,
        title: 'Doors closed',
        text: 'That is a wrap.',
        visibility: 'group',
        sendNotification: false,
      });

      expect(callReadOperation).toHaveBeenCalled();
      expect(result.mergedFromExisting).toBe(true);
      // toEqual on the serialized body: toMatchObject would pass while dropping fields.
      expect(wireBody()).toEqual({
        title: 'Doors closed',
        text: 'That is a wrap.',
        visibility: 'group',
        roleIds: [ROLE_ID],
        imageId: IMAGE_ID,
        sendNotification: false,
      });
    });

    it('clears role restrictions only when an empty array is passed explicitly', async () => {
      mockPostsPage([EXISTING_POST]);
      vi.mocked(callOperation).mockResolvedValueOnce({ url: 'u', data: EXISTING_POST });

      await updateGroupPost(GROUP_ID, {
        postId: POST_ID,
        text: 'Fixed typo.',
        roleIds: [],
        sendNotification: false,
      });

      expect(wireBody()).toMatchObject({ roleIds: [] });
    });

    it('falls back to an outright replace when the post is outside the lookup window', async () => {
      for (let page = 0; page < GROUP_POST_LOOKUP_MAX_PAGES; page += 1) {
        mockPostsPage(filledPage());
      }
      vi.mocked(callOperation).mockResolvedValueOnce({ url: 'u', data: EXISTING_POST });

      const result = await updateGroupPost(GROUP_ID, {
        postId: POST_ID,
        title: 'Doors closed',
        text: 'That is a wrap.',
        visibility: 'group',
        sendNotification: false,
      });

      expect(result.mergedFromExisting).toBe(false);
      expect(wireBody()).toEqual({
        title: 'Doors closed',
        text: 'That is a wrap.',
        visibility: 'group',
        sendNotification: false,
      });
    });

    it('refuses an update that changes nothing', async () => {
      await expect(
        updateGroupPost(GROUP_ID, { postId: POST_ID, sendNotification: true })
      ).rejects.toThrow(/at least one of title, text, visibility, roleIds, or imageId/);
      expect(callReadOperation).not.toHaveBeenCalled();
      expect(callOperation).not.toHaveBeenCalled();
    });

    it('merges untouched fields from the existing post, mapping roleId to roleIds', async () => {
      mockPostsPage([EXISTING_POST]);
      vi.mocked(callOperation).mockResolvedValueOnce({
        url: 'u',
        data: { ...EXISTING_POST, text: 'Fixed typo.' },
      });

      const result = await updateGroupPost(GROUP_ID, {
        postId: POST_ID,
        text: 'Fixed typo.',
        sendNotification: false,
      });

      expect(result.mergedFromExisting).toBe(true);
      expect(lastWriteCall()).toMatchObject({
        operationId: 'updateGroupPost',
        body: {
          title: 'Doors open',
          text: 'Fixed typo.',
          visibility: 'group',
          roleIds: [ROLE_ID],
          imageId: IMAGE_ID,
          sendNotification: false,
        },
      });
    });

    it('defaults to not re-notifying members on a merged edit', async () => {
      mockPostsPage([EXISTING_POST]);
      vi.mocked(callOperation).mockResolvedValueOnce({ url: 'u', data: EXISTING_POST });

      await updateGroupPost(GROUP_ID, {
        postId: POST_ID,
        text: 'Fixed typo.',
        sendNotification: false,
      });

      expect(lastWriteCall()?.body).toMatchObject({ sendNotification: false });
    });

    it('reads through the API rather than the cached post list', async () => {
      const cached = vi.spyOn(cacheManager, 'getOrSetStale');
      mockPostsPage([EXISTING_POST]);
      vi.mocked(callOperation).mockResolvedValueOnce({ url: 'u', data: EXISTING_POST });

      await updateGroupPost(GROUP_ID, {
        postId: POST_ID,
        text: 'Fixed typo.',
        sendNotification: false,
      });

      expect(cached).not.toHaveBeenCalled();
      cached.mockRestore();
    });

    it('walks pages until it finds the post', async () => {
      mockPostsPage(filledPage());
      mockPostsPage([EXISTING_POST]);
      vi.mocked(callOperation).mockResolvedValueOnce({ url: 'u', data: EXISTING_POST });

      await updateGroupPost(GROUP_ID, {
        postId: POST_ID,
        text: 'Fixed typo.',
        sendNotification: false,
      });

      expect(vi.mocked(callReadOperation).mock.calls[1]?.[1]).toMatchObject({
        offset: GROUP_POST_LOOKUP_PAGE_SIZE,
      });
    });

    it('names the escape hatch when the post is outside the lookup window', async () => {
      for (let page = 0; page < GROUP_POST_LOOKUP_MAX_PAGES; page += 1) {
        mockPostsPage(filledPage());
      }

      await expect(
        updateGroupPost(GROUP_ID, {
          postId: POST_ID,
          text: 'Fixed typo.',
          sendNotification: false,
        })
      ).rejects.toThrow(
        new RegExp(
          `not found in the most recent ${GROUP_POST_LOOKUP_MAX_ITEMS} posts[\\s\\S]*Supply title, text, and visibility`
        )
      );
      expect(callOperation).not.toHaveBeenCalled();
    });

    it('stops scanning on a short page instead of burning the page budget', async () => {
      mockPostsPage([{ id: 'not_other', title: 'T', text: 'B', visibility: 'group' }]);

      await expect(
        updateGroupPost(GROUP_ID, {
          postId: POST_ID,
          text: 'Fixed typo.',
          sendNotification: false,
        })
      ).rejects.toThrow(/not found/);
      expect(callReadOperation).toHaveBeenCalledTimes(1);
    });

    it('invalidates the cached post list the read tool actually serves', async () => {
      // Asserts against listGroupPosts rather than the tag string, so retagging either
      // side breaks this test instead of silently disabling invalidation.
      mockPostsPage([EXISTING_POST]);
      const before = await listGroupPosts(GROUP_ID, {});
      expect(before.posts[0]?.text).toBe('Come join us.');
      const readsAfterFirstList = vi.mocked(callReadOperation).mock.calls.length;

      // Second read is a cache hit: no queued mock is consumed and no request is made.
      await listGroupPosts(GROUP_ID, {});
      expect(vi.mocked(callReadOperation).mock.calls.length).toBe(readsAfterFirstList);

      mockPostsPage([EXISTING_POST]);
      vi.mocked(callOperation).mockResolvedValueOnce({ url: 'u', data: EXISTING_POST });
      await updateGroupPost(GROUP_ID, {
        postId: POST_ID,
        text: 'Fixed typo.',
        sendNotification: false,
      });

      // The write dropped the cached list, so this refetches and sees the new text.
      mockPostsPage([{ ...EXISTING_POST, text: 'Fixed typo.' }]);
      const after = await listGroupPosts(GROUP_ID, {});
      expect(after.posts[0]?.text).toBe('Fixed typo.');
    });

    it('reports success when the write lands but its response cannot be parsed', async () => {
      // The post already exists at this point. Surfacing an error would invite a retry that
      // edits twice and, with sendNotification, pings the group twice.
      const invalidate = vi.spyOn(cacheManager, 'invalidateByTag');
      mockPostsPage([EXISTING_POST]);
      // visibility is a closed enum, so this response cannot parse.
      vi.mocked(callOperation).mockResolvedValueOnce({
        url: 'u',
        data: { id: POST_ID, visibility: 'nonsense-value' },
      });

      const result = await updateGroupPost(GROUP_ID, {
        postId: POST_ID,
        text: 'Fixed typo.',
        sendNotification: false,
      });

      expect(result.post).toBeNull();
      expect(result.mergedFromExisting).toBe(true);
      expect(invalidate).toHaveBeenCalledWith(`groups:${GROUP_ID}`);
      invalidate.mockRestore();
    });

    it('removes the image when imageId is explicitly null', async () => {
      mockPostsPage([EXISTING_POST]);
      vi.mocked(callOperation).mockResolvedValueOnce({ url: 'u', data: EXISTING_POST });

      await updateGroupPost(GROUP_ID, {
        postId: POST_ID,
        imageId: null,
        sendNotification: false,
      });

      // Absent from the replacing PUT is what clears it server-side.
      expect(wireBody()).not.toHaveProperty('imageId');
      expect(wireBody()).toMatchObject({ roleIds: [ROLE_ID] });
    });

    it('treats reordered roleIds as unchanged rather than a real edit', async () => {
      mockPostsPage([{ ...EXISTING_POST, roleId: [ROLE_ID, 'grol_second'] }]);

      await expect(
        updateGroupPost(GROUP_ID, {
          postId: POST_ID,
          roleIds: ['grol_second', ROLE_ID],
          sendNotification: true,
        })
      ).rejects.toThrow(/already has those values/);
      expect(callOperation).not.toHaveBeenCalled();
    });

    it('still treats a genuinely different role set as a change', async () => {
      mockPostsPage([EXISTING_POST]);
      vi.mocked(callOperation).mockResolvedValueOnce({ url: 'u', data: EXISTING_POST });

      await updateGroupPost(GROUP_ID, {
        postId: POST_ID,
        roleIds: [ROLE_ID, 'grol_added'],
        sendNotification: false,
      });

      expect(wireBody()).toMatchObject({ roleIds: [ROLE_ID, 'grol_added'] });
    });

    it('rejects an update whose supplied values already match the post', async () => {
      mockPostsPage([EXISTING_POST]);

      await expect(
        updateGroupPost(GROUP_ID, {
          postId: POST_ID,
          title: 'Doors open',
          sendNotification: true,
        })
      ).rejects.toThrow(/already has those values/);
      expect(callOperation).not.toHaveBeenCalled();
    });
  });

  describe('deleteGroupPost', () => {
    it('deletes by notificationId and invalidates cached group reads', async () => {
      const invalidate = vi.spyOn(cacheManager, 'invalidateByTag');
      vi.mocked(callOperation).mockResolvedValueOnce({
        url: 'u',
        data: { success: { message: 'Group Post was deleted!', status_code: 200 } },
      });

      await deleteGroupPost(GROUP_ID, { postId: POST_ID });

      expect(lastWriteCall()).toMatchObject({
        operationId: 'deleteGroupPost',
        params: { groupId: GROUP_ID, notificationId: POST_ID },
      });
      expect(invalidate).toHaveBeenCalledWith(`groups:${GROUP_ID}`);
      invalidate.mockRestore();
    });
  });

  describe('findGroupPostById', () => {
    it('returns null when the post is absent', async () => {
      mockPostsPage([{ id: 'not_other', title: 'T', text: 'B', visibility: 'group' }]);
      await expect(findGroupPostById(GROUP_ID, POST_ID)).resolves.toBeNull();
    });

    it('requests one bounded page at a time', async () => {
      mockPostsPage([EXISTING_POST]);
      await findGroupPostById(GROUP_ID, POST_ID);

      expect(vi.mocked(callReadOperation).mock.calls[0]?.[2]).toMatchObject({
        page: { enabled: true, size: GROUP_POST_LOOKUP_PAGE_SIZE, maxPages: 1 },
      });
    });
  });
});
