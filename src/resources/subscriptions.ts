import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  SubscribeRequestSchema,
  UnsubscribeRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { logger } from '../infra/logger.js';

const subscriptionsByServer = new Map<McpServer, Set<string>>();

function normalizeUri(uri: string): string {
  try {
    const url = new URL(uri);
    url.hash = '';
    url.search = '';
    return url.toString();
  } catch {
    return uri;
  }
}

export function registerResourceSubscriptions(server: McpServer): void {
  if (subscriptionsByServer.has(server)) return;
  const subscriptions = new Set<string>();
  subscriptionsByServer.set(server, subscriptions);

  server.server.setRequestHandler(SubscribeRequestSchema, (request) => {
    const normalized = normalizeUri(request.params.uri);
    subscriptions.add(normalized);
    return {};
  });

  server.server.setRequestHandler(UnsubscribeRequestSchema, (request) => {
    const normalized = normalizeUri(request.params.uri);
    subscriptions.delete(normalized);
    return {};
  });
}

export function unregisterResourceSubscriptions(server: McpServer): void {
  subscriptionsByServer.delete(server);
}

export function isResourceSubscribed(server: McpServer, uri: string): boolean {
  const normalized = normalizeUri(uri);
  return subscriptionsByServer.get(server)?.has(normalized) ?? false;
}

export function notifyResourceUpdated(server: McpServer, uri: string): void {
  if (!isResourceSubscribed(server, uri)) return;
  void Promise.resolve(server.server.sendResourceUpdated({ uri })).catch((error: unknown) => {
    logger.warn('Failed to notify an MCP resource subscriber.', {
      message: error instanceof Error ? error.message : String(error),
    });
  });
}

export function notifyResourceSubscribers(uri: string): void {
  for (const server of subscriptionsByServer.keys()) {
    notifyResourceUpdated(server, uri);
  }
}
