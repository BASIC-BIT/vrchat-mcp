import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../../../src/core/readTools.js', () => ({ callReadOperation: vi.fn() }));
vi.mock('../../../src/core/client.js', () => ({ callOperation: vi.fn() }));
import { callReadOperation } from '../../../src/core/readTools.js';
import { callOperation } from '../../../src/core/client.js';
import { listFavoriteGroups, getFavoriteGroup, listFavorites, addFavorite } from '../../../src/services/favorites/index.js';

describe('favorite service routing', () => {
  beforeEach(() => {
    vi.mocked(callReadOperation).mockReset();
    vi.mocked(callOperation).mockReset();
  });

  it.each(['avatar', 'friend', 'world', 'vrcPlusWorld'] as const)(
    'filters group discovery by %s', async (type) => {
      vi.mocked(callReadOperation).mockResolvedValue({ data: [] });
      await listFavoriteGroups({ view: 'groups', type });
      expect(callReadOperation).toHaveBeenCalledWith(
        'getFavoriteGroups', expect.objectContaining({ type }), expect.anything(),
      );
    },
  );

  it('leaves group discovery unfiltered when type is omitted', async () => {
    vi.mocked(callReadOperation).mockResolvedValue({ data: [] });
    await listFavoriteGroups({ view: 'groups' });
    expect(callReadOperation).toHaveBeenCalledWith(
      'getFavoriteGroups',
      { type: undefined, userId: undefined, ownerId: undefined, n: 50, offset: undefined },
      expect.anything(),
    );
  });

  it('preserves the singular group path parameters', async () => {
    vi.mocked(callReadOperation).mockResolvedValue({ data: null });
    await getFavoriteGroup({
      view: 'group', favoriteGroupType: 'vrcPlusWorld',
      favoriteGroupName: 'vrcPlusWorlds1', userId: 'usr_test',
    });
    expect(callReadOperation).toHaveBeenCalledWith('getFavoriteGroup', {
      favoriteGroupType: 'vrcPlusWorld', favoriteGroupName: 'vrcPlusWorlds1', userId: 'usr_test',
    }, undefined);
  });

  it('reads a VRC+ collection and preserves record and target IDs', async () => {
    vi.mocked(callReadOperation).mockResolvedValue({ data: [{
      id: 'fvrt_test', favoriteId: 'wrld_test', type: 'vrcPlusWorld', tags: ['vrcPlusWorlds1'],
    }] });
    const result = await listFavorites({ view: 'favorites', type: 'vrcPlusWorld', tag: 'vrcPlusWorlds1' });
    expect(callReadOperation).toHaveBeenCalledWith('getFavorites', {
      type: 'vrcPlusWorld', tag: 'vrcPlusWorlds1', n: 50, offset: undefined,
    }, expect.anything());
    expect(result.favorites).toEqual([{
      favoriteRecordId: 'fvrt_test', targetId: 'wrld_test', type: 'vrcPlusWorld', tags: ['vrcPlusWorlds1'],
    }]);
  });

  it('preserves the selected VRC+ collection in an add request', async () => {
    vi.mocked(callOperation).mockResolvedValue({ url: 'u', data: {
      id: 'fvrt_test', favoriteId: 'wrld_test', type: 'vrcPlusWorld', tags: ['vrcPlusWorlds1'],
    } });
    const result = await addFavorite({ type: 'vrcPlusWorld', targetId: 'wrld_test', tags: ['vrcPlusWorlds1'] });
    expect(callOperation).toHaveBeenCalledWith({
      operationId: 'addFavorite', params: undefined,
      body: { type: 'vrcPlusWorld', favoriteId: 'wrld_test', tags: ['vrcPlusWorlds1'] },
    });
    expect(result.favorite).toEqual({
      favoriteRecordId: 'fvrt_test', targetId: 'wrld_test', type: 'vrcPlusWorld', tags: ['vrcPlusWorlds1'],
    });
  });
});
