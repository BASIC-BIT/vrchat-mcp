import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakeServer } from '../../helpers/fake-server.js';
import { registerCuratedWorldTools } from '../../../src/tools/curated/worlds.js';
import { cacheManager } from '../../../src/services/cache.js';
import { callReadOperationParsed } from '../../../src/services/api/client.js';

vi.mock('../../../src/services/api/client.js', async () => {
  const actual = await vi.importActual<Record<string, unknown>>(
    '../../../src/services/api/client.js',
  );
  return {
    ...actual,
    callReadOperationParsed: vi.fn(),
  };
});

describe('curated world tools', () => {
  beforeEach(() => {
    cacheManager.invalidateAll();
    vi.mocked(callReadOperationParsed).mockReset();
  });

  it('searches worlds and returns compact summaries', async () => {
    vi.mocked(callReadOperationParsed).mockResolvedValueOnce({
      data: [
        {
          id: 'wrld_1',
          name: 'Mock World',
          authorName: 'Author',
          tags: ['tag_a'],
          visits: 42,
        },
      ],
      page: { pages: 1, items: 1, pageSize: 50, offsetStart: 0, truncated: false },
    });

    const server = new FakeServer();
    registerCuratedWorldTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_worlds_search');
    const result = await tool!.handler({ query: 'mock' });

    expect(callReadOperationParsed).toHaveBeenCalledWith(
      'searchWorlds',
      expect.objectContaining({ search: 'mock' }),
      expect.any(Object),
    );
    expect(result).toMatchObject({
      structuredContent: {
        total: 1,
        worlds: [
          {
            worldId: 'wrld_1',
            name: 'Mock World',
            authorName: 'Author',
            visits: 42,
            tags: ['tag_a'],
          },
        ],
      },
    });
  });

  it('requires a search query', async () => {
    const server = new FakeServer();
    registerCuratedWorldTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_worlds_search');
    const result = await tool!.handler({ query: '   ' });

    expect(result).toMatchObject({ isError: true });
  });

  it('lists favorited worlds with compact summaries', async () => {
    vi.mocked(callReadOperationParsed).mockResolvedValueOnce({
      data: [
        {
          id: 'wrld_fav',
          name: 'Favorite World',
          favoriteGroup: 'group_1',
          favoriteId: 'fav_1',
        },
      ],
      page: { pages: 1, items: 1, pageSize: 50, offsetStart: 0, truncated: false },
    });

    const server = new FakeServer();
    registerCuratedWorldTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_worlds_favorites');
    const result = await tool!.handler({});

    expect(callReadOperationParsed).toHaveBeenCalledWith(
      'getFavoritedWorlds',
      expect.any(Object),
      expect.any(Object),
    );
    expect(result).toMatchObject({
      structuredContent: {
        total: 1,
        worlds: [
          {
            worldId: 'wrld_fav',
            name: 'Favorite World',
            favoriteGroup: 'group_1',
            favoriteId: 'fav_1',
          },
        ],
      },
    });
  });

  it('returns world profile by id with field shaping', async () => {
    vi.mocked(callReadOperationParsed).mockResolvedValueOnce({
      data: { id: 'wrld_1', name: 'Mock World', description: 'Hidden' },
    });

    const server = new FakeServer();
    registerCuratedWorldTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_world_profile');
    const result = await tool!.handler({ worldId: 'wrld_1', fields: ['id', 'name'] });

    expect(callReadOperationParsed).toHaveBeenCalledWith('getWorld', { worldId: 'wrld_1' });
    expect(result).toMatchObject({
      structuredContent: {
        worldId: 'wrld_1',
        resolvedBy: 'id',
        world: { id: 'wrld_1', name: 'Mock World' },
      },
    });
  });

  it('returns a hint when name resolution is ambiguous', async () => {
    vi.mocked(callReadOperationParsed).mockResolvedValueOnce({
      data: [
        { id: 'wrld_1', name: 'Same' },
        { id: 'wrld_2', name: 'Same' },
      ],
    });

    const server = new FakeServer();
    registerCuratedWorldTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_world_profile');
    const result = await tool!.handler({ name: 'Same' });

    expect(result).toMatchObject({
      isError: true,
      structuredContent: { nextSteps: ['vrchat_worlds_search'] },
    });
  });

  it('summarizes world instances without listing samples', async () => {
    vi.mocked(callReadOperationParsed).mockResolvedValueOnce({
      data: {
        id: 'wrld_1',
        instances: [
          ['wrld_1:1~private', 2],
          ['wrld_1:2~region(eu)', 3],
          ['wrld_1:3', 5],
        ],
      },
    });

    const server = new FakeServer();
    registerCuratedWorldTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_world_instances_overview');
    const result = await tool!.handler({ worldId: 'wrld_1' });

    expect(result).toMatchObject({
      structuredContent: {
        worldId: 'wrld_1',
        instances: {
          totalInstances: 3,
          totalOccupants: 10,
          countsByAccess: {
            private: 1,
            public: 1,
            custom: 1,
          },
          countsByRegion: {
            eu: 1,
          },
        },
      },
    });
  });
});
