import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerCuratedStatusPageTools } from '../../../src/tools/curated/statusPage.js';
import { FakeServer } from '../../helpers/fake-server.js';
import {
  getStatusPageSummary,
  listActiveStatusPageMaintenances,
  listOpenStatusPageIncidents,
} from '../../../src/services/statusPage/index.js';

vi.mock('../../../src/services/statusPage/index.js', () => ({
  getStatusPageSummary: vi.fn(),
  listOpenStatusPageIncidents: vi.fn(),
  listActiveStatusPageMaintenances: vi.fn(),
}));

describe('curated status page tools', () => {
  beforeEach(() => {
    vi.mocked(getStatusPageSummary).mockReset();
    vi.mocked(listOpenStatusPageIncidents).mockReset();
    vi.mocked(listActiveStatusPageMaintenances).mockReset();
  });

  it('maps summary payload', async () => {
    vi.mocked(getStatusPageSummary).mockResolvedValue({
      page: { name: 'VRChat', url: 'https://status.vrchat.com' },
      status: { indicator: 'none', description: 'All Systems Operational' },
      components: {
        total: 2,
        nonOperational: 1,
        nonOperationalItems: [{ id: 'cmp_1', name: 'API / Website', status: 'major_outage' }],
      },
      incidents: {
        open: 1,
        items: [{ id: 'inc_1', name: 'API outage' }],
      },
      maintenances: {
        active: 0,
        items: [],
      },
    });

    const server = new FakeServer();
    registerCuratedStatusPageTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_status_page_summary');
    expect(tool).toBeTruthy();

    const result = await tool!.handler({});
    expect(getStatusPageSummary).toHaveBeenCalledOnce();
    expect(result).toMatchObject({
      structuredContent: {
        components: { nonOperational: 1 },
        incidents: { open: 1 },
      },
    });
  });

  it('maps open incidents payload', async () => {
    vi.mocked(listOpenStatusPageIncidents).mockResolvedValue({
      page: { name: 'VRChat' },
      totalOpenIncidents: 1,
      incidents: [{ id: 'inc_1', name: 'API outage' }],
    });

    const server = new FakeServer();
    registerCuratedStatusPageTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_status_page_incidents_open');
    expect(tool).toBeTruthy();

    const result = await tool!.handler({});
    expect(listOpenStatusPageIncidents).toHaveBeenCalledOnce();
    expect(result).toMatchObject({
      structuredContent: {
        totalOpenIncidents: 1,
      },
    });
  });

  it('maps active maintenances payload', async () => {
    vi.mocked(listActiveStatusPageMaintenances).mockResolvedValue({
      page: { name: 'VRChat' },
      totalActiveMaintenances: 1,
      maintenances: [{ id: 'mtn_1', name: 'Network maintenance' }],
    });

    const server = new FakeServer();
    registerCuratedStatusPageTools(server as unknown as McpServer);
    const tool = server.tools.find(
      (entry) => entry.name === 'vrchat_status_page_maintenances_active'
    );
    expect(tool).toBeTruthy();

    const result = await tool!.handler({});
    expect(listActiveStatusPageMaintenances).toHaveBeenCalledOnce();
    expect(result).toMatchObject({
      structuredContent: {
        totalActiveMaintenances: 1,
      },
    });
  });

  it('returns tool error when summary fails', async () => {
    vi.mocked(getStatusPageSummary).mockRejectedValue(new Error('Boom'));

    const server = new FakeServer();
    registerCuratedStatusPageTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_status_page_summary');
    const result = await tool!.handler({});

    expect(result).toMatchObject({
      isError: true,
      structuredContent: { error: 'Boom' },
    });
  });
});
