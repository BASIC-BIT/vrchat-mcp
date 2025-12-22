import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  SubscribeRequestSchema,
  UnsubscribeRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const subscriptions = new Set<string>();
const registeredServers = new WeakSet<object>();

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
  if (registeredServers.has(server)) return;
  registeredServers.add(server);

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

export function isResourceSubscribed(uri: string): boolean {
  const normalized = normalizeUri(uri);
  return subscriptions.has(normalized);
}

export function notifyResourceUpdated(server: McpServer, uri: string): void {
  if (!isResourceSubscribed(uri)) return;
  void server.server.sendResourceUpdated({ uri });
}
