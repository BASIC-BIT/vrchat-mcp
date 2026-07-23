import { Client } from '@modelcontextprotocol/sdk/client';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ResourceUpdatedNotificationSchema } from '@modelcontextprotocol/sdk/types.js';
import { request as httpRequest } from 'node:http';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import {
  notifyResourceSubscribers,
  registerResourceSubscriptions,
  unregisterResourceSubscriptions,
} from '../../src/resources/subscriptions.js';
import {
  startHttpTransport,
  type HttpTransportHandle,
  type HttpTransportOptions,
} from '../../src/transports/http.js';

const TOKEN = 'test-bearer-token-that-is-at-least-32-characters';
const handles: HttpTransportHandle[] = [];

function makeServer(): Promise<McpServer> {
  const server = new McpServer({ name: 'http-test', version: '1.0.0' });
  server.registerTool(
    'echo',
    {
      description: 'Echo input.',
      inputSchema: z.object({ text: z.string() }),
    },
    ({ text }) => ({
      content: [{ type: 'text', text }],
    })
  );
  return Promise.resolve(server);
}

async function start(
  overrides: Partial<Omit<HttpTransportOptions, 'serverFactory'>> = {}
): Promise<HttpTransportHandle> {
  const handle = await startHttpTransport({
    port: 0,
    path: '/mcp',
    bearerToken: TOKEN,
    maxSessions: 4,
    rateLimitPerMinute: 100,
    serverFactory: makeServer,
    ...overrides,
  });
  handles.push(handle);
  return handle;
}

function makeClient(
  url: string,
  token = TOKEN
): {
  client: Client;
  transport: StreamableHTTPClientTransport;
} {
  const transport = new StreamableHTTPClientTransport(new URL(url), {
    requestInit: {
      headers: { Authorization: `Bearer ${token}` },
    },
  });
  const client = new Client({ name: 'http-test-client', version: '1.0.0' });
  return { client, transport };
}

async function postWithHost(url: string, host: string): Promise<number> {
  const target = new URL(url);
  return await new Promise<number>((resolve, reject) => {
    const request = httpRequest(
      {
        hostname: target.hostname,
        port: target.port,
        path: target.pathname,
        method: 'POST',
        headers: {
          Accept: 'application/json, text/event-stream',
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
          Host: host,
        },
      },
      (response) => {
        response.resume();
        response.once('end', () => resolve(response.statusCode ?? 0));
      }
    );
    request.once('error', reject);
    request.end('{}');
  });
}

afterEach(async () => {
  await Promise.all(handles.splice(0).map((handle) => handle.close()));
});

describe('Streamable HTTP transport', () => {
  it('requires a strong bearer token before listening', async () => {
    await expect(
      startHttpTransport({
        port: 0,
        path: '/mcp',
        bearerToken: 'short',
        maxSessions: 1,
        rateLimitPerMinute: 10,
        serverFactory: makeServer,
      })
    ).rejects.toThrow(/at least 32 characters/);
  });

  it('initializes a stateful session and calls tools', async () => {
    const handle = await start();
    const { client, transport } = makeClient(handle.url);

    await client.connect(transport);
    expect(transport.sessionId).toBeTruthy();
    expect(handle.sessionCount()).toBe(1);
    const tools = await client.listTools();
    expect(tools.tools.map((tool) => tool.name)).toContain('echo');
    const result = await client.callTool({ name: 'echo', arguments: { text: 'hello' } });
    expect(result.content).toEqual([{ type: 'text', text: 'hello' }]);

    await transport.terminateSession();
    expect(handle.sessionCount()).toBe(0);
    await transport.close();
  });

  it('isolates multiple client sessions and enforces the session cap', async () => {
    const handle = await start({ maxSessions: 2 });
    const first = makeClient(handle.url);
    const second = makeClient(handle.url);
    const third = makeClient(handle.url);

    await first.client.connect(first.transport);
    await second.client.connect(second.transport);
    expect(handle.sessionCount()).toBe(2);
    await expect(third.client.connect(third.transport)).rejects.toThrow();

    await first.transport.terminateSession();
    expect(handle.sessionCount()).toBe(1);
    await second.transport.terminateSession();
    await Promise.all([first.transport.close(), second.transport.close(), third.transport.close()]);
  });

  it('reaps abandoned idle sessions so they do not exhaust the session cap', async () => {
    const released = vi.fn();
    const handle = await start({
      maxSessions: 1,
      sessionIdleTimeoutMs: 50,
      releaseServer: released,
    });
    const abandoned = makeClient(handle.url);
    await abandoned.client.connect(abandoned.transport);
    expect(handle.sessionCount()).toBe(1);

    await abandoned.transport.close();
    await vi.waitFor(() => expect(handle.sessionCount()).toBe(0), { timeout: 2_000 });
    expect(released).toHaveBeenCalledTimes(1);

    const replacement = makeClient(handle.url);
    await replacement.client.connect(replacement.transport);
    expect(handle.sessionCount()).toBe(1);
    await replacement.transport.terminateSession();
    await replacement.transport.close();
  });

  it('delivers resource updates to every subscribed HTTP session', async () => {
    const makeResourceServer = async (): Promise<McpServer> => {
      const server = await makeServer();
      server.registerResource(
        'friends-snapshot',
        'vrchat://friends/snapshot',
        { mimeType: 'application/json' },
        () =>
          Promise.resolve({
            contents: [
              {
                uri: 'vrchat://friends/snapshot',
                mimeType: 'application/json',
                text: '{}',
              },
            ],
          })
      );
      registerResourceSubscriptions(server);
      return server;
    };
    const handle = await startHttpTransport({
      port: 0,
      path: '/mcp',
      bearerToken: TOKEN,
      maxSessions: 2,
      rateLimitPerMinute: 100,
      serverFactory: makeResourceServer,
      releaseServer: unregisterResourceSubscriptions,
    });
    handles.push(handle);
    const first = makeClient(handle.url);
    const second = makeClient(handle.url);
    const firstUpdated = vi.fn();
    const secondUpdated = vi.fn();
    first.client.setNotificationHandler(ResourceUpdatedNotificationSchema, firstUpdated);
    second.client.setNotificationHandler(ResourceUpdatedNotificationSchema, secondUpdated);
    await first.client.connect(first.transport);
    await second.client.connect(second.transport);
    await first.client.subscribeResource({ uri: 'vrchat://friends/snapshot' });
    await second.client.subscribeResource({ uri: 'vrchat://friends/snapshot' });

    notifyResourceSubscribers('vrchat://friends/snapshot');

    await vi.waitFor(() => {
      expect(firstUpdated).toHaveBeenCalled();
      expect(secondUpdated).toHaveBeenCalled();
    });
    await Promise.all([first.transport.terminateSession(), second.transport.terminateSession()]);
    await Promise.all([first.transport.close(), second.transport.close()]);
  });

  it('rejects missing authentication and hostile browser origins', async () => {
    const handle = await start();
    const unauthorized = await fetch(handle.url, {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/event-stream',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    expect(unauthorized.status).toBe(401);
    expect(unauthorized.headers.get('www-authenticate')).toBe('Bearer');

    const unauthorizedMalformed = await fetch(handle.url, {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/event-stream',
        'Content-Type': 'application/json',
      },
      body: '{',
    });
    expect(unauthorizedMalformed.status).toBe(401);

    const hostileOrigin = await fetch(handle.url, {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/event-stream',
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        Origin: 'https://evil.example',
      },
      body: JSON.stringify({}),
    });
    expect(hostileOrigin.status).toBe(403);

    expect(await postWithHost(handle.url, 'evil.example')).toBe(403);

    const localOrigin = await fetch(handle.url, {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/event-stream',
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        Origin: `http://localhost:${handle.port}`,
      },
      body: JSON.stringify({}),
    });
    expect(localOrigin.status).toBe(400);
  });

  it('distinguishes missing and expired session identifiers', async () => {
    const handle = await start();
    const request = (sessionId?: string) =>
      fetch(handle.url, {
        method: 'POST',
        headers: {
          Accept: 'application/json, text/event-stream',
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
          ...(sessionId ? { 'Mcp-Session-Id': sessionId } : {}),
        },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }),
      });

    expect((await request()).status).toBe(400);
    expect((await request('expired-session')).status).toBe(404);
  });

  it('rate limits repeated MCP requests', async () => {
    const handle = await start({ rateLimitPerMinute: 1 });
    const request = () =>
      fetch(handle.url, {
        method: 'POST',
        headers: {
          Accept: 'application/json, text/event-stream',
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

    expect((await request()).status).toBe(400);
    const limited = await request();
    expect(limited.status).toBe(429);
    expect(limited.headers.get('retry-after')).toBe('60');
  });

  it('rejects oversized request bodies', async () => {
    const handle = await start();
    const response = await fetch(handle.url, {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/event-stream',
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ payload: 'x'.repeat(257 * 1024) }),
    });
    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toMatchObject({
      error: { message: 'Request body too large' },
    });
  });

  it('releases every server during graceful shutdown', async () => {
    const released = vi.fn();
    const handle = await start({ releaseServer: released });
    const first = makeClient(handle.url);
    const second = makeClient(handle.url);
    await first.client.connect(first.transport);
    await second.client.connect(second.transport);

    await handle.close();
    expect(handle.sessionCount()).toBe(0);
    expect(released).toHaveBeenCalledTimes(2);
    await Promise.all([first.transport.close(), second.transport.close()]);
  });
});
