import { fetch as undiciFetch, Headers } from 'undici';
import type { RequestInfo, RequestInit } from 'undici';
import { getConfig } from '../config/index.js';
import { vrctlAuthManager } from './auth.js';

export interface VrctlClock {
  now(): number;
  sleep(ms: number): Promise<void>;
}

export interface VrctlRequestPolicy {
  minIntervalMs: number;
  maxRetries: number;
  initialBackoffMs: number;
  maxBackoffMs: number;
  denyCooldownMs: number;
}

function parseRetryAfterMs(value: string, nowMs: number): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const seconds = Number.parseInt(trimmed, 10);
  if (!Number.isNaN(seconds) && seconds >= 0) return seconds * 1000;
  const dateMs = Date.parse(trimmed);
  if (!Number.isNaN(dateMs)) return Math.max(0, dateMs - nowMs);
  return null;
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 502 || status === 503 || status === 504;
}

function shouldRetry(status: number, attempt: number, policy: VrctlRequestPolicy): boolean {
  return isRetryableStatus(status) && attempt < policy.maxRetries;
}

function retryDelayMs(
  res: Response,
  attempt: number,
  policy: VrctlRequestPolicy,
  nowMs: number
): number {
  const retryAfter = res.headers.get?.('retry-after');
  const retryAfterMs = retryAfter ? parseRetryAfterMs(retryAfter, nowMs) : null;
  return retryAfterMs ?? computeBackoffMs(attempt, policy);
}

function computeBackoffMs(attempt: number, policy: VrctlRequestPolicy): number {
  if (attempt <= 0) return 0;
  const base = policy.initialBackoffMs * 2 ** (attempt - 1);
  return Math.min(policy.maxBackoffMs, base);
}

class SerialGate {
  private chain: Promise<void> = Promise.resolve();

  run<T>(fn: () => Promise<T>): Promise<T> {
    const next = this.chain.then(fn, fn);
    this.chain = next.then(
      () => undefined,
      () => undefined
    );
    return next;
  }
}

export interface VrctlClientDeps {
  fetchImpl?: VrctlFetch;
  siteUrl?: string;
  apiBaseUrl?: string;
  userAgent?: string;
  policy?: Partial<VrctlRequestPolicy>;
  clock?: Partial<VrctlClock>;
  auth?: {
    getCookieHeader: (url: string) => Promise<string>;
    setCookiesFromResponse: (url: string, setCookieHeaders: string[]) => Promise<void>;
  };
}

export type VrctlFetch = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

export class VrctlClient {
  private fetchImpl: VrctlFetch;
  private siteUrl: URL;
  private apiBaseUrl: URL;
  private userAgent: string;
  private auth: NonNullable<VrctlClientDeps['auth']>;
  private clock: VrctlClock;
  private policy: VrctlRequestPolicy;
  private gate = new SerialGate();
  private nextAllowedMs = 0;
  private blockedUntilMs: number | null = null;

  constructor(deps: VrctlClientDeps = {}) {
    const config = getConfig();
    this.fetchImpl = deps.fetchImpl ?? (undiciFetch as VrctlFetch);
    this.siteUrl = new URL(deps.siteUrl ?? config.vrctl.siteUrl);
    this.apiBaseUrl = new URL(deps.apiBaseUrl ?? config.vrctl.apiBaseUrl);
    this.userAgent = deps.userAgent ?? config.vrctl.userAgent;

    const defaultNow = () => Date.now();
    const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
    const injectedNow = deps.clock?.now;
    const injectedSleep = deps.clock?.sleep;
    this.clock = {
      now: injectedNow ? () => injectedNow() : defaultNow,
      sleep: injectedSleep ? (ms) => injectedSleep(ms) : defaultSleep,
    };

    this.policy = {
      ...config.vrctl.requests,
      ...deps.policy,
    };

    this.auth = deps.auth ?? {
      getCookieHeader: (url) => vrctlAuthManager.getCookieHeader(url),
      setCookiesFromResponse: (url, setCookieHeaders) =>
        vrctlAuthManager.setCookiesFromResponse(url, setCookieHeaders),
    };
  }

  private blockRequests(reason: string): void {
    const until = this.clock.now() + this.policy.denyCooldownMs;
    this.blockedUntilMs = until;
    throw new Error(
      `${reason} (cooldown ${Math.round(this.policy.denyCooldownMs / 1000)}s; blockedUntil=${new Date(
        until
      ).toISOString()})`
    );
  }

  private assertNotBlocked(): void {
    if (this.blockedUntilMs === null) return;
    const now = this.clock.now();
    if (now >= this.blockedUntilMs) {
      this.blockedUntilMs = null;
      return;
    }
    throw new Error(
      `vrc.tl requests are temporarily blocked until ${new Date(this.blockedUntilMs).toISOString()} (received 403 Access Denied)`
    );
  }

  private async waitForRateLimit(): Promise<void> {
    const minIntervalMs = this.policy.minIntervalMs;
    if (minIntervalMs <= 0) return;
    const now = this.clock.now();
    const waitMs = Math.max(0, this.nextAllowedMs - now);
    if (waitMs > 0) {
      await this.clock.sleep(waitMs);
    }
    this.nextAllowedMs = this.clock.now() + minIntervalMs;
  }

  buildSiteUrl(pathname: string, query?: Record<string, string | undefined>): string {
    const url = new URL(pathname, this.siteUrl);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v === undefined) continue;
        url.searchParams.set(k, v);
      }
    }
    return url.toString();
  }

  buildApiUrl(pathname: string, query?: Record<string, string | undefined>): string {
    const url = new URL(pathname, this.apiBaseUrl);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v === undefined) continue;
        url.searchParams.set(k, v);
      }
    }
    return url.toString();
  }

  private async request(
    url: string,
    options: { accept: string }
  ): Promise<{ status: number; bodyText: string }> {
    return await this.gate.run(async () => {
      this.assertNotBlocked();

      let attempt = 0;
      while (true) {
        this.assertNotBlocked();
        await this.waitForRateLimit();

        const headers = new Headers();
        headers.set('user-agent', this.userAgent);
        headers.set('accept', options.accept);
        const cookieHeader = await this.auth.getCookieHeader(url);
        if (cookieHeader) headers.set('cookie', cookieHeader);

        let res: Awaited<ReturnType<VrctlFetch>>;
        try {
          res = await this.fetchImpl(url, { method: 'GET', headers });
        } catch (err) {
          if (attempt >= this.policy.maxRetries) throw err;
          attempt += 1;
          const delayMs = computeBackoffMs(attempt, this.policy);
          if (delayMs > 0) await this.clock.sleep(delayMs);
          continue;
        }

        if (res.status === 403) {
          // Avoid persisting WAF/challenge cookies.
          this.blockRequests('vrc.tl returned 403 Access Denied');
        }

        const setCookieHeaders = res.headers.getSetCookie?.() ?? [];
        if (setCookieHeaders.length) {
          await this.auth.setCookiesFromResponse(url, setCookieHeaders);
        }

        const bodyText = await res.text();

        if (shouldRetry(res.status, attempt, this.policy)) {
          attempt += 1;
          const delayMs = retryDelayMs(res, attempt, this.policy, this.clock.now());
          if (delayMs > 0) await this.clock.sleep(delayMs);
          continue;
        }

        return { status: res.status, bodyText };
      }
    });
  }

  async getSiteHtml(pathname: string, query?: Record<string, string | undefined>): Promise<string> {
    const url = this.buildSiteUrl(pathname, query);
    const { status, bodyText } = await this.request(url, { accept: 'text/html,*/*;q=0.8' });
    if (status < 200 || status >= 300) {
      throw new Error(`vrc.tl HTML request failed (${status})`);
    }
    return bodyText;
  }

  async getApiJson<T = unknown>(
    pathname: string,
    query?: Record<string, string | undefined>
  ): Promise<T> {
    const url = this.buildApiUrl(pathname, query);
    const { status, bodyText } = await this.request(url, { accept: 'application/json,*/*;q=0.8' });
    let data: unknown = null;
    try {
      data = bodyText ? JSON.parse(bodyText) : null;
    } catch {
      // keep null
    }

    if (status < 200 || status >= 300) {
      const message =
        data && typeof data === 'object' && 'exception' in (data as Record<string, unknown>)
          ? String((data as Record<string, unknown>).exception)
          : 'Request failed';
      throw new Error(`vrc.tl API request failed (${status}): ${message}`);
    }
    return data as T;
  }
}

export function createVrctlClient(deps: VrctlClientDeps = {}): VrctlClient {
  return new VrctlClient(deps);
}

export const vrctlClient = createVrctlClient();
