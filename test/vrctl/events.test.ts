import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resetConfigCacheForTest } from '../../src/config/index.js';
import { cacheManager } from '../../src/services/cache.js';

vi.mock('../../src/vrctl/auth.js', () => ({
  vrctlAuthManager: {
    verifyStatus: vi.fn(),
    getStatus: vi.fn(),
    getCookieHeader: vi.fn(),
    setCookiesFromResponse: vi.fn(),
  },
}));

import { createVrctlEventsService } from '../../src/vrctl/events.js';
import { vrctlAuthManager } from '../../src/vrctl/auth.js';

interface VrctlAuthMock {
  verifyStatus: ReturnType<typeof vi.fn>;
  getStatus: ReturnType<typeof vi.fn>;
  getCookieHeader: ReturnType<typeof vi.fn>;
  setCookiesFromResponse: ReturnType<typeof vi.fn>;
}

interface MinimalVrctlClient {
  getSiteHtml: (pathname: string) => Promise<string>;
  getApiJson: <T = unknown>(
    pathname: string,
    query?: Record<string, string | undefined>
  ) => Promise<T>;
}

const touchedEnvKeys = new Set<string>();

function setEnv(key: string, value?: string) {
  touchedEnvKeys.add(key);
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

function resetEnv() {
  for (const key of touchedEnvKeys) {
    delete process.env[key];
  }
  touchedEnvKeys.clear();
}

function htmlBootstrap(loggedIn: boolean) {
  return `<!doctype html><html><body>
    <script>
      window.timeline={
        "misc":{
          "categories":[{"id":1,"name":"Music","urlName":"music"}],
          "tags":[
            {"id":1,"name":"NSFW","eventsHiddenForNotLoggedIn":true,"tagHiddenForNotLoggedIn":true},
            {"id":6,"name":"SFW","eventsHiddenForNotLoggedIn":false,"tagHiddenForNotLoggedIn":true},
            {"id":2,"name":"Windows","eventsHiddenForNotLoggedIn":false,"tagHiddenForNotLoggedIn":false}
          ]
        },
        "personal":{"loggedIn":${loggedIn}}
      };
    </script>
  </body></html>`;
}

function bootstrap(loggedIn: boolean) {
  return {
    loggedIn,
    categories: [{ id: 1, name: 'Music', urlName: 'music' }],
    tags: [
      { id: 1, name: 'NSFW', eventsHiddenForNotLoggedIn: true, tagHiddenForNotLoggedIn: true },
      { id: 6, name: 'SFW', eventsHiddenForNotLoggedIn: false, tagHiddenForNotLoggedIn: true },
      { id: 2, name: 'Windows', eventsHiddenForNotLoggedIn: false, tagHiddenForNotLoggedIn: false },
    ],
  };
}

describe('vrctl events service', () => {
  beforeEach(() => {
    resetConfigCacheForTest();
    cacheManager.invalidateAll();
    setEnv('VRCHAT_MCP_VRCTL_ENABLED', '1');
  });

  afterEach(() => {
    resetEnv();
    resetConfigCacheForTest();
    cacheManager.invalidateAll();
  });

  it('pages chunks and filters hidden events when logged out', async () => {
    const auth = vi.mocked(vrctlAuthManager, true) as unknown as VrctlAuthMock;
    auth.getStatus.mockReturnValue({
      loggedIn: false,
      verified: false,
      hasSessionCookie: false,
    });

    const client: MinimalVrctlClient = {
      getSiteHtml: () => Promise.resolve(htmlBootstrap(false)),
      getApiJson: <T = unknown>(pathname: string, query?: Record<string, string | undefined>) => {
        if (pathname !== '/events') {
          return Promise.reject(new Error(`Unexpected pathname: ${pathname}`));
        }
        const before = query?.before;
        const after = query?.after;
        if (before === '2026-02-08') {
          return Promise.resolve({
            range: { firstLoadedDay: '2026-02-06', lastLoadedDay: '2026-02-08' },
            eventData: {
              events: [
                {
                  id: 99,
                  name: 'Earlier Event',
                  start: 1,
                  end: 2,
                  duration: 1,
                  category: 1,
                  tags: [2],
                  organizers: [10],
                },
              ],
              organizers: [{ id: 10, name: 'Club A', slug: 'club-a', shortCode: 'A.0001' }],
              performers: [],
            },
          } as unknown as T);
        }
        if (after === '2026-02-12') {
          return Promise.resolve({
            range: { firstLoadedDay: '2026-02-12', lastLoadedDay: '2026-02-14' },
            eventData: {
              events: [
                {
                  id: 102,
                  name: 'Later Event',
                  start: 10,
                  end: 11,
                  duration: 1,
                  category: 1,
                  tags: [2],
                  organizers: [10],
                },
              ],
              organizers: [{ id: 10, name: 'Club A', slug: 'club-a', shortCode: 'A.0001' }],
              performers: [],
            },
          } as unknown as T);
        }
        // base chunk
        return Promise.resolve({
          range: { firstLoadedDay: '2026-02-09', lastLoadedDay: '2026-02-11' },
          eventData: {
            events: [
              {
                id: 100,
                name: 'Visible Event',
                start: 5,
                end: 6,
                duration: 1,
                category: 1,
                tags: [6, 2],
                organizers: [10],
              },
              {
                id: 101,
                name: 'Hidden Event',
                start: 7,
                end: 8,
                duration: 1,
                category: 1,
                tags: [1],
                organizers: [10],
              },
            ],
            organizers: [{ id: 10, name: 'Club A', slug: 'club-a', shortCode: 'A.0001' }],
            performers: [],
          },
        } as unknown as T);
      },
    };

    const service = createVrctlEventsService({
      client,
      metadata: { getBootstrapCached: () => Promise.resolve(bootstrap(false)) },
    });
    const result = await service.listCurrentEvents({ daysBack: 3, daysForward: 3, maxItems: 50 });

    expect(result.range).toEqual({ firstLoadedDay: '2026-02-06', lastLoadedDay: '2026-02-14' });
    expect(result.auth).toMatchObject({ loggedIn: false, verified: true, hasSessionCookie: false });
    expect(result.filteredHiddenEvents).toBe(1);
    expect(result.events.some((e) => e.eventId === 101)).toBe(false);

    const visible = result.events.find((e) => e.eventId === 100);
    expect(visible).toBeTruthy();
    expect(visible!.tags).toEqual(['Windows']);
  });

  it('getEventById resolves slots and performers', async () => {
    const auth = vi.mocked(vrctlAuthManager, true) as unknown as VrctlAuthMock;
    auth.getStatus.mockReturnValue({
      loggedIn: true,
      verified: true,
      hasSessionCookie: true,
    });

    const client: MinimalVrctlClient = {
      getSiteHtml: () => Promise.resolve(htmlBootstrap(true)),
      getApiJson: <T = unknown>(pathname: string) => {
        if (pathname === '/events/123') {
          return Promise.resolve({
            events: [
              {
                id: 123,
                name: 'Detail Event',
                start: 5,
                end: 6,
                duration: 1,
                category: 1,
                tags: [2],
                organizers: [10],
                description: 'Hello',
                eventSlots: [
                  {
                    id: 'slot-1',
                    start: 5,
                    duration: 60,
                    performers: [1, 2],
                    order: 1,
                    flag: 'doors',
                  },
                ],
              },
            ],
            organizers: [{ id: 10, name: 'Club A', slug: 'club-a', shortCode: 'A.0001' }],
            performers: [
              { id: 1, name: 'DJ A' },
              { id: 2, name: 'DJ B' },
            ],
          } as unknown as T);
        }
        return Promise.reject(new Error(`Unexpected pathname: ${pathname}`));
      },
    };

    const service = createVrctlEventsService({
      client,
      metadata: { getBootstrapCached: () => Promise.resolve(bootstrap(true)) },
    });
    const result = await service.getEventById(123);

    expect(result.auth).toMatchObject({ loggedIn: true, verified: true, hasSessionCookie: true });
    expect(result.event.eventId).toBe(123);
    expect(result.event.eventSlots[0].performers).toEqual([
      { performerId: 1, name: 'DJ A' },
      { performerId: 2, name: 'DJ B' },
    ]);
  });

  it('getEventById rejects hidden events when logged out', async () => {
    const auth = vi.mocked(vrctlAuthManager, true) as unknown as VrctlAuthMock;
    auth.getStatus.mockReturnValue({
      loggedIn: false,
      verified: true,
      hasSessionCookie: false,
    });

    const client: MinimalVrctlClient = {
      getSiteHtml: () => Promise.resolve(htmlBootstrap(false)),
      getApiJson: <T = unknown>(pathname: string) => {
        if (pathname !== '/events/999') {
          return Promise.reject(new Error(`Unexpected pathname: ${pathname}`));
        }
        return Promise.resolve({
          events: [
            {
              id: 999,
              name: 'Hidden Event',
              start: 5,
              end: 6,
              duration: 1,
              category: 1,
              tags: [1],
              organizers: [10],
              eventSlots: [],
            },
          ],
          organizers: [{ id: 10, name: 'Club A' }],
          performers: [],
        } as unknown as T);
      },
    };

    const service = createVrctlEventsService({
      client,
      metadata: { getBootstrapCached: () => Promise.resolve(bootstrap(false)) },
    });
    await expect(service.getEventById(999)).rejects.toThrow(/hidden/i);
  });
});
