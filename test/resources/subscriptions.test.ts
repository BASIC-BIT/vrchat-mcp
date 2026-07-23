import { describe, it, expect, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  SubscribeRequestSchema,
  UnsubscribeRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {
  registerResourceSubscriptions,
  isResourceSubscribed,
  notifyResourceUpdated,
  notifyResourceSubscribers,
  unregisterResourceSubscriptions,
} from '../../src/resources/subscriptions.js';

class FakeResourceServer {
  handlers = new Map<unknown, (request: { params: { uri: string } }) => unknown>();
  server = {
    setRequestHandler: vi.fn(
      (schema: unknown, handler: (request: { params: { uri: string } }) => unknown) => {
        this.handlers.set(schema, handler);
      }
    ),
    sendResourceUpdated: vi.fn(),
  };
}

describe('resource subscriptions', () => {
  it('tracks subscriptions and notifies updates', () => {
    const server = new FakeResourceServer();
    registerResourceSubscriptions(server as unknown as McpServer);

    const subscribe = server.handlers.get(SubscribeRequestSchema);
    const unsubscribe = server.handlers.get(UnsubscribeRequestSchema);
    expect(subscribe).toBeTruthy();
    expect(unsubscribe).toBeTruthy();

    subscribe?.({ params: { uri: 'vrchat://friends/changes?after=1#hash' } });
    const cast = server as unknown as McpServer;
    expect(isResourceSubscribed(cast, 'vrchat://friends/changes')).toBe(true);

    notifyResourceUpdated(cast, 'vrchat://friends/changes?after=2');
    expect(server.server.sendResourceUpdated).toHaveBeenCalledWith({
      uri: 'vrchat://friends/changes?after=2',
    });

    unsubscribe?.({ params: { uri: 'vrchat://friends/changes?after=3' } });
    expect(isResourceSubscribed(cast, 'vrchat://friends/changes')).toBe(false);
    unregisterResourceSubscriptions(cast);
  });

  it('fans updates out only to subscribed live servers', () => {
    const first = new FakeResourceServer();
    const second = new FakeResourceServer();
    const firstCast = first as unknown as McpServer;
    const secondCast = second as unknown as McpServer;
    registerResourceSubscriptions(firstCast);
    registerResourceSubscriptions(secondCast);

    first.handlers.get(SubscribeRequestSchema)?.({
      params: { uri: 'vrchat://friends/snapshot?pageSize=10' },
    });

    notifyResourceSubscribers('vrchat://friends/snapshot');

    expect(first.server.sendResourceUpdated).toHaveBeenCalledWith({
      uri: 'vrchat://friends/snapshot',
    });
    expect(second.server.sendResourceUpdated).not.toHaveBeenCalled();

    unregisterResourceSubscriptions(firstCast);
    notifyResourceSubscribers('vrchat://friends/snapshot');
    expect(first.server.sendResourceUpdated).toHaveBeenCalledTimes(1);
    unregisterResourceSubscriptions(secondCast);
  });
});
