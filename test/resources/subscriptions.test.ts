import { describe, it, expect, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SubscribeRequestSchema, UnsubscribeRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import {
  registerResourceSubscriptions,
  isResourceSubscribed,
  notifyResourceUpdated,
} from '../../src/resources/subscriptions.js';

class FakeResourceServer {
  handlers = new Map<unknown, (request: { params: { uri: string } }) => unknown>();
  server = {
    setRequestHandler: vi.fn(
      (schema: unknown, handler: (request: { params: { uri: string } }) => unknown) => {
        this.handlers.set(schema, handler);
      },
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
    expect(isResourceSubscribed('vrchat://friends/changes')).toBe(true);

    notifyResourceUpdated(server as unknown as McpServer, 'vrchat://friends/changes?after=2');
    expect(server.server.sendResourceUpdated).toHaveBeenCalledWith({
      uri: 'vrchat://friends/changes?after=2',
    });

    unsubscribe?.({ params: { uri: 'vrchat://friends/changes?after=3' } });
    expect(isResourceSubscribed('vrchat://friends/changes')).toBe(false);
  });
});
