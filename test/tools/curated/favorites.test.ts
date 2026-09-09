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

  it.each(['avatar', 'friend', 'world', 'vrcPlusWorld'] as const)(
    'routes %s collection discovery without changing the type', async (type) => {
      vi.mocked(listFavoriteGroups).mockResolvedValue({ groups: [] });
      const server = new FakeServer();
      registerCuratedFavoriteTools(server as unknown as McpServer);
      const tool = server.tools.find((entry) => entry.name === 'vrchat_favorites');
      await tool!.handler({ view: 'groups', type });
      expect(listFavoriteGroups).toHaveBeenCalledWith({ view: 'groups', type });
    },
  );

  it('routes a VRC+ singular collection through favoriteGroupType', async () => {
    const group = {
      favoriteGroupId: 'fvgrp_plus', name: 'vrcPlusWorlds1', displayName: 'My worlds', type: 'vrcPlusWorld',
    };
    vi.mocked(getFavoriteGroup).mockResolvedValue({ group });
    const server = new FakeServer();
    registerCuratedFavoriteTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_favorites');
    const input = {
      view: 'group', favoriteGroupType: 'vrcPlusWorld', favoriteGroupName: 'vrcPlusWorlds1', userId: 'usr_test',
    };
    await expect(tool!.handler(input)).resolves.toMatchObject({ structuredContent: { group } });
    expect(getFavoriteGroup).toHaveBeenCalledWith(input);
  });

  it('adds to the selected VRC+ collection and returns distinct record and target IDs', async () => {
    const favorite = {
      favoriteRecordId: 'fvrt_test', targetId: 'wrld_test', type: 'vrcPlusWorld', tags: ['vrcPlusWorlds1'],
    };
    vi.mocked(addFavorite).mockResolvedValue({ favorite });
    const server = new FakeServer();
    registerCuratedFavoriteTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_favorite_add');
    const input = { type: 'vrcPlusWorld', targetId: 'wrld_test', tags: ['vrcPlusWorlds1'] };
    await expect(tool!.handler(input)).resolves.toMatchObject({ structuredContent: { status: 'added', favorite } });
    expect(addFavorite).toHaveBeenCalledWith(input);
  });

  it.each([
    ['vrchat_favorites', { view: 'favorites', type: 'premiumWorld' }],
    ['vrchat_favorites', { view: 'groups', type: 'premiumWorld' }],
    ['vrchat_favorites', {
      view: 'group', favoriteGroupType: 'premiumWorld', favoriteGroupName: 'worlds1', userId: 'usr_test',
    }],
    ['vrchat_favorite_add', { type: 'premiumWorld', targetId: 'wrld_test', tags: ['worlds1'] }],
  ])('rejects unknown favorite types before calling services: %s %j', async (name, input) => {
    const server = new FakeServer();
    registerCuratedFavoriteTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === name);
    await expect(tool!.handler(input)).resolves.toMatchObject({ isError: true });
    for (const service of [listFavorites, listFavoriteGroups, getFavoriteGroup, addFavorite]) {
      expect(service).not.toHaveBeenCalled();
    }
  });
});
