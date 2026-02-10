import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getConfig } from '../../config/index.js';
import { shapeReadData } from '../../core/readTools.js';
import {
  CurrentUserProfileInputSchema,
  DEFAULT_SELF_FIELDS,
  PROFILE_UPDATE_FIELDS,
  ProfileUpdateInputSchema,
  ProfileUpdateOutputSchema,
  UserGroupsInputSchema,
  UserGroupsOutputSchema,
  UserProfileInputSchema,
  UserProfileOutputSchema,
  type UserGroupsOutput,
} from '../../models/users.js';
import {
  listUserGroups,
  resolveUserId,
  resolveUserProfile,
  updateProfile,
} from '../../services/users/index.js';
import { getVrcxUserMemo } from '../../services/vrcx/index.js';
import { readOnlyToolAnnotations, writeToolAnnotations } from '../../utils/toolAnnotations.js';
import { toolName } from '../../utils/toolNames.js';
import { textContent, toolError } from '../../utils/toolResponses.js';

export function registerCuratedUserTools(server: McpServer): void {
  server.registerTool(
    toolName('vrchat.me'),
    {
      description:
        'Get your profile (read-only). Uses a compact default field set to avoid large friend lists; provide fields to override. Optionally include a paged list of your groups.',
      inputSchema: CurrentUserProfileInputSchema,
      outputSchema: UserProfileOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const resolved = await resolveUserProfile(undefined);
        if (!resolved.ok) {
          return toolError(resolved.reason);
        }

        const fields = args?.fields?.length ? args.fields : [...DEFAULT_SELF_FIELDS];
        const shapedUser = shapeReadData(resolved.user, {
          fields,
          compact: args?.compact,
          maxArrayLength: args?.maxArrayLength,
        });

        let groupsPayload: UserGroupsOutput | undefined;
        if (args?.includeGroups) {
          const pageSize =
            typeof args.groupPageSize === 'number' ? Math.floor(args.groupPageSize) : 100;
          const maxPages =
            typeof args.groupMaxPages === 'number' ? Math.floor(args.groupMaxPages) : 100;
          const offset = typeof args.groupOffset === 'number' ? Math.floor(args.groupOffset) : 0;
          groupsPayload = await listUserGroups({
            userId: resolved.userId,
            pageSize,
            maxPages,
            offset,
          });
        }

        let vrcxMemo: { editedAt: string | null; memo: string | null } | undefined;
        try {
          const config = getConfig();
          const memoResult = await getVrcxUserMemo({
            enabled: config.vrcx.enabled,
            databasePath: config.vrcx.databasePath,
            worldDbPath: config.vrcx.worldDbPath,
            userId: resolved.userId,
          });
          if (memoResult.ok && (memoResult.memo || memoResult.editedAt)) {
            vrcxMemo = { editedAt: memoResult.editedAt, memo: memoResult.memo };
          }
        } catch {
          // ignore VRCX errors; user profile should still work
        }

        const payload = {
          userId: resolved.userId,
          user: shapedUser,
          groups: groupsPayload,
          vrcxMemo,
        };
        return {
          content: textContent(JSON.stringify(payload, null, 2)),
          structuredContent: payload as Record<string, unknown>,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    }
  );

  server.registerTool(
    toolName('vrchat.user.profile'),
    {
      description:
        "Get a user profile (read-only). Optionally include a paged list of the user's groups.",
      inputSchema: UserProfileInputSchema,
      outputSchema: UserProfileOutputSchema,
      annotations: readOnlyToolAnnotations,
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
          const offset = typeof args.groupOffset === 'number' ? Math.floor(args.groupOffset) : 0;
          groupsPayload = await listUserGroups({
            userId: resolved.userId,
            pageSize,
            maxPages,
            offset,
          });
        }

        let vrcxMemo: { editedAt: string | null; memo: string | null } | undefined;
        try {
          const config = getConfig();
          const memoResult = await getVrcxUserMemo({
            enabled: config.vrcx.enabled,
            databasePath: config.vrcx.databasePath,
            worldDbPath: config.vrcx.worldDbPath,
            userId: resolved.userId,
          });
          if (memoResult.ok && (memoResult.memo || memoResult.editedAt)) {
            vrcxMemo = { editedAt: memoResult.editedAt, memo: memoResult.memo };
          }
        } catch {
          // ignore VRCX errors; user profile should still work
        }

        const payload = {
          userId: resolved.userId,
          user: shapedUser,
          groups: groupsPayload,
          vrcxMemo,
        };
        return {
          content: textContent(JSON.stringify(payload, null, 2)),
          structuredContent: payload as Record<string, unknown>,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    }
  );

  server.registerTool(
    toolName('vrchat.user.groups'),
    {
      description: "List a user's groups (id + name only, cache-backed).",
      inputSchema: UserGroupsInputSchema,
      outputSchema: UserGroupsOutputSchema,
      annotations: readOnlyToolAnnotations,
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
    }
  );

  server.registerTool(
    toolName('vrchat.profile.update'),
    {
      description:
        'Update your profile fields (bio, bioLinks, pronouns, userIcon, booping, content filters). Status is preserved automatically.',
      inputSchema: ProfileUpdateInputSchema,
      outputSchema: ProfileUpdateOutputSchema,
      annotations: writeToolAnnotations,
    },
    async (args) => {
      try {
        const input = ProfileUpdateInputSchema.parse(args);
        const payload = await updateProfile(input);
        const shapedUser = shapeReadData(payload.user, {
          fields: [...PROFILE_UPDATE_FIELDS],
        });
        const response = {
          userId: payload.userId,
          user: shapedUser,
        };
        return {
          content: textContent(JSON.stringify(response, null, 2)),
          structuredContent: response as Record<string, unknown>,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    }
  );
}
