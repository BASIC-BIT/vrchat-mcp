import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/core/readTools.js', () => ({
  callReadOperation: vi.fn(),
}));

import { callReadOperation } from '../../../src/core/readTools.js';
import { cacheManager } from '../../../src/services/cache.js';
import {
  getWorldInstancesOverview,
  listFavoriteWorlds,
  resolveWorldId,
  searchWorlds,
} from '../../../src/services/worlds/index.js';

describe('worlds curated service', () => {
  beforeEach(() => {
    cacheManager.invalidateAll();
    vi.mocked(callReadOperation).mockReset();
  });

  it('resolves world id by name via search', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: [{ id: 'wrld_1', name: 'Test World' }],
      page: { pages: 1, items: 1, pageSize: 50, offsetStart: 0, truncated: false },
    });

    const result = await resolveWorldId({ name: 'Test World' });
    expect(callReadOperation).toHaveBeenCalledWith(
      'searchWorlds',
      expect.objectContaining({ search: 'Test World', n: 50 }),
      expect.any(Object),
    );
    expect(result).toMatchObject({ ok: true, worldId: 'wrld_1', resolvedBy: 'name' });
  });

  it('summarizes instances by access and region', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: {
        id: 'wrld_1',
        instances: [
          ['wrld_1:1~public~region(us)', 12],
          ['wrld_1:2~friends~region(jp)', 5],
        ],
      },
    });

    const result = await getWorldInstancesOverview('wrld_1');
    expect(callReadOperation).toHaveBeenCalledWith('getWorld', { worldId: 'wrld_1' }, undefined);
    expect(result.summary).toMatchObject({
      totalInstances: 2,
      totalOccupants: 17,
      countsByAccess: { public: 1, friends: 1 },
      countsByRegion: { us: 1, jp: 1 },
    });
  });

  it('omits empty optional search filters', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: [],
      page: { pages: 1, items: 0, pageSize: 10, offsetStart: 0, truncated: false },
    });

    await searchWorlds({
      query: 'club',
      pageSize: 10,
      sort: '',
      order: ' ',
      tag: '',
      notag: '',
      releaseStatus: '',
      maxUnityVersion: '',
      minUnityVersion: '',
      platform: '',
    });

    expect(callReadOperation).toHaveBeenCalledWith(
      'searchWorlds',
      {
        search: 'club',
        n: 10,
        offset: undefined,
        featured: undefined,
        sort: undefined,
        order: undefined,
        tag: undefined,
        notag: undefined,
        releaseStatus: undefined,
        maxUnityVersion: undefined,
        minUnityVersion: undefined,
        platform: undefined,
      },
      expect.any(Object),
    );
  });

  it('omits empty optional favorites filters', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: [],
      page: { pages: 1, items: 0, pageSize: 10, offsetStart: 0, truncated: false },
    });

    await listFavoriteWorlds({
      query: '',
      pageSize: 10,
      sort: '',
      order: '',
      tag: '',
      notag: '',
      releaseStatus: '',
      maxUnityVersion: '',
      minUnityVersion: '',
      platform: '',
      userId: '',
    });

    expect(callReadOperation).toHaveBeenCalledWith(
      'getFavoritedWorlds',
      {
        search: undefined,
        n: 10,
        offset: undefined,
        featured: undefined,
        sort: undefined,
        order: undefined,
        tag: undefined,
        notag: undefined,
        releaseStatus: undefined,
        maxUnityVersion: undefined,
        minUnityVersion: undefined,
        platform: undefined,
        userId: undefined,
      },
      expect.any(Object),
    );
  });
});
