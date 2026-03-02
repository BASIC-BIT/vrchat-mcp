import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('undici', () => ({
  fetch: vi.fn(),
}));

import { fetch } from 'undici';
import {
  getStatusPageSummary,
  listActiveStatusPageMaintenances,
  listOpenStatusPageIncidents,
} from '../../../src/services/statusPage/curated.js';

function mockResponse(
  body: unknown,
  init?: { status?: number; statusText?: string }
): Awaited<ReturnType<typeof fetch>> {
  const status = init?.status ?? 200;
  const statusText = init?.statusText ?? '';
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: () => Promise.resolve(body),
  } as Awaited<ReturnType<typeof fetch>>;
}

describe('status page curated service', () => {
  afterEach(() => {
    vi.mocked(fetch).mockReset();
  });

  it('maps summary endpoint payload', async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockResponse({
        page: { name: 'VRChat', url: 'https://status.vrchat.com' },
        status: { indicator: 'minor', description: 'Partial outage' },
        components: [
          { id: 'cmp_1', name: 'API', status: 'operational' },
          { id: 'cmp_2', name: 'Realtime', status: 'major_outage' },
        ],
        incidents: [{ id: 'inc_1', name: 'Realtime outage', status: 'identified' }],
        scheduled_maintenances: [],
      })
    );

    await expect(getStatusPageSummary()).resolves.toMatchObject({
      status: { indicator: 'minor' },
      components: {
        total: 2,
        nonOperational: 1,
        nonOperationalItems: [{ id: 'cmp_2' }],
      },
      incidents: {
        open: 1,
      },
    });
  });

  it('maps unresolved incidents endpoint payload', async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockResponse({
        page: { name: 'VRChat' },
        incidents: [{ id: 'inc_1', name: 'API outage', impact: 'major' }],
      })
    );

    await expect(listOpenStatusPageIncidents()).resolves.toMatchObject({
      totalOpenIncidents: 1,
      incidents: [{ id: 'inc_1', impact: 'major' }],
    });
  });

  it('maps active maintenances endpoint payload', async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockResponse({
        page: { name: 'VRChat' },
        scheduled_maintenances: [
          {
            id: 'mnt_1',
            name: 'Database maintenance',
            status: 'in_progress',
            scheduled_for: '2026-03-02T10:00:00Z',
          },
        ],
      })
    );

    await expect(listActiveStatusPageMaintenances()).resolves.toMatchObject({
      totalActiveMaintenances: 1,
      maintenances: [{ id: 'mnt_1', status: 'in_progress' }],
    });
  });

  it('throws clear error on non-2xx status response', async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockResponse({ error: 'bad gateway' }, { status: 502, statusText: 'Bad Gateway' })
    );

    await expect(getStatusPageSummary()).rejects.toThrow(
      'VRChat status page request failed (502 Bad Gateway) for summary.json.'
    );
  });
});
