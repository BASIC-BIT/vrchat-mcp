import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

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
  notifyResourceUpdated: vi.fn(),
}));

vi.mock('../../../src/resources/friendsChanges.js', () => ({
  FRIENDS_CHANGES_URI: 'vrchat://friends/changes',
}));

vi.mock('../../../src/resources/friendsSnapshot.js', () => ({
  FRIENDS_SNAPSHOT_URI: 'vrchat://friends/snapshot',
}));

import { pipelineManager } from '../../../src/services/pipeline/manager.js';
import { recordFriendChange, applyFriendEventToCache } from '../../../src/services/friends/changes.js';
import { notifyResourceUpdated } from '../../../src/resources/subscriptions.js';

describe('pipeline handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers handlers and notifies resources', async () => {
    vi.resetModules();
    let handler: ((event: unknown) => void) | null = null;
    vi.mocked(pipelineManager.onEvent).mockImplementation((cb: (event: unknown) => void) => {
      handler = cb;
      return () => {};
    });
    vi.mocked(recordFriendChange).mockReturnValue({
      sequence: 1,
      receivedAt: '2025-12-22T00:00:00Z',
      type: 'friend-online',
      userId: 'usr_1',
    });

    const { registerPipelineHandlers } = await import(
      '../../../src/services/pipeline/handlers.js'
    );
    const server = {} as McpServer;
    registerPipelineHandlers(server);
    registerPipelineHandlers(server);

    expect(pipelineManager.start).toHaveBeenCalledTimes(1);
    expect(pipelineManager.onEvent).toHaveBeenCalledTimes(1);

    handler?.({ type: 'friend-online', content: { userId: 'usr_1' }, receivedAt: '' });

    expect(applyFriendEventToCache).toHaveBeenCalled();
    expect(notifyResourceUpdated).toHaveBeenCalledWith(server, 'vrchat://friends/changes');
    expect(notifyResourceUpdated).toHaveBeenCalledWith(server, 'vrchat://friends/snapshot');
  });

  it('skips notifications when change is not recorded', async () => {
    vi.resetModules();
    let handler: ((event: unknown) => void) | null = null;
    vi.mocked(pipelineManager.onEvent).mockImplementation((cb: (event: unknown) => void) => {
      handler = cb;
      return () => {};
    });
    vi.mocked(recordFriendChange).mockReturnValue(null);

    const { registerPipelineHandlers } = await import(
      '../../../src/services/pipeline/handlers.js'
    );
    const server = {} as McpServer;
    registerPipelineHandlers(server);

    handler?.({ type: 'unknown', content: {}, receivedAt: '' });

    expect(applyFriendEventToCache).not.toHaveBeenCalled();
    expect(notifyResourceUpdated).not.toHaveBeenCalled();
  });
});
