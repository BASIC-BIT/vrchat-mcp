import { describe, it, expect } from 'vitest';
import type { CookieJar } from 'tough-cookie';
import { createVrctlAuthManager, type VrctlAuthManagerDeps } from '../../src/vrctl/auth.js';
import type { CookieStore } from '../../src/auth/cookieStore.js';
import { VrctlBlockState } from '../../src/vrctl/blockState.js';

class TestCookieStore implements CookieStore {
  jar: CookieJar | null = null;
  load(): Promise<CookieJar | null> {
    return Promise.resolve(this.jar);
  }
  save(jar: CookieJar): Promise<void> {
    this.jar = jar;
    return Promise.resolve();
  }
  clear(): Promise<void> {
    this.jar = null;
    return Promise.resolve();
  }
}

type FetchImpl = NonNullable<VrctlAuthManagerDeps['fetchImpl']>;
type FetchResponse = Awaited<ReturnType<FetchImpl>>;

function makeFetch(html: string, setCookies: string[] = [], status = 200): FetchImpl {
  const response = {
    status,
    headers: { getSetCookie: () => setCookies } as unknown,
    text: () => Promise.resolve(html),
  } as unknown as FetchResponse;
  return (() => Promise.resolve(response)) as unknown as FetchImpl;
}

function htmlWithLoggedIn(loggedIn: boolean): string {
  return `<!doctype html><html><body>
    <script>
      window.timeline={"personal":{"loggedIn":${loggedIn}},"misc":{"categories":[],"tags":[]}};
    </script>
  </body></html>`;
}

describe('vrctl auth manager', () => {
  it('saves session cookies and uses them in cookie header', async () => {
    const store = new TestCookieStore();
    const auth = createVrctlAuthManager({
      store,
      siteUrl: 'https://vrc.tl',
      userAgent: 'test-agent',
      fetchImpl: makeFetch(htmlWithLoggedIn(false)),
      blockState: new VrctlBlockState(),
    });

    await auth.init();
    expect(auth.getStatus().loggedIn).toBe(false);

    await auth.setSessionCookies({ phpSessId: 'abc123', nss: 'nss456' });
    const header = await auth.getCookieHeader('https://vrc.tl/api/v1/events');
    expect(header).toContain('PHPSESSID=abc123');
    expect(header).toContain('_nss=nss456');
  });

  it('logout waits for server.close completion before returning', async () => {
    const store = new TestCookieStore();
    const auth = createVrctlAuthManager({
      store,
      siteUrl: 'https://vrc.tl',
      userAgent: 'test-agent',
      fetchImpl: makeFetch(htmlWithLoggedIn(false)),
      blockState: new VrctlBlockState(),
    });

    await auth.init();

    let closeSettled = false;
    const fakeServer = {
      close: (cb: (err?: Error) => void) => {
        setTimeout(() => {
          closeSettled = true;
          cb();
        }, 0);
      },
    };

    const internal = auth as unknown as {
      server: { close: (cb: (err?: Error) => void) => void } | null;
      port: number | null;
      serverToken: string | null;
    };
    internal.server = fakeServer;
    internal.port = 43210;
    internal.serverToken = 'tok';

    const logoutPromise = auth.logout();
    expect(closeSettled).toBe(false);
    await logoutPromise;

    expect(closeSettled).toBe(true);
    expect(internal.server).toBeNull();
    expect(internal.port).toBeNull();
    expect(internal.serverToken).toBeNull();
  });

  it('verifyStatus skips cookie persistence and activates cooldown on 403', async () => {
    const store = new TestCookieStore();
    let saveCalls = 0;
    const origSave = store.save.bind(store);
    store.save = (jar: CookieJar) => {
      saveCalls++;
      return origSave(jar);
    };

    // Set up auth with valid cookies first
    const auth = createVrctlAuthManager({
      store,
      siteUrl: 'https://vrc.tl',
      userAgent: 'test-agent',
      fetchImpl: makeFetch('Access Denied', ['PHPSESSID=bad_waf_cookie; Path=/'], 403),
      blockState: new VrctlBlockState(),
    });

    await auth.init();
    await auth.setSessionCookies({ phpSessId: 'good_session' });
    const savesBeforeVerify = saveCalls;

    const status = await auth.verifyStatus();

    // Should not have persisted the WAF Set-Cookie headers
    expect(saveCalls).toBe(savesBeforeVerify);
    expect(status.verified).toBe(false);
    expect(status.message).toContain('403');
    expect(status.message).toContain('cooldown');

    // Cookie jar should still have the good session cookie
    const header = await auth.getCookieHeader('https://vrc.tl/');
    expect(header).toContain('PHPSESSID=good_session');
  });

  it('verifyStatus blocks subsequent calls during 403 cooldown', async () => {
    const store = new TestCookieStore();
    let fetchCallCount = 0;

    const countingFetch: FetchImpl = (() => {
      fetchCallCount++;
      const response = {
        status: 403,
        headers: { getSetCookie: () => [] } as unknown,
        text: () => Promise.resolve('Access Denied'),
      } as unknown as FetchResponse;
      return Promise.resolve(response);
    }) as unknown as FetchImpl;

    const auth = createVrctlAuthManager({
      store,
      siteUrl: 'https://vrc.tl',
      userAgent: 'test-agent',
      fetchImpl: countingFetch,
      blockState: new VrctlBlockState(),
    });

    await auth.init();

    // First call triggers the 403 + cooldown
    const status1 = await auth.verifyStatus();
    expect(status1.message).toContain('403');
    expect(fetchCallCount).toBe(1);

    // Second call should be blocked without making a network request
    const status2 = await auth.verifyStatus();
    expect(status2.message).toContain('blocked');
    expect(fetchCallCount).toBe(1); // No additional fetch
  });

  it('403 from auth manager blocks client via shared blockState', async () => {
    const store = new TestCookieStore();
    const sharedBlock = new VrctlBlockState();

    // Auth manager that will hit a 403
    const auth = createVrctlAuthManager({
      store,
      siteUrl: 'https://vrc.tl',
      userAgent: 'test-agent',
      fetchImpl: makeFetch('Access Denied', [], 403),
      blockState: sharedBlock,
    });

    await auth.init();

    // Trigger 403 via auth manager
    const status = await auth.verifyStatus();
    expect(status.message).toContain('403');

    // Shared block state should now be active
    expect(sharedBlock.isBlocked()).toBe(true);
  });

  it('verifyStatus parses loggedIn from HTML when available', async () => {
    const store = new TestCookieStore();
    const fetchImpl = makeFetch(htmlWithLoggedIn(true), []);

    const auth = createVrctlAuthManager({
      store,
      siteUrl: 'https://vrc.tl',
      userAgent: 'test-agent',
      fetchImpl,
      blockState: new VrctlBlockState(),
    });

    await auth.init();
    await auth.setSessionCookies({ phpSessId: 'abc123' });
    const status = await auth.verifyStatus();
    expect(status.verified).toBe(true);
    expect(status.loggedIn).toBe(true);
    expect(status.hasSessionCookie).toBe(true);
  });
});
