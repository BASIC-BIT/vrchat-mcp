import { describe, it, expect } from 'vitest';
import type { CookieJar } from 'tough-cookie';
import { createVrctlAuthManager, type VrctlAuthManagerDeps } from '../../src/vrctl/auth.js';
import type { CookieStore } from '../../src/auth/cookieStore.js';

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

function makeFetch(html: string, setCookies: string[] = []): FetchImpl {
  const response = {
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
    });

    await auth.init();
    expect(auth.getStatus().loggedIn).toBe(false);

    await auth.setSessionCookies({ phpSessId: 'abc123', nss: 'nss456' });
    const header = await auth.getCookieHeader('https://vrc.tl/api/v1/events');
    expect(header).toContain('PHPSESSID=abc123');
    expect(header).toContain('_nss=nss456');
  });

  it('verifyStatus parses loggedIn from HTML when available', async () => {
    const store = new TestCookieStore();
    const fetchImpl = makeFetch(htmlWithLoggedIn(true), []);

    const auth = createVrctlAuthManager({
      store,
      siteUrl: 'https://vrc.tl',
      userAgent: 'test-agent',
      fetchImpl,
    });

    await auth.init();
    await auth.setSessionCookies({ phpSessId: 'abc123' });
    const status = await auth.verifyStatus();
    expect(status.verified).toBe(true);
    expect(status.loggedIn).toBe(true);
    expect(status.hasSessionCookie).toBe(true);
  });
});
