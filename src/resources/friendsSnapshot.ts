import { type McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { fetchFriendsWithMeta } from '../services/friends/fetch.js';

export const FRIENDS_SNAPSHOT_URI = 'vrchat://friends/snapshot';

function parseNumber(value: unknown, fallback: number): number {
  if (Array.isArray(value)) return parseNumber(value[0], fallback);
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) return Math.floor(parsed);
  }
  return fallback;
}

function parseBoolean(value: unknown, fallback: boolean): boolean {
  if (Array.isArray(value)) return parseBoolean(value[0], fallback);
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  }
  return fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function registerFriendsSnapshotResource(server: McpServer): void {
  const template = new ResourceTemplate(`${FRIENDS_SNAPSHOT_URI}{?includeOffline,pageSize,maxPages}`, {
    list: undefined,
  });

  server.registerResource(
    'vrchat_friends_snapshot',
    template,
    {
      title: 'VRChat friends snapshot',
      description:
        'Snapshot of the friends list (cache-backed). Subscribe to receive update notifications.',
    },
    async (uri, variables) => {
      const includeOffline = parseBoolean(
        variables.includeOffline ?? uri.searchParams.get('includeOffline'),
        true,
      );
      const pageSize = clamp(
        parseNumber(variables.pageSize ?? uri.searchParams.get('pageSize'), 100),
        1,
        100,
      );
      const maxPages = clamp(
        parseNumber(variables.maxPages ?? uri.searchParams.get('maxPages'), 200),
        1,
        500,
      );

      const { friends, meta } = await fetchFriendsWithMeta({
        includeOffline,
        pageSize,
        maxPages,
      });

      const payload = {
        resource: 'friends_snapshot',
        includeOffline,
        pageSize,
        maxPages,
        totalFriends: friends.length,
        truncated: meta.truncated,
        stale: meta.stale,
        segments: meta.segments,
        friends,
      };

      return {
        contents: [
          {
            uri: uri.toString(),
            mimeType: 'application/json',
            text: JSON.stringify(payload, null, 2),
          },
        ],
      };
    },
  );
}
