import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cacheManager } from '../../../src/services/cache.js';
import { fetchUserGroupsWithMeta } from '../../../src/services/users/groups.js';
import { callReadOperation } from '../../../src/core/readTools.js';

vi.mock('../../../src/core/readTools.js', () => ({
  callReadOperation: vi.fn(),
}));

describe('fetchUserGroupsWithMeta', () => {
  beforeEach(() => {
    cacheManager.invalidateAll();
    vi.mocked(callReadOperation).mockReset();
  });

  it('maps group summaries and paginates results', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: [
        { groupId: 'grp_1', name: 'Alpha' },
        { groupId: 'grp_2', name: 'Beta' },
        { groupId: 'grp_3', name: 'Gamma' },
      ],
    });

    const result = await fetchUserGroupsWithMeta({
      userId: 'usr_1',
      pageSize: 1,
      maxPages: 1,
      offset: 0,
    });

    expect(callReadOperation).toHaveBeenCalledWith('getUserGroups', { userId: 'usr_1' }, undefined);
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0]).toMatchObject({ groupId: 'grp_1', name: 'Alpha' });
    expect(result.meta.total).toBe(3);
    expect(result.meta.truncated).toBe(true);
    expect(result.meta.page.items).toBe(1);
  });

  it('reuses cached groups for repeat calls', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: [{ groupId: 'grp_1', name: 'Alpha' }],
    });

    await fetchUserGroupsWithMeta({ userId: 'usr_1' });
    await fetchUserGroupsWithMeta({ userId: 'usr_1' });

    expect(callReadOperation).toHaveBeenCalledTimes(1);
  });
});
