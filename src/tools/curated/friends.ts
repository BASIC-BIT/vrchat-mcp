import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  FriendDetailsInputSchema,
  FriendDetailsOutputSchema,
  FriendSearchInputSchema,
  FriendSearchOutputSchema,
  FriendsListInputSchema,
  FriendsListOutputSchema,
  FriendsOverviewInputSchema,
  FriendsOverviewOutputSchema,
} from '../../models/friends.js';
import {
  getFriendDetails,
  getFriendsOverview,
  listFriends,
  searchFriends,
} from '../../services/friends/index.js';
import { readOnlyToolAnnotations } from '../../utils/toolAnnotations.js';
import { toolName } from '../../utils/toolNames.js';
import { textContent, toolError } from '../../utils/toolResponses.js';

function summarizeFriend(friend: Record<string, unknown>): Record<string, unknown> {
  const userId =
    typeof friend.userId === 'string'
      ? friend.userId
      : typeof friend.id === 'string'
        ? friend.id
        : undefined;
  return {
    userId,
    displayName: typeof friend.displayName === 'string' ? friend.displayName : undefined,
    status: typeof friend.status === 'string' ? friend.status : undefined,
    statusDescription:
      typeof friend.statusDescription === 'string' ? friend.statusDescription : undefined,
    statusEmoji: typeof friend.statusEmoji === 'string' ? friend.statusEmoji : undefined,
    location: typeof friend.location === 'string' ? friend.location : undefined,
    userIcon: typeof friend.userIcon === 'string' ? friend.userIcon : undefined,
    profilePicOverride:
      typeof friend.profilePicOverride === 'string' ? friend.profilePicOverride : undefined,
    currentAvatarImageUrl:
      typeof friend.currentAvatarImageUrl === 'string' ? friend.currentAvatarImageUrl : undefined,
    currentAvatarThumbnailImageUrl:
      typeof friend.currentAvatarThumbnailImageUrl === 'string'
        ? friend.currentAvatarThumbnailImageUrl
        : undefined,
    last_login: typeof friend.last_login === 'string' ? friend.last_login : undefined,
    last_platform: typeof friend.last_platform === 'string' ? friend.last_platform : undefined,
  };
}

export function registerCuratedFriendTools(server: McpServer): void {
  server.registerTool(
    toolName('vrchat.friends.search'),
    {
      description: 'Search friends by display name (read-only).',
      inputSchema: FriendSearchInputSchema,
      outputSchema: FriendSearchOutputSchema,
      annotations: readOnlyToolAnnotations,
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
    toolName('vrchat.friends.list'),
    {
      description:
        'List friends with cache-backed pagination (read-only). Defaults to online-only; set includeOffline=true to include offline friends.',
      inputSchema: FriendsListInputSchema,
      outputSchema: FriendsListOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const result = await listFriends(args ?? {});
        const detailLevel = args?.detailLevel === 'full' ? 'full' : 'summary';
        const friends =
          detailLevel === 'full'
            ? result.friends
            : result.friends.map((friend) => summarizeFriend(friend));

        const payload = {
          includeOffline: result.includeOffline,
          pageSize: result.pageSize,
          maxPages: result.maxPages,
          maxItems: result.maxItems,
          totalFriends: result.friends.length,
          truncated: result.meta.truncated,
          stale: result.meta.stale,
          segments: result.meta.segments,
          detailLevel,
          friends,
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
      description:
        'Summarize friends by status and location with enriched world/group info (read-only).',
      inputSchema: FriendsOverviewInputSchema,
      outputSchema: FriendsOverviewOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const result = await getFriendsOverview(args ?? {});
        const payload = {
          includeOffline: result.includeOffline,
          statusFilter: result.statusFilter,
          minInstanceUserCount: result.minInstanceUserCount,
          instanceDetailLevel: result.instanceDetailLevel,
          totalFriends: result.totalFriends,
          onlineCount: result.onlineCount,
          offlineCount: result.offlineCount,
          statusCounts: result.statusCounts,
          maxLocations: result.maxLocations,
          totalLocations: result.totalLocations,
          returnedLocations: result.returnedLocations,
          omittedLocations: result.omittedLocations,
          locationsTruncated: result.locationsTruncated,
          totals: result.totals,
          locations: result.locations,
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
    toolName('vrchat.friend_details'),
    {
      description:
        "Get a friend's profile, status, and location details by display name or userId (read-only).",
      inputSchema: FriendDetailsInputSchema,
      outputSchema: FriendDetailsOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const name = typeof args?.name === 'string' ? args.name : undefined;
        const userId = typeof args?.userId === 'string' ? args.userId : undefined;

        if (!name && !userId) {
          return toolError('Provide name or userId.');
        }

        const result = await getFriendDetails(args ?? {});
        if (!result.ok) {
          return toolError(result.reason, {
            status: result.status,
            message: result.reason,
            nextSteps: result.nextSteps,
          });
        }

        const payload = {
          friend: result.friend,
          profile: result.profile,
          location: result.location,
          instance: result.instance,
          world: result.world,
          group: result.group,
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
