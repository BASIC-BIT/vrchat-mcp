import { describe, it, expect, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakeServer } from '../helpers/fake-server.js';

vi.mock('../../src/vrctl/metadata.js', () => ({
  vrctlMetadataService: {
    getBootstrapCached: vi.fn(),
  },
}));

import { registerVrctlMetadataTools } from '../../src/tools/vrctlMetadata.js';
import { vrctlMetadataService } from '../../src/vrctl/metadata.js';

describe('vrctl metadata tools', () => {
  it('returns metadata payload', async () => {
    const server = new FakeServer();
    registerVrctlMetadataTools(server as unknown as McpServer);

    vi.spyOn(vrctlMetadataService, 'getBootstrapCached').mockResolvedValue({
      loggedIn: false,
      categories: [{ id: 1, name: 'Music', urlName: 'music' }],
      tags: [{ id: 2, name: 'Windows', urlName: 'windows' }],
    });

    const tool = server.tools.find((t) => t.name === 'vrctl_metadata_get');
    const result = await tool!.handler({});
    expect(result).toMatchObject({
      structuredContent: {
        loggedIn: false,
        verified: true,
        counts: { categories: 1, tags: 1 },
      },
    });
  });
});
