import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/services/pipeline/manager.js', () => ({
  pipelineManager: {
    onEvent: vi.fn(),
    start: vi.fn(),
  },
}));

vi.mock('../../../src/services/friends/changes.js', () => ({
  recordFriendChange: vi.fn(),
  applyFriendEventToCache: vi.fn(),
}));

vi.mock('../../../src/resources/subscriptions.js', () => ({
  notifyResourceSubscribers: vi.fn(),
}));

vi.mock('../../../src/resources/friendsChanges.js', () => ({
  FRIENDS_CHANGES_URI: 'vrchat://friends/changes',
}));

vi.mock('../../../src/resources/friendsSnapshot.js', () => ({
  FRIENDS_SNAPSHOT_URI: 'vrchat://friends/snapshot',
}));

import { pipelineManager } from '../../../src/services/pipeline/manager.js';
import {
  recordFriendChange,
  applyFriendEventToCache,
} from '../../../src/services/friends/changes.js';
import { notifyResourceSubscribers } from '../../../src/resources/subscriptions.js';

describe('pipeline handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers handlers and notifies resources', async () => {
    vi.resetModules();
    let handler: ((event: unknown) => void) | null = null;
    const onEventSpy = vi.spyOn(pipelineManager, 'onEvent');
    const startSpy = vi.spyOn(pipelineManager, 'start');
    onEventSpy.mockImplementation((cb: (event: unknown) => void) => {
      handler = cb;
      const unsubscribe = vi.fn();
      return unsubscribe;
    });
    vi.mocked(recordFriendChange).mockReturnValue({
      sequence: 1,
      receivedAt: '2025-12-22T00:00:00Z',
      type: 'friend-online',
      userId: 'usr_1',
    });

    const { registerPipelineHandlers } = await import('../../../src/services/pipeline/handlers.js');
    registerPipelineHandlers();
    registerPipelineHandlers();

    expect(startSpy).toHaveBeenCalledTimes(1);
    expect(onEventSpy).toHaveBeenCalledTimes(1);

    handler?.({ type: 'friend-online', content: { userId: 'usr_1' }, receivedAt: '' });

    expect(applyFriendEventToCache).toHaveBeenCalled();
    expect(notifyResourceSubscribers).toHaveBeenCalledWith('vrchat://friends/changes');
    expect(notifyResourceSubscribers).toHaveBeenCalledWith('vrchat://friends/snapshot');
  });

  it('skips notifications when change is not recorded', async () => {
    vi.resetModules();
    let handler: ((event: unknown) => void) | null = null;
    const onEventSpy = vi.spyOn(pipelineManager, 'onEvent');
    onEventSpy.mockImplementation((cb: (event: unknown) => void) => {
      handler = cb;
      const unsubscribe = vi.fn();
      return unsubscribe;
    });
    vi.mocked(recordFriendChange).mockReturnValue(null);

    const { registerPipelineHandlers } = await import('../../../src/services/pipeline/handlers.js');
    registerPipelineHandlers();

    handler?.({ type: 'unknown', content: {}, receivedAt: '' });

    expect(applyFriendEventToCache).not.toHaveBeenCalled();
    expect(notifyResourceSubscribers).not.toHaveBeenCalled();
  });
});
