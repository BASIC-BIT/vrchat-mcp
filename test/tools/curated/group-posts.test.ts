import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakeServer } from '../../helpers/fake-server.js';

vi.mock('../../../src/services/groups/index.js', () => ({
  checkGroupAllowed: vi.fn(() => ({ ok: true })),
  resolveGroupId: vi.fn(),
  listGroupPosts: vi.fn(),
  createGroupPost: vi.fn(),
  updateGroupPost: vi.fn(),
  deleteGroupPost: vi.fn(),
}));

import { registerCuratedGroupPostTools } from '../../../src/tools/curated/groupPosts.js';
import {
  checkGroupAllowed,
  createGroupPost,
  deleteGroupPost,
  listGroupPosts,
  resolveGroupId,
  updateGroupPost,
} from '../../../src/services/groups/index.js';

describe('curated group post tools', () => {
  it('lists recent group posts', async () => {
    vi.mocked(resolveGroupId).mockResolvedValue({ ok: true, groupId: 'grp_1', resolvedBy: 'id' });
    vi.mocked(listGroupPosts).mockResolvedValue({
      posts: [{ id: 'post_1', title: 'Hello' }],
      page: { pages: 1, items: 1, pageSize: 50, offsetStart: 0, truncated: false },
      truncated: false,
      stale: false,
      pageSize: 50,
      maxPages: 10,
    });

    const server = new FakeServer();
    registerCuratedGroupPostTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_group_posts_recent');
    const result = await tool!.handler({ groupId: 'grp_1' });

    expect(result).toMatchObject({
      structuredContent: { totalPosts: 1, posts: [{ id: 'post_1' }] },
    });
  });

  describe('group post writes', () => {
    function registerTools() {
      const server = new FakeServer();
      registerCuratedGroupPostTools(server as unknown as McpServer);
      return server;
    }

    beforeEach(() => {
      vi.mocked(createGroupPost).mockReset();
      vi.mocked(updateGroupPost).mockReset();
      vi.mocked(deleteGroupPost).mockReset();
      vi.mocked(checkGroupAllowed).mockReturnValue({ ok: true });
    });

    it('creates a post and defaults sendNotification to false', async () => {
      vi.mocked(createGroupPost).mockResolvedValue({ id: 'not_1', title: 'Doors open' });

      const tool = registerTools().tools.find((entry) => entry.name === 'vrchat_group_post_create');
      const result = await tool!.handler({
        groupId: 'grp_1',
        title: 'Doors open',
        text: 'Come join us.',
        visibility: 'group',
      });

      expect(tool?.config.annotations).toEqual({ readOnlyHint: false });
      expect(checkGroupAllowed).toHaveBeenCalledWith('grp_1');
      expect(createGroupPost).toHaveBeenCalledWith(
        expect.objectContaining({ groupId: 'grp_1', sendNotification: false })
      );
      expect(result).toMatchObject({
        structuredContent: { status: 'created', groupId: 'grp_1', postId: 'not_1' },
      });
    });

    it('updates a post and reports whether it merged from the existing post', async () => {
      vi.mocked(updateGroupPost).mockResolvedValue({
        post: { id: 'not_1', text: 'Fixed typo.' },
        mergedFromExisting: true,
      });

      const tool = registerTools().tools.find((entry) => entry.name === 'vrchat_group_post_update');
      const result = await tool!.handler({
        groupId: 'grp_1',
        postId: 'not_1',
        text: 'Fixed typo.',
      });

      expect(updateGroupPost).toHaveBeenCalledWith(
        expect.objectContaining({ postId: 'not_1', sendNotification: false })
      );
      expect(result).toMatchObject({
        structuredContent: { status: 'updated', postId: 'not_1', mergedFromExisting: true },
      });
    });

    it('marks post deletion destructive and echoes the deleted id', async () => {
      vi.mocked(deleteGroupPost).mockResolvedValue(undefined);

      const tool = registerTools().tools.find((entry) => entry.name === 'vrchat_group_post_delete');
      const result = await tool!.handler({ groupId: 'grp_1', postId: 'not_1' });

      expect(tool?.config.annotations).toMatchObject({ destructiveHint: true });
      expect(deleteGroupPost).toHaveBeenCalledWith({ groupId: 'grp_1', postId: 'not_1' });
      expect(result).toMatchObject({
        structuredContent: { status: 'deleted', groupId: 'grp_1', postId: 'not_1' },
      });
    });

    it.each([
      [
        'vrchat_group_post_create',
        { groupId: 'grp_1', title: 'T', text: 'B', visibility: 'group' },
      ],
      ['vrchat_group_post_update', { groupId: 'grp_1', postId: 'not_1', text: 'B' }],
      ['vrchat_group_post_delete', { groupId: 'grp_1', postId: 'not_1' }],
    ])('blocks %s when the group allowlist denies it', async (name, args) => {
      vi.mocked(checkGroupAllowed).mockReturnValue({ ok: false, reason: 'not allowed' });

      const tool = registerTools().tools.find((entry) => entry.name === name);
      const result = await tool!.handler(args);

      expect(result).toMatchObject({ isError: true });
      expect(createGroupPost).not.toHaveBeenCalled();
      expect(updateGroupPost).not.toHaveBeenCalled();
      expect(deleteGroupPost).not.toHaveBeenCalled();
    });
  });
});
