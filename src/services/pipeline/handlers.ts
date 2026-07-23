import { FRIENDS_CHANGES_URI } from '../../resources/friendsChanges.js';
import { FRIENDS_SNAPSHOT_URI } from '../../resources/friendsSnapshot.js';
import { notifyResourceSubscribers } from '../../resources/subscriptions.js';
import { applyFriendEventToCache, recordFriendChange } from '../friends/changes.js';
import { pipelineManager } from './manager.js';

let registered = false;

export function registerPipelineHandlers(): void {
  if (registered) return;
  registered = true;

  pipelineManager.onEvent((event) => {
    const change = recordFriendChange(event);
    if (!change) return;
    applyFriendEventToCache(event);
    notifyResourceSubscribers(FRIENDS_CHANGES_URI);
    notifyResourceSubscribers(FRIENDS_SNAPSHOT_URI);
  });

  pipelineManager.start();
}
