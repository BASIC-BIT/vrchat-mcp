import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FRIENDS_CHANGES_URI } from '../../resources/friendsChanges.js';
import { FRIENDS_SNAPSHOT_URI } from '../../resources/friendsSnapshot.js';
import { notifyResourceUpdated } from '../../resources/subscriptions.js';
import { applyFriendEventToCache, recordFriendChange } from '../friends/changes.js';
import { pipelineManager } from './manager.js';

let registered = false;

export function registerPipelineHandlers(server: McpServer): void {
  if (registered) return;
  registered = true;

  pipelineManager.onEvent((event) => {
    const change = recordFriendChange(event);
    if (!change) return;
    applyFriendEventToCache(event);
    notifyResourceUpdated(server, FRIENDS_CHANGES_URI);
    notifyResourceUpdated(server, FRIENDS_SNAPSHOT_URI);
  });

  pipelineManager.start();
}
