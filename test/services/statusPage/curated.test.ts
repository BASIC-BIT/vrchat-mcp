import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('undici', () => ({
  fetch: vi.fn(),
}));

import { fetch } from 'undici';
import { getStatusPageOverview } from '../../../src/services/statusPage/curated.js';

interface MockRoute {
  body: unknown;
  status?: number;
  statusText?: string;
}

function mockResponse(route: MockRoute): Awaited<ReturnType<typeof fetch>> {
  const status = route.status ?? 200;
  const statusText = route.statusText ?? 'OK';
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: () => Promise.resolve(route.body),
  } as Awaited<ReturnType<typeof fetch>>;
}

function mockFetchByUrl(routes: Record<string, MockRoute>): void {
  vi.mocked(fetch).mockImplementation((input) => {
    const url =
      typeof input === 'string' ? input : input instanceof URL ? input.toString() : undefined;
    if (!url) {
      throw new Error('Unexpected non-string fetch input in test.');
    }
    const route = routes[url];
    if (!route) {
      throw new Error(`Unexpected URL: ${url}`);
    }
    return Promise.resolve(mockResponse(route));
  });
}

function buildGraphRoutes(): Record<string, MockRoute> {
  return {
    'https://d31qqo63tn8lj0.cloudfront.net/visits.json': {
      body: [
        [1700000000, 100],
        [1700000060, 120],
      ],
    },
    'https://d31qqo63tn8lj0.cloudfront.net/apilatency.json': {
      body: [
        [1700000000, 0.2],
        [1700000060, 0.4],
      ],
    },
    'https://d31qqo63tn8lj0.cloudfront.net/apirequests.json': {
      body: [
        [1700000000, 1000],
        [1700000060, 1200],
      ],
    },
    'https://d31qqo63tn8lj0.cloudfront.net/apierrors.json': {
      body: [
        [1700000000, 0.01],
        [1700000060, 0.02],
      ],
    },
    'https://d31qqo63tn8lj0.cloudfront.net/extauth_steam.json': {
      body: [
        [1700000000, 0.95],
        [1700000060, 0.97],
      ],
    },
    'https://d31qqo63tn8lj0.cloudfront.net/extauth_steam_count.json': {
      body: [
        [1700000000, 500],
        [1700000060, 700],
      ],
    },
    'https://d31qqo63tn8lj0.cloudfront.net/extauth_oculus.json': {
      body: [
        [1700000000, 0.91],
        [1700000060, 0.94],
      ],
    },
    'https://d31qqo63tn8lj0.cloudfront.net/extauth_oculus_count.json': {
      body: [
        [1700000000, 300],
        [1700000060, 350],
      ],
    },
  };
}

describe('status page curated service', () => {
  afterEach(() => {
    vi.mocked(fetch).mockReset();
  });

  it('returns compact status overview with graph stats', async () => {
    const now = Date.now();
    const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000).toISOString();
    const tenDaysAgo = new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString();

    mockFetchByUrl({
      'https://status.vrchat.com/api/v2/summary.json': {
        body: {
          page: { name: 'VRChat', url: 'https://status.vrchat.com' },
          status: { indicator: 'critical', description: 'Major outage' },
          components: [
            { id: 'cmp_ok', name: 'API', status: 'operational' },
            { id: 'cmp_bad', name: 'Realtime', status: 'major_outage' },
          ],
        },
      },
      'https://status.vrchat.com/api/v2/incidents/unresolved.json': {
        body: {
          incidents: [
            {
              id: 'inc_open',
              name: 'Realtime outage',
              status: 'investigating',
              updated_at: twoHoursAgo,
            },
          ],
        },
      },
      'https://status.vrchat.com/api/v2/incidents.json': {
        body: {
          incidents: [
            {
              id: 'inc_open',
              name: 'Realtime outage',
              status: 'investigating',
              updated_at: twoHoursAgo,
            },
            { id: 'inc_recent', name: 'API slowdown', resolved_at: twoHoursAgo },
            { id: 'inc_old', name: 'Old incident', resolved_at: tenDaysAgo },
          ],
        },
      },
      'https://status.vrchat.com/api/v2/scheduled-maintenances/active.json': {
        body: {
          scheduled_maintenances: [{ id: 'mnt_active', name: 'Active maintenance' }],
        },
      },
      'https://status.vrchat.com/api/v2/scheduled-maintenances/upcoming.json': {
        body: {
          scheduled_maintenances: [{ id: 'mnt_upcoming', name: 'Upcoming maintenance' }],
        },
      },
      ...buildGraphRoutes(),
    });

    const result = await getStatusPageOverview({ recentHours: 72, maxItems: 5 });

    expect(result.status).toMatchObject({ up: false, indicator: 'critical' });
    expect(result.components).toMatchObject({ total: 2, nonOperational: 1 });
    expect(result.incidents).toMatchObject({ unresolvedCount: 1, recentCount: 1 });
    expect(result.maintenances).toMatchObject({ activeCount: 1, upcomingCount: 1 });
    expect(result.graphs).toHaveLength(6);

    const apiErrorRate = result.graphs.find((graph) => graph.key === 'api_error_rate');
    expect(apiErrorRate?.unit).toBe('percent');
    expect(apiErrorRate?.current).toBeCloseTo(2);

    const steamAuth = result.graphs.find((graph) => graph.key === 'steam_auth_success_rate');
    expect(steamAuth?.overlayCurrent).toBe(700);
  });

  it('omits graph calls when includeGraphs=false', async () => {
    mockFetchByUrl({
      'https://status.vrchat.com/api/v2/summary.json': {
        body: {
          page: { name: 'VRChat' },
          status: { indicator: 'none', description: 'All Systems Operational' },
          components: [],
        },
      },
      'https://status.vrchat.com/api/v2/incidents/unresolved.json': { body: { incidents: [] } },
      'https://status.vrchat.com/api/v2/incidents.json': { body: { incidents: [] } },
      'https://status.vrchat.com/api/v2/scheduled-maintenances/active.json': {
        body: { scheduled_maintenances: [] },
      },
      'https://status.vrchat.com/api/v2/scheduled-maintenances/upcoming.json': {
        body: { scheduled_maintenances: [] },
      },
    });

    const result = await getStatusPageOverview({ includeGraphs: false });

    expect(result.graphs).toEqual([]);
    expect(result.notes.join(' ')).toContain('includeGraphs=false');
  });

  it('adds note when optional endpoint fails', async () => {
    mockFetchByUrl({
      'https://status.vrchat.com/api/v2/summary.json': {
        body: {
          page: { name: 'VRChat' },
          status: { indicator: 'none' },
          components: [],
        },
      },
      'https://status.vrchat.com/api/v2/incidents/unresolved.json': { body: { incidents: [] } },
      'https://status.vrchat.com/api/v2/incidents.json': {
        body: { error: 'bad gateway' },
        status: 502,
        statusText: 'Bad Gateway',
      },
      'https://status.vrchat.com/api/v2/scheduled-maintenances/active.json': {
        body: { scheduled_maintenances: [] },
      },
      'https://status.vrchat.com/api/v2/scheduled-maintenances/upcoming.json': {
        body: { scheduled_maintenances: [] },
      },
    });

    const result = await getStatusPageOverview({ includeGraphs: false });

    expect(result.notes.some((note) => note.includes('Failed to read incidents.json'))).toBe(true);
  });

  it('counts only successfully mapped components in total', async () => {
    mockFetchByUrl({
      'https://status.vrchat.com/api/v2/summary.json': {
        body: {
          page: { name: 'VRChat' },
          status: { indicator: 'none' },
          components: [
            { id: 'cmp_ok', name: 'API', status: 'operational' },
            { id: 'cmp_bad', status: 'major_outage' },
          ],
        },
      },
      'https://status.vrchat.com/api/v2/incidents/unresolved.json': { body: { incidents: [] } },
      'https://status.vrchat.com/api/v2/incidents.json': { body: { incidents: [] } },
      'https://status.vrchat.com/api/v2/scheduled-maintenances/active.json': {
        body: { scheduled_maintenances: [] },
      },
      'https://status.vrchat.com/api/v2/scheduled-maintenances/upcoming.json': {
        body: { scheduled_maintenances: [] },
      },
    });

    const result = await getStatusPageOverview({ includeGraphs: false });

    expect(result.components).toMatchObject({ total: 1, nonOperational: 0 });
    expect(result.notes.some((note) => note.includes('Dropped 1 malformed components'))).toBe(true);
  });

  it('throws when summary endpoint fails', async () => {
    mockFetchByUrl({
      'https://status.vrchat.com/api/v2/summary.json': {
        body: { error: 'bad gateway' },
        status: 502,
        statusText: 'Bad Gateway',
      },
    });

    await expect(getStatusPageOverview({})).rejects.toThrow(
      'Request failed (502 Bad Gateway) for https://status.vrchat.com/api/v2/summary.json.'
    );
  });

  it('throws a timeout error when status page request aborts', async () => {
    vi.mocked(fetch).mockRejectedValue(Object.assign(new Error('aborted'), { name: 'AbortError' }));

    await expect(getStatusPageOverview({ includeGraphs: false })).rejects.toThrow(
      'Request timed out after 10000ms for https://status.vrchat.com/api/v2/summary.json.'
    );
  });
});
