import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';

const authModulePath = '../../src/auth/index.js';

interface AuthManagerLike {
  startLoginServer: () => Promise<{ url: string; token: string }>;
  logout: () => Promise<void>;
}

async function getAuthManager(): Promise<AuthManagerLike> {
  const mod = (await import(authModulePath)) as unknown as {
    authManager: AuthManagerLike;
  };
  return mod.authManager;
}

describe.sequential('auth login server', () => {
  const realFetch = globalThis.fetch;

  afterEach(async () => {
    if (globalThis.fetch !== realFetch) {
      globalThis.fetch = realFetch;
    }
    const authManager = await getAuthManager();
    await authManager.logout();
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
    expect(body).toContain('VRChat Login');
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

    globalThis.fetch = vi.fn(async (input: RequestInfo, init?: RequestInit) => {
      const target = typeof input === 'string' ? input : input.toString();
      if (target.startsWith('http://127.0.0.1')) {
        return realFetch(input, init);
      }
      const next = queue.shift();
      if (!next) throw new Error('Unexpected fetch call');
      return {
        status: next.status,
        headers: { getSetCookie: () => next.cookies ?? [] },
        json: async () => next.json,
      } as Response;
    });

    const res = await realFetch(parsed.toString(), {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'username=test&password=secret&totp=',
    });

    const body = await res.text();
    expect(body).toContain('2FA required (TOTP)');
  });

  it('accepts TOTP on second attempt using pending creds', async () => {
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

    globalThis.fetch = vi.fn(async (input: RequestInfo, init?: RequestInit) => {
      const target = typeof input === 'string' ? input : input.toString();
      if (target.startsWith('http://127.0.0.1')) {
        return realFetch(input, init);
      }
      const next = queue.shift();
      if (!next) throw new Error('Unexpected fetch call');
      return {
        status: next.status,
        headers: { getSetCookie: () => next.cookies ?? [] },
        json: async () => next.json,
      } as Response;
    });

    await realFetch(parsed.toString(), {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'username=test&password=secret&totp=',
    });

    const res = await realFetch(parsed.toString(), {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'username=&password=&totp=123456',
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

    globalThis.fetch = vi.fn(async (input: RequestInfo, init?: RequestInit) => {
      const target = typeof input === 'string' ? input : input.toString();
      if (target.startsWith('http://127.0.0.1')) {
        return realFetch(input, init);
      }
      const next = queue.shift();
      if (!next) throw new Error('Unexpected fetch call');
      return {
        status: next.status,
        headers: { getSetCookie: () => next.cookies ?? [] },
        json: async () => next.json,
      } as Response;
    });

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

    globalThis.fetch = vi.fn(async (input: RequestInfo, init?: RequestInit) => {
      const target = typeof input === 'string' ? input : input.toString();
      if (target.startsWith('http://127.0.0.1')) {
        return realFetch(input, init);
      }
      const next = queue.shift();
      if (!next) throw new Error('Unexpected fetch call');
      return {
        status: next.status,
        headers: { getSetCookie: () => next.cookies ?? [] },
        json: async () => next.json,
      } as Response;
    });

    const res = await realFetch(parsed.toString(), {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'username=test&password=secret&emailOtp=',
    });

    const body = await res.text();
    expect(body).toContain('Email OTP');
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

    globalThis.fetch = vi.fn(async (input: RequestInfo, init?: RequestInit) => {
      const target = typeof input === 'string' ? input : input.toString();
      if (target.startsWith('http://127.0.0.1')) {
        return realFetch(input, init);
      }
      const next = queue.shift();
      if (!next) throw new Error('Unexpected fetch call');
      return {
        status: next.status,
        headers: { getSetCookie: () => next.cookies ?? [] },
        json: async () => next.json,
      } as Response;
    });

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

    globalThis.fetch = vi.fn(async (input: RequestInfo, init?: RequestInit) => {
      const target = typeof input === 'string' ? input : input.toString();
      if (target.startsWith('http://127.0.0.1')) {
        return realFetch(input, init);
      }
      const next = queue.shift();
      if (!next) throw new Error('Unexpected fetch call');
      return {
        status: next.status,
        headers: { getSetCookie: () => next.cookies ?? [] },
        json: async () => next.json,
      } as Response;
    });

    const res = await realFetch(parsed.toString(), {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'username=test&password=secret',
    });

    const body = await res.text();
    expect(body).toContain('Login failed: 403');
  });
});
