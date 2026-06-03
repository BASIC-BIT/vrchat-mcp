import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { RequestInfo, RequestInit } from 'undici';

const authModulePath = '../../src/auth/index.js';

interface AuthManagerLike {
  init: () => Promise<void>;
  startLoginServer: () => Promise<{ url: string; token: string }>;
  logout: () => Promise<void>;
  getStatus: () => { loggedIn: boolean };
  getCookieValue: (name: string, url?: string) => Promise<string | undefined>;
}

interface MockFetchEntry {
  status: number;
  json: unknown;
  cookies?: string[];
}

async function getAuthManager(): Promise<AuthManagerLike> {
  const mod = (await import(authModulePath)) as unknown as {
    authManager: AuthManagerLike;
  };
  return mod.authManager;
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

function createMockFetch(queue: MockFetchEntry[], realFetch: typeof fetch) {
  return vi.fn((input: RequestInfo, init?: RequestInit) => {
    const target = getTargetUrl(input);
    if (target.startsWith('http://127.0.0.1')) {
      return realFetch(input, init);
    }
    const next = queue.shift();
    if (!next) {
      return Promise.reject(new Error('Unexpected fetch call'));
    }
    return Promise.resolve({
      status: next.status,
      headers: { getSetCookie: () => next.cookies ?? [] },
      json: () => Promise.resolve(next.json),
    } as Response);
  });
}

describe.sequential('auth login server', () => {
  const realFetch = globalThis.fetch;
  const prevStore = process.env.VRCHAT_MCP_COOKIE_STORE;

  beforeEach(() => {
    process.env.VRCHAT_MCP_COOKIE_STORE = 'memory';
  });

  afterEach(async () => {
    if (globalThis.fetch !== realFetch) {
      globalThis.fetch = realFetch;
    }
    const authManager = await getAuthManager();
    await authManager.logout();
    if (prevStore === undefined) {
      delete process.env.VRCHAT_MCP_COOKIE_STORE;
    } else {
      process.env.VRCHAT_MCP_COOKIE_STORE = prevStore;
    }
  });

  it('reuses the same server when already running', async () => {
    const authManager = await getAuthManager();
    const first = await authManager.startLoginServer();
    const second = await authManager.startLoginServer();
    expect(second.token).toBe(first.token);
    expect(second.url).toContain(`token=${first.token}`);
  });

  it('rejects invalid tokens', async () => {
    const authManager = await getAuthManager();
    const { url } = await authManager.startLoginServer();
    const parsed = new URL(url);
    parsed.searchParams.set('token', 'nope');
    const res = await fetch(parsed.toString());
    expect(res.status).toBe(403);
    const body = await res.text();
    expect(body).toContain('Invalid token');
  });

  it('renders the login form on GET', async () => {
    const authManager = await getAuthManager();
    const { url } = await authManager.startLoginServer();
    const res = await fetch(url);
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain('VRChat MCP Login');
    expect(body).toContain('Username');
    expect(body).toContain('Password');
  });

  it('returns a validation error when credentials are missing', async () => {
    const authManager = await getAuthManager();
    const { url } = await authManager.startLoginServer();
    const parsed = new URL(url);
    parsed.pathname = '/submit';

    const res = await fetch(parsed.toString(), {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'username=&password=',
    });

    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain('Username and password are required');
  });

  it('rejects oversized login submissions', async () => {
    const authManager = await getAuthManager();
    const { url } = await authManager.startLoginServer();
    const parsed = new URL(url);
    parsed.pathname = '/submit';

    const res = await fetch(parsed.toString(), {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: `username=test&password=${'x'.repeat(17_000)}`,
    });

    expect(res.status).toBe(413);
    const body = await res.text();
    expect(body).toContain('Request body too large');
  });

  it('prompts for TOTP when required', async () => {
    const authManager = await getAuthManager();
    const { url } = await authManager.startLoginServer();
    const parsed = new URL(url);
    parsed.pathname = '/submit';

    const queue = [
      {
        status: 200,
        json: { requiresTwoFactorAuth: ['totp'] },
        cookies: ['auth=token; Domain=vrchat.cloud; Path=/'],
      },
    ];

    globalThis.fetch = createMockFetch(queue, realFetch);

    const res = await realFetch(parsed.toString(), {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'username=test&password=secret&totp=',
    });

    const body = await res.text();
    expect(body).toContain('Authenticator code required');
    expect(body).toContain('Authenticator code');
    expect(body).not.toContain('class="error">2FA');
    expect(body).not.toContain('name="username"');
    expect(body).not.toContain('name="password"');
  });

  it('reset clears persisted partial auth cookies', async () => {
    const authManager = await getAuthManager();
    const { url } = await authManager.startLoginServer();
    const parsed = new URL(url);
    parsed.pathname = '/submit';

    const queue = [
      {
        status: 200,
        json: { requiresTwoFactorAuth: ['totp'] },
        cookies: ['auth=token; Domain=vrchat.cloud; Path=/'],
      },
    ];

    globalThis.fetch = createMockFetch(queue, realFetch);

    await realFetch(parsed.toString(), {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'username=test&password=secret&totp=',
    });

    expect(await authManager.getCookieValue('auth')).toBe('token');

    parsed.pathname = '/reset';
    await realFetch(parsed.toString());

    await authManager.init();
    expect(await authManager.getCookieValue('auth')).toBeUndefined();
    expect(authManager.getStatus().loggedIn).toBe(false);
  });

  it('accepts unified TOTP code input on second attempt using pending creds', async () => {
    const authManager = await getAuthManager();
    const { url } = await authManager.startLoginServer();
    const parsed = new URL(url);
    parsed.pathname = '/submit';

    const queue = [
      {
        status: 200,
        json: { requiresTwoFactorAuth: ['totp'] },
        cookies: ['auth=token; Domain=vrchat.cloud; Path=/'],
      },
      {
        status: 200,
        json: { requiresTwoFactorAuth: ['totp'] },
        cookies: ['auth=token; Domain=vrchat.cloud; Path=/'],
      },
      {
        status: 200,
        json: {},
        cookies: ['twoFactorAuth=ok; Domain=vrchat.cloud; Path=/'],
      },
    ];

    globalThis.fetch = createMockFetch(queue, realFetch);

    await realFetch(parsed.toString(), {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'username=test&password=secret&totp=',
    });

    const res = await realFetch(parsed.toString(), {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'factorKind=totp&code=123456',
    });

    const body = await res.text();
    expect(body).toContain('Login successful');
  });

  it('reports TOTP verification errors', async () => {
    const authManager = await getAuthManager();
    const { url } = await authManager.startLoginServer();
    const parsed = new URL(url);
    parsed.pathname = '/submit';

    const queue = [
      {
        status: 200,
        json: { requiresTwoFactorAuth: ['totp'] },
        cookies: ['auth=token; Domain=vrchat.cloud; Path=/'],
      },
      {
        status: 401,
        json: {},
        cookies: [],
      },
    ];

    globalThis.fetch = createMockFetch(queue, realFetch);

    const res = await realFetch(parsed.toString(), {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'username=test&password=secret&totp=123456',
    });

    const body = await res.text();
    expect(body).toContain('TOTP verify failed: 401');
  });

  it('prompts for email OTP when required', async () => {
    const authManager = await getAuthManager();
    const { url } = await authManager.startLoginServer();
    const parsed = new URL(url);
    parsed.pathname = '/submit';

    const queue = [
      {
        status: 200,
        json: { requiresTwoFactorAuth: ['emailOtp'] },
        cookies: ['auth=token; Domain=vrchat.cloud; Path=/'],
      },
    ];

    globalThis.fetch = createMockFetch(queue, realFetch);

    const res = await realFetch(parsed.toString(), {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'username=test&password=secret&emailOtp=',
    });

    const body = await res.text();
    expect(body).toContain('Email verification required');
    expect(body).toContain('Email verification code');
    expect(body).not.toContain('class="error">2FA');
  });

  it('reports email OTP verification errors', async () => {
    const authManager = await getAuthManager();
    const { url } = await authManager.startLoginServer();
    const parsed = new URL(url);
    parsed.pathname = '/submit';

    const queue = [
      {
        status: 200,
        json: { requiresTwoFactorAuth: ['emailOtp'] },
        cookies: ['auth=token; Domain=vrchat.cloud; Path=/'],
      },
      {
        status: 401,
        json: {},
        cookies: [],
      },
    ];

    globalThis.fetch = createMockFetch(queue, realFetch);

    const res = await realFetch(parsed.toString(), {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'username=test&password=secret&emailOtp=123456',
    });

    const body = await res.text();
    expect(body).toContain('Email OTP verify failed: 401');
  });

  it('reports login failure when status is not 200', async () => {
    const authManager = await getAuthManager();
    const { url } = await authManager.startLoginServer();
    const parsed = new URL(url);
    parsed.pathname = '/submit';

    const queue = [
      {
        status: 403,
        json: {},
        cookies: ['auth=token; Domain=vrchat.cloud; Path=/'],
      },
    ];

    globalThis.fetch = createMockFetch(queue, realFetch);

    const res = await realFetch(parsed.toString(), {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'username=test&password=secret',
    });

    const body = await res.text();
    expect(body).toContain('Login failed: 403');
  });
});
