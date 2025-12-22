import { type McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { friendsChangeStore } from '../services/friends/changes.js';

export const FRIENDS_CHANGES_URI = 'vrchat://friends/changes';

function parseNumber(value: unknown, fallback: number): number {
  if (Array.isArray(value)) return parseNumber(value[0], fallback);
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) return Math.floor(parsed);
  }
  return fallback;
}

export function registerFriendsChangesResource(server: McpServer): void {
  const template = new ResourceTemplate(`${FRIENDS_CHANGES_URI}{?after,limit}`, {
    list: undefined,
  });

  server.registerResource(
    'vrchat_friends_changes',
    template,
    {
      title: 'VRChat friend change feed',
      description:
        'Delta feed for friend changes (online/offline/location/add/remove). Use resources/subscribe for updates.',
    },
    (uri, variables) => {
      const after = parseNumber(variables.after ?? uri.searchParams.get('after'), 0);
      const limit = parseNumber(variables.limit ?? uri.searchParams.get('limit'), 200);
      const snapshot = friendsChangeStore.snapshot(after, limit);
      const payload = {
        resource: 'friends_changes',
        after: snapshot.after,
        nextAfter: snapshot.nextAfter,
        truncated: snapshot.truncated,
        changedIds: snapshot.changedIds,
        events: snapshot.events,
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
