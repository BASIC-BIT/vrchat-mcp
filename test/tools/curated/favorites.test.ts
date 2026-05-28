import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakeServer } from '../../helpers/fake-server.js';

vi.mock('../../../src/services/favorites/index.js', () => ({
  addFavorite: vi.fn(),
  getFavoriteGroup: vi.fn(),
  getFavoriteLimits: vi.fn(),
  listFavoriteGroups: vi.fn(),
  listFavorites: vi.fn(),
  listFavoritedAvatars: vi.fn(),
  removeFavorite: vi.fn(),
}));

import { registerCuratedFavoriteTools } from '../../../src/tools/curated/favorites.js';
import {
  addFavorite,
  getFavoriteGroup,
  getFavoriteLimits,
  listFavoriteGroups,
  listFavorites,
  listFavoritedAvatars,
  removeFavorite,
} from '../../../src/services/favorites/index.js';

describe('curated favorite tools', () => {
  beforeEach(() => {
    vi.mocked(addFavorite).mockReset();
    vi.mocked(getFavoriteGroup).mockReset();
    vi.mocked(getFavoriteLimits).mockReset();
    vi.mocked(listFavoriteGroups).mockReset();
    vi.mocked(listFavorites).mockReset();
    vi.mocked(listFavoritedAvatars).mockReset();
    vi.mocked(removeFavorite).mockReset();
  });

  it('lists favorites by default', async () => {
    vi.mocked(listFavorites).mockResolvedValue({
      favorites: [{ favoriteRecordId: 'fvrt_1', type: 'world', targetId: 'wrld_1' }],
      page: { pages: 1, items: 1, pageSize: 50, offsetStart: 0, truncated: false },
    });

    const server = new FakeServer();
    registerCuratedFavoriteTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_favorites');
    const result = await tool!.handler({});

    expect(listFavorites).toHaveBeenCalledWith(expect.objectContaining({ view: 'favorites' }));
    expect(result).toMatchObject({
      structuredContent: {
        view: 'favorites',
        total: 1,
        favorites: [{ favoriteRecordId: 'fvrt_1', targetId: 'wrld_1' }],
      },
    });
  });

  it('reads favorite groups, a group, limits, and avatars by view', async () => {
    vi.mocked(listFavoriteGroups).mockResolvedValue({
      groups: [{ favoriteGroupId: 'fvgrp_1', name: 'worlds1', displayName: 'Worlds' }],
    });
    vi.mocked(getFavoriteGroup).mockResolvedValue({
      group: { favoriteGroupId: 'fvgrp_1', name: 'worlds1' },
    });
    vi.mocked(getFavoriteLimits).mockResolvedValue({ limits: { maxFavoritesPerGroup: {} } });
    vi.mocked(listFavoritedAvatars).mockResolvedValue({
      avatars: [{ avatarId: 'avtr_1', name: 'Avatar' }],
    });

    const server = new FakeServer();
    registerCuratedFavoriteTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_favorites');

    await expect(tool!.handler({ view: 'groups' })).resolves.toMatchObject({
      structuredContent: { total: 1, groups: [{ favoriteGroupId: 'fvgrp_1' }] },
    });
    await expect(
      tool!.handler({
        view: 'group',
        favoriteGroupType: 'world',
        favoriteGroupName: 'worlds1',
        userId: 'usr_1',
      })
    ).resolves.toMatchObject({
      structuredContent: { group: { favoriteGroupId: 'fvgrp_1' } },
    });
    await expect(tool!.handler({ view: 'limits' })).resolves.toMatchObject({
      structuredContent: { limits: { maxFavoritesPerGroup: {} } },
    });
    await expect(tool!.handler({ view: 'avatars' })).resolves.toMatchObject({
      structuredContent: { total: 1, avatars: [{ avatarId: 'avtr_1' }] },
    });
  });

  it('adds a favorite using a target ID', async () => {
    vi.mocked(addFavorite).mockResolvedValue({
      favorite: { favoriteRecordId: 'fvrt_1', type: 'world', targetId: 'wrld_1' },
    });

    const server = new FakeServer();
    registerCuratedFavoriteTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_favorite_add');
    const result = await tool!.handler({ type: 'world', targetId: 'wrld_1', tags: ['worlds1'] });

    expect(addFavorite).toHaveBeenCalledWith({ type: 'world', targetId: 'wrld_1', tags: ['worlds1'] });
    expect(result).toMatchObject({
      structuredContent: { status: 'added', favorite: { favoriteRecordId: 'fvrt_1' } },
    });
  });

  it('removes a favorite by favorite record ID', async () => {
    vi.mocked(removeFavorite).mockResolvedValue({ result: { success: { message: 'deleted' } } });

    const server = new FakeServer();
    registerCuratedFavoriteTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_favorite_remove');
    const result = await tool!.handler({ favoriteRecordId: 'fvrt_1' });

    expect(tool?.config.annotations).toMatchObject({ destructiveHint: true });
    expect(removeFavorite).toHaveBeenCalledWith({ favoriteRecordId: 'fvrt_1' });
    expect(result).toMatchObject({ structuredContent: { status: 'removed' } });
  });
});
