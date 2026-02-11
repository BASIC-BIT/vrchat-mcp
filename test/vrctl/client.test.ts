import { describe, it, expect, vi } from 'vitest';
import type { RequestInfo, RequestInit } from 'undici';
import { createVrctlClient, type VrctlFetch } from '../../src/vrctl/client.js';

interface FetchQueueEntry {
  status: number;
  bodyText: string;
  headers?: Record<string, string>;
  cookies?: string[];
}

function getTargetUrl(input: RequestInfo): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  if (typeof input === 'object' && input !== null && 'url' in input) {
    const url = (input as { url?: unknown }).url;
    if (typeof url === 'string') return url;
  }
  return '';
}

function createFakeClock(startMs = 0) {
  let nowMs = startMs;
  const sleeps: number[] = [];

  return {
    now: () => nowMs,
    sleep: (ms: number) => {
      sleeps.push(ms);
      nowMs += ms;
      return Promise.resolve();
    },
    advance: (ms: number) => {
      nowMs += ms;
    },
    get sleeps() {
      return sleeps;
    },
  };
}

function createMockFetch(queue: FetchQueueEntry[], clock: { now: () => number }) {
  const calls: { url: string; at: number }[] = [];

  const fn = vi.fn((input: RequestInfo, init?: RequestInit) => {
    void init;
    const url = getTargetUrl(input);
    calls.push({ url, at: clock.now() });

    const next = queue.shift();
    if (!next) {
      return Promise.reject(new Error('Unexpected fetch call'));
    }

    const lowerHeaders = Object.fromEntries(
      Object.entries(next.headers ?? {}).map(([k, v]) => [k.toLowerCase(), v])
    );

    return Promise.resolve({
      status: next.status,
      headers: {
        getSetCookie: () => next.cookies ?? [],
        get: (name: string) => lowerHeaders[name.toLowerCase()] ?? null,
      },
      text: () => Promise.resolve(next.bodyText),
    } as Response);
  });

  return { fetchImpl: fn, calls };
}

describe('vrctl client request policy', () => {
  it('rate limits requests and runs them serially', async () => {
    const clock = createFakeClock(0);
    const queue: FetchQueueEntry[] = [
      { status: 200, bodyText: '{"ok":true}' },
      { status: 200, bodyText: '{"ok":true}' },
    ];
    const { fetchImpl, calls } = createMockFetch(queue, clock);

    const client = createVrctlClient({
      fetchImpl: fetchImpl as unknown as VrctlFetch,
      siteUrl: 'https://example.test',
      apiBaseUrl: 'https://example.test/api/v1',
      policy: {
        minIntervalMs: 1000,
        maxRetries: 0,
        initialBackoffMs: 1,
        maxBackoffMs: 1,
        denyCooldownMs: 1000,
      },
      clock,
      auth: {
        getCookieHeader: () => Promise.resolve(''),
        setCookiesFromResponse: () => Promise.resolve(),
      },
    });

    await Promise.all([client.getApiJson('/events'), client.getApiJson('/events')]);
    expect(calls).toHaveLength(2);
    expect(calls[1].at - calls[0].at).toBeGreaterThanOrEqual(1000);
  });

  it('retries 429 responses using Retry-After and backoff', async () => {
    const clock = createFakeClock(0);
    const queue: FetchQueueEntry[] = [
      {
        status: 429,
        bodyText: '{"error":"rate limited"}',
        headers: { 'retry-after': '2' },
      },
      { status: 200, bodyText: '{"ok":true}' },
    ];
    const { fetchImpl, calls } = createMockFetch(queue, clock);

    const client = createVrctlClient({
      fetchImpl: fetchImpl as unknown as VrctlFetch,
      siteUrl: 'https://example.test',
      apiBaseUrl: 'https://example.test/api/v1',
      policy: {
        minIntervalMs: 0,
        maxRetries: 1,
        initialBackoffMs: 500,
        maxBackoffMs: 8000,
        denyCooldownMs: 1000,
      },
      clock,
      auth: {
        getCookieHeader: () => Promise.resolve(''),
        setCookiesFromResponse: () => Promise.resolve(),
      },
    });

    const result = await client.getApiJson('/events');
    expect(result).toEqual({ ok: true });
    expect(calls).toHaveLength(2);
    expect(clock.sleeps).toContain(2000);
  });

  it('blocks further requests after a 403 Access Denied', async () => {
    const clock = createFakeClock(0);
    const queue: FetchQueueEntry[] = [
      {
        status: 403,
        bodyText: '<h1>Access Denied</h1>',
        cookies: ['PHPSESSID=blocked; Path=/; HttpOnly'],
      },
      { status: 200, bodyText: '{"ok":true}' },
    ];
    const { fetchImpl, calls } = createMockFetch(queue, clock);
    const setCookiesFromResponse = vi.fn(() => Promise.resolve());

    const client = createVrctlClient({
      fetchImpl: fetchImpl as unknown as VrctlFetch,
      siteUrl: 'https://example.test',
      apiBaseUrl: 'https://example.test/api/v1',
      policy: {
        minIntervalMs: 0,
        maxRetries: 0,
        initialBackoffMs: 1,
        maxBackoffMs: 1,
        denyCooldownMs: 1000,
      },
      clock,
      auth: {
        getCookieHeader: () => Promise.resolve(''),
        setCookiesFromResponse,
      },
    });

    await expect(client.getSiteHtml('/')).rejects.toThrow(/403 Access Denied/i);
    expect(setCookiesFromResponse).not.toHaveBeenCalled();
    expect(calls).toHaveLength(1);

    await expect(client.getApiJson('/events')).rejects.toThrow(/temporarily blocked/i);
    expect(calls).toHaveLength(1);

    clock.advance(1001);
    const ok = await client.getApiJson('/events');
    expect(ok).toEqual({ ok: true });
    expect(calls).toHaveLength(2);
  });
});
