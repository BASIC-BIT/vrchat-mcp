import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerFriendsChangesResource } from './friendsChanges.js';
import { registerFriendsSnapshotResource } from './friendsSnapshot.js';
import { registerResourceSubscriptions } from './subscriptions.js';

export function registerResources(server: McpServer): void {
  registerFriendsChangesResource(server);
  registerFriendsSnapshotResource(server);
  registerResourceSubscriptions(server);
}
