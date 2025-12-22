import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const authModulePath = '../../src/auth/index.js';

async function loadAuthManager() {
  vi.resetModules();
  const mod = (await import(authModulePath)) as unknown as {
    authManager: {
      init: () => Promise<void>;
      logout: () => Promise<void>;
      getCookieHeader: (url: string) => Promise<string>;
      getCookieValue: (name: string, url?: string) => Promise<string | undefined>;
      setCookiesFromResponse: (url: string, setCookieHeaders: string[]) => Promise<void>;
      getStatus: () => { loggedIn: boolean };
      onStatusChange: (listener: (status: { loggedIn: boolean }) => void) => () => void;
    };
  };
  return mod.authManager;
}

describe('auth manager', () => {
  const prevStore = process.env.VRCHAT_MCP_COOKIE_STORE;

  beforeEach(() => {
    process.env.VRCHAT_MCP_COOKIE_STORE = 'memory';
  });

  afterEach(async () => {
    const authManager = await loadAuthManager();
    await authManager.logout();
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
});
