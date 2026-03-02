import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerCuratedStatusPageTools } from '../../../src/tools/curated/statusPage.js';
import { FakeServer } from '../../helpers/fake-server.js';
import { getStatusPageOverview } from '../../../src/services/statusPage/index.js';

vi.mock('../../../src/services/statusPage/index.js', () => ({
  getStatusPageOverview: vi.fn(),
}));

describe('curated status page tools', () => {
  beforeEach(() => {
    vi.mocked(getStatusPageOverview).mockReset();
  });

  it('maps overview payload', async () => {
    vi.mocked(getStatusPageOverview).mockResolvedValue({
      checkedAt: '2026-03-02T00:00:00.000Z',
      recentHours: 72,
      maxItems: 5,
      page: { name: 'VRChat', url: 'https://status.vrchat.com' },
      status: { up: true, indicator: 'none', description: 'All Systems Operational' },
      components: { total: 5, nonOperational: 0, nonOperationalItems: [] },
      graphs: [
        {
          key: 'online_users',
          title: 'Online users',
          unit: 'count',
          current: 1,
          min: 1,
          max: 1,
          samples: 1,
        },
      ],
      incidents: {
        unresolvedCount: 0,
        unresolved: [],
        recentCount: 1,
        recent: [{ id: 'inc_1', name: 'API outage' }],
      },
      maintenances: {
        activeCount: 0,
        active: [],
        upcomingCount: 1,
        upcoming: [{ id: 'mnt_1', name: 'Maintenance' }],
      },
      notes: [],
    });

    const server = new FakeServer();
    registerCuratedStatusPageTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_status_page_overview');
    expect(tool).toBeTruthy();

    const result = await tool!.handler({ recentHours: 72, maxItems: 5 });
    expect(getStatusPageOverview).toHaveBeenCalledWith({ recentHours: 72, maxItems: 5 });
    expect(result).toMatchObject({
      structuredContent: {
        status: { up: true },
        incidents: { recentCount: 1 },
        maintenances: { upcomingCount: 1 },
      },
    });
  });

  it('returns tool error when overview fetch fails', async () => {
    vi.mocked(getStatusPageOverview).mockRejectedValue(new Error('Boom'));

    const server = new FakeServer();
    registerCuratedStatusPageTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_status_page_overview');
    const result = await tool!.handler({});

    expect(result).toMatchObject({
      isError: true,
      structuredContent: { error: 'Boom' },
    });
  });
});
