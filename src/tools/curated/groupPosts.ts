import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  GroupPostCreateInputSchema,
  GroupPostDeleteInputSchema,
  GroupPostsRecentInputSchema,
  GroupPostsRecentOutputSchema,
  GroupPostUpdateInputSchema,
  GroupPostWriteOutputSchema,
} from '../../models/groups.js';
import {
  checkGroupAllowed,
  createGroupPost,
  deleteGroupPost,
  listGroupPosts,
  resolveGroupId,
  updateGroupPost,
} from '../../services/groups/index.js';
import {
  destructiveToolAnnotations,
  readOnlyToolAnnotations,
  writeToolAnnotations,
} from '../../utils/toolAnnotations.js';
import { toolName } from '../../utils/toolNames.js';
import { textContent, toolError } from '../../utils/toolResponses.js';

export function registerCuratedGroupPostTools(server: McpServer): void {
  server.registerTool(
    toolName('vrchat.group.posts.recent'),
    {
      description: 'List recent posts for a group (read-only).',
      inputSchema: GroupPostsRecentInputSchema,
      outputSchema: GroupPostsRecentOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const resolved = await resolveGroupId({
          groupId: args?.groupId,
          shortCode: args?.shortCode,
        });
        if (!resolved.ok) {
          return toolError(resolved.reason, {
            status: resolved.status,
            message: resolved.reason,
            nextSteps: resolved.nextSteps,
          });
        }

        const result = await listGroupPosts(resolved.groupId, args ?? {});
        const payload = {
          groupId: resolved.groupId,
          pageSize: result.pageSize,
          maxPages: result.maxPages,
          totalPosts: result.posts.length,
          truncated: result.truncated,
          stale: result.stale,
          page: result.page,
          posts: result.posts,
        };
        return {
          content: textContent(JSON.stringify(payload, null, 2)),
          structuredContent: payload as Record<string, unknown>,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    },
  );

  server.registerTool(
    toolName('vrchat.group.post.create'),
    {
      description:
        'Create a group post (announcement). Does not notify members unless sendNotification is true.',
      inputSchema: GroupPostCreateInputSchema,
      outputSchema: GroupPostWriteOutputSchema,
      annotations: writeToolAnnotations,
    },
    async (args) => {
      try {
        const input = GroupPostCreateInputSchema.parse(args);
        const allowed = checkGroupAllowed(input.groupId);
        if (!allowed.ok) {
          return toolError(allowed.reason);
        }
        const post = await createGroupPost(input);
        const payload = {
          status: 'created' as const,
          groupId: input.groupId,
          postId: post?.id,
          post: post ?? null,
        };
        return {
          content: textContent(JSON.stringify(payload, null, 2)),
          structuredContent: payload as Record<string, unknown>,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    },
  );

  server.registerTool(
    toolName('vrchat.group.post.update'),
    {
      description:
        'Update a group post. VRChat replaces the whole post, so any field left out is filled in from the current post: this tool reads the last 300 posts to find it first. Supply title, text, and visibility together to skip that lookup and replace the post outright, which also clears roleIds and imageId unless you resend them. Editing does not re-notify members unless sendNotification is true.',
      inputSchema: GroupPostUpdateInputSchema,
      outputSchema: GroupPostWriteOutputSchema,
      annotations: writeToolAnnotations,
    },
    async (args) => {
      try {
        const input = GroupPostUpdateInputSchema.parse(args);
        const allowed = checkGroupAllowed(input.groupId);
        if (!allowed.ok) {
          return toolError(allowed.reason);
        }
        const result = await updateGroupPost(input);
        const payload = {
          status: 'updated' as const,
          groupId: input.groupId,
          postId: input.postId,
          mergedFromExisting: result.mergedFromExisting,
          post: result.post,
        };
        return {
          content: textContent(JSON.stringify(payload, null, 2)),
          structuredContent: payload as Record<string, unknown>,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    },
  );

  server.registerTool(
    toolName('vrchat.group.post.delete'),
    {
      description: 'Delete a group post. Members already notified about it are not un-notified.',
      inputSchema: GroupPostDeleteInputSchema,
      outputSchema: GroupPostWriteOutputSchema,
      annotations: destructiveToolAnnotations,
    },
    async (args) => {
      try {
        const input = GroupPostDeleteInputSchema.parse(args);
        const allowed = checkGroupAllowed(input.groupId);
        if (!allowed.ok) {
          return toolError(allowed.reason);
        }
        await deleteGroupPost(input);
        const payload = {
          status: 'deleted' as const,
          groupId: input.groupId,
          postId: input.postId,
        };
        return {
          content: textContent(JSON.stringify(payload, null, 2)),
          structuredContent: payload as Record<string, unknown>,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    },
  );
}
