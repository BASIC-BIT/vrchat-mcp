import { describe, it, expect, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakeServer } from '../helpers/fake-server.js';

vi.mock('../../src/vrctl/organizers.js', () => ({
  vrctlOrganizersService: {
    searchOrganizers: vi.fn(),
    getOrganizerProfile: vi.fn(),
  },
}));

import { registerVrctlOrganizerTools } from '../../src/tools/vrctlOrganizers.js';
import { vrctlOrganizersService } from '../../src/vrctl/organizers.js';

describe('vrctl organizer tools', () => {
  it('search tool returns matches', async () => {
    const groupId = 'grp_11111111-1111-1111-1111-111111111111';
    const server = new FakeServer();
    registerVrctlOrganizerTools(server as unknown as McpServer);

    vi.spyOn(vrctlOrganizersService, 'searchOrganizers').mockResolvedValue({
      total: 1,
      matches: [{ name: 'Club A', slug: 'club-a', vrchatGroupId: groupId }],
    });

    const tool = server.tools.find((t) => t.name === 'vrctl_organizers_search');
    const result = await tool!.handler({ query: 'club', maxResults: 5 });
    expect(result).toMatchObject({
      structuredContent: {
        query: 'club',
        totalMatches: 1,
      },
    });
  });

  it('profile tool returns one organizer', async () => {
    const groupId = 'grp_11111111-1111-1111-1111-111111111111';
    const server = new FakeServer();
    registerVrctlOrganizerTools(server as unknown as McpServer);

    vi.spyOn(vrctlOrganizersService, 'getOrganizerProfile').mockResolvedValue({
      name: 'Club A',
      slug: 'club-a',
      vrchatGroupId: groupId,
    });

    const tool = server.tools.find((t) => t.name === 'vrctl_organizer_profile');
    const result = await tool!.handler({ vrchatGroupId: groupId });
    expect(result).toMatchObject({ structuredContent: { organizer: { name: 'Club A' } } });
  });
});
