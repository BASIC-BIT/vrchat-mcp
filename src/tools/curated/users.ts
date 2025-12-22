import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { shapeReadData } from '../../core/readTools.js';
import {
  UserGroupsInputSchema,
  UserGroupsOutputSchema,
  UserProfileInputSchema,
  UserProfileOutputSchema,
  type UserGroupsOutput,
} from '../../models/users.js';
import { listUserGroups, resolveUserId, resolveUserProfile } from '../../services/users/index.js';
import { toolName } from '../../utils/toolNames.js';
import { textContent, toolError } from '../../utils/toolResponses.js';

export function registerCuratedUserTools(server: McpServer): void {
  server.registerTool(
    toolName('vrchat.user.profile'),
    {
      description: "Get a user profile (read-only). Optionally include a paged list of the user's groups.",
      inputSchema: UserProfileInputSchema,
      outputSchema: UserProfileOutputSchema,
    },
    async (args) => {
      try {
        const resolved = await resolveUserProfile(args);
        if (!resolved.ok) {
          return toolError(resolved.reason);
        }

        const shapedUser = shapeReadData(resolved.user, {
          fields: args?.fields,
          compact: args?.compact,
          maxArrayLength: args?.maxArrayLength,
        });

        let groupsPayload: UserGroupsOutput | undefined;
        if (args?.includeGroups) {
          const pageSize =
            typeof args.groupPageSize === 'number' ? Math.floor(args.groupPageSize) : 100;
          const maxPages =
            typeof args.groupMaxPages === 'number' ? Math.floor(args.groupMaxPages) : 100;
          const offset =
            typeof args.groupOffset === 'number' ? Math.floor(args.groupOffset) : 0;
          groupsPayload = await listUserGroups({
            userId: resolved.userId,
            pageSize,
            maxPages,
            offset,
          });
        }

        const payload = {
          userId: resolved.userId,
          user: shapedUser,
          groups: groupsPayload,
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
    toolName('vrchat.user.groups'),
    {
      description: "List a user's groups (id + name only, cache-backed).",
      inputSchema: UserGroupsInputSchema,
      outputSchema: UserGroupsOutputSchema,
    },
    async (args) => {
      try {
        const resolved = await resolveUserId(args);
        if (!resolved.ok) {
          return toolError(resolved.reason);
        }

        const pageSize = typeof args?.pageSize === 'number' ? Math.floor(args.pageSize) : 100;
        const maxPages = typeof args?.maxPages === 'number' ? Math.floor(args.maxPages) : 100;
        const offset = typeof args?.offset === 'number' ? Math.floor(args.offset) : 0;

        const payload = await listUserGroups({
          userId: resolved.userId,
          pageSize,
          maxPages,
          offset,
        });
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
