import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { request } from 'node:http';

const authModulePath = '../../src/auth/index.js';

interface AuthManagerForTest {
  init: () => Promise<void>;
  logout: () => Promise<void>;
  startLoginServer: () => Promise<{ url: string; token: string }>;
  getCookieHeader: (url: string) => Promise<string>;
  getCookieValue: (name: string, url?: string) => Promise<string | undefined>;
  setCookiesFromResponse: (url: string, setCookieHeaders: string[]) => Promise<void>;
  getStatus: () => { loggedIn: boolean };
  onStatusChange: (listener: (status: { loggedIn: boolean }) => void) => () => void;
}

const loadedAuthManagers: AuthManagerForTest[] = [];

async function loadAuthManager() {
  vi.resetModules();
  const mod = (await import(authModulePath)) as unknown as {
    authManager: AuthManagerForTest;
  };
  loadedAuthManagers.push(mod.authManager);
  return mod.authManager;
}

async function requestText(
  url: string,
  options: { method?: string; headers?: Record<string, string>; body?: string } = {}
): Promise<{ statusCode: number | undefined; body: string }> {
  const parsed = new URL(url);
  return await new Promise<{ statusCode: number | undefined; body: string }>((resolve, reject) => {
    const req = request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: `${parsed.pathname}${parsed.search}`,
        method: options.method ?? 'GET',
        headers: options.headers,
      },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk: string) => {
          body += chunk;
        });
        res.on('end', () => resolve({ statusCode: res.statusCode, body }));
      }
    );
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

describe('auth manager', () => {
  const prevStore = process.env.VRCHAT_MCP_COOKIE_STORE;

  beforeEach(() => {
    process.env.VRCHAT_MCP_COOKIE_STORE = 'memory';
  });

  afterEach(async () => {
    for (const authManager of loadedAuthManagers.splice(0)) {
      await authManager.logout();
    }
    if (prevStore === undefined) {
      delete process.env.VRCHAT_MCP_COOKIE_STORE;
    } else {
      process.env.VRCHAT_MCP_COOKIE_STORE = prevStore;
    }
  });

  it('stores cookies from response and reads them back', async () => {
    const authManager = await loadAuthManager();
    await authManager.setCookiesFromResponse('https://api.vrchat.cloud', [
      'auth=token; Domain=vrchat.cloud; Path=/',
      'twoFactorAuth=two; Domain=vrchat.cloud; Path=/',
    ]);

    const auth = await authManager.getCookieValue('auth');
    const header = await authManager.getCookieHeader('https://api.vrchat.cloud');
    expect(auth).toBe('token');
    expect(header).toContain('auth=token');
    expect(header).toContain('twoFactorAuth=two');
  });

  it('init marks loggedIn when stored auth cookie exists', async () => {
    const authManager = await loadAuthManager();
    await authManager.setCookiesFromResponse('https://api.vrchat.cloud', [
      'auth=token; Domain=vrchat.cloud; Path=/',
    ]);
    await authManager.init();
    expect(authManager.getStatus().loggedIn).toBe(true);
  });

  it('logout clears cookies and emits status change', async () => {
    const authManager = await loadAuthManager();
    await authManager.setCookiesFromResponse('https://api.vrchat.cloud', [
      'auth=token; Domain=vrchat.cloud; Path=/',
    ]);
    const listener = vi.fn();
    const unsubscribe = authManager.onStatusChange(listener);

    await authManager.logout();
    const auth = await authManager.getCookieValue('auth');
    expect(auth).toBeUndefined();
    expect(authManager.getStatus().loggedIn).toBe(false);
    expect(listener).toHaveBeenCalledWith({ loggedIn: false });

    unsubscribe();
  });

  it('rejects login requests with an unexpected host header', async () => {
    const authManager = await loadAuthManager();
    const { url } = await authManager.startLoginServer();

    const res = await requestText(url, { headers: { host: 'evil.example' } });

    expect(res.statusCode).toBe(403);
    expect(res.body).toBe('Invalid host');
  });

  it('accepts loopback alias host headers for local browser login requests', async () => {
    const authManager = await loadAuthManager();
    const { url } = await authManager.startLoginServer();
    const parsed = new URL(url);

    const res = await requestText(url, { headers: { host: `localhost:${parsed.port}` } });

    expect(res.statusCode).toBe(200);
    expect(res.body).toContain('VRChat MCP Login');
  });

  it('rejects login form posts from unexpected origins', async () => {
    const authManager = await loadAuthManager();
    const { url } = await authManager.startLoginServer();

    const res = await requestText(url.replace('/?', '/submit?'), {
      method: 'POST',
      headers: {
        origin: 'http://evil.example',
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: 'username=test&password=test',
    });

    expect(res.statusCode).toBe(403);
    expect(res.body).toBe('Invalid origin');
  });

  it('rejects login form posts from non-http origins', async () => {
    const authManager = await loadAuthManager();
    const { url } = await authManager.startLoginServer();
    const parsed = new URL(url);

    const res = await requestText(url.replace('/?', '/submit?'), {
      method: 'POST',
      headers: {
        origin: `ftp://localhost:${parsed.port}`,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: 'username=test&password=test',
    });

    expect(res.statusCode).toBe(403);
    expect(res.body).toBe('Invalid origin');
  });

  it('accepts loopback alias origins for local browser login posts', async () => {
    const authManager = await loadAuthManager();
    const { url } = await authManager.startLoginServer();
    const parsed = new URL(url);

    const res = await requestText(url.replace('/?', '/submit?'), {
      method: 'POST',
      headers: {
        origin: `http://localhost:${parsed.port}`,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: 'username=&password=',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toContain('Username and password are required');
  });
});
