import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { shapeReadData } from '../../core/readTools.js';
import {
  FriendLocationDetailsInputSchema,
  FriendLocationDetailsOutputSchema,
  FriendSearchInputSchema,
  FriendSearchOutputSchema,
  FriendsListAllInputSchema,
  FriendsListAllOutputSchema,
  FriendsListOnlineInputSchema,
  FriendsListOnlineOutputSchema,
  FriendsOverviewInputSchema,
  FriendsOverviewOutputSchema,
} from '../../models/friends.js';
import {
  getFriendLocationDetails,
  getFriendsOverview,
  listAllFriends,
  listOnlineFriends,
  searchFriends,
} from '../../services/friends/index.js';
import { toolName } from '../../utils/toolNames.js';
import { textContent, toolError } from '../../utils/toolResponses.js';

export function registerCuratedFriendTools(server: McpServer): void {
  server.registerTool(
    toolName('vrchat.friends.search'),
    {
      description: 'Search friends by display name (read-only).',
      inputSchema: FriendSearchInputSchema,
      outputSchema: FriendSearchOutputSchema,
    },
    async (args) => {
      try {
        const query = String(args?.query ?? '').trim();
        if (!query) return toolError('query is required');

        const result = await searchFriends({ ...(args ?? {}), query });
        const payload = {
          query,
          includeOffline: result.includeOffline,
          totalFriends: result.totalFriends,
          matches: result.matches,
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
    toolName('vrchat.friends.all'),
    {
      description:
        'Get all friends with cache-backed pagination (read-only). Defaults to include offline friends.',
      inputSchema: FriendsListAllInputSchema,
      outputSchema: FriendsListAllOutputSchema,
    },
    async (args) => {
      try {
        const result = await listAllFriends(args ?? {});
        const shaped = shapeReadData(result.friends, {
          fields: args?.fields,
          compact: args?.compact,
          maxArrayLength: args?.maxArrayLength,
        });

        const payload = {
          includeOffline: result.includeOffline,
          pageSize: result.pageSize,
          maxPages: result.maxPages,
          totalFriends: result.friends.length,
          truncated: result.meta.truncated,
          stale: result.meta.stale,
          segments: result.meta.segments,
          friends: shaped,
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
    toolName('vrchat.friends.online'),
    {
      description: 'Get online friends only (read-only).',
      inputSchema: FriendsListOnlineInputSchema,
      outputSchema: FriendsListOnlineOutputSchema,
    },
    async (args) => {
      try {
        const result = await listOnlineFriends(args ?? {});
        const shaped = shapeReadData(result.friends, {
          fields: args?.fields,
          compact: args?.compact,
          maxArrayLength: args?.maxArrayLength,
        });

        const payload = {
          pageSize: result.pageSize,
          maxPages: result.maxPages,
          totalFriends: result.friends.length,
          truncated: result.meta.truncated,
          stale: result.meta.stale,
          segments: result.meta.segments,
          friends: shaped,
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
    toolName('vrchat.friends.overview'),
    {
      description: 'Summarize friends by status and location (read-only).',
      inputSchema: FriendsOverviewInputSchema,
      outputSchema: FriendsOverviewOutputSchema,
    },
    async (args) => {
      try {
        const result = await getFriendsOverview(args ?? {});
        const payload = {
          includeOffline: result.includeOffline,
          totalFriends: result.totalFriends,
          onlineCount: result.onlineCount,
          offlineCount: result.offlineCount,
          statusCounts: result.statusCounts,
          topOnline: result.topOnline,
          locationsTop: result.locationsTop,
          truncated: result.meta.truncated,
          stale: result.meta.stale,
          segments: result.meta.segments,
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
    toolName('vrchat.friend_location_details'),
    {
      description:
        "Get a friend's current location details by display name or userId (read-only).",
      inputSchema: FriendLocationDetailsInputSchema,
      outputSchema: FriendLocationDetailsOutputSchema,
    },
    async (args) => {
      try {
        const name = typeof args?.name === 'string' ? args.name : undefined;
        const userId = typeof args?.userId === 'string' ? args.userId : undefined;

        if (!name && !userId) {
          return toolError('Provide name or userId.');
        }

        const result = await getFriendLocationDetails(args ?? {});
        if (!result.ok) {
          return toolError(result.reason, {
            status: result.status,
            message: result.reason,
            nextSteps: result.nextSteps,
          });
        }

        const payload = {
          friend: result.friend,
          location: result.location,
          instance: result.instance,
          world: result.world,
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
