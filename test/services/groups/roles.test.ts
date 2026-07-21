import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/services/api/client.js', () => ({
  callReadOperationParsed: vi.fn(),
  callWriteOperationParsed: vi.fn(),
}));

import { callWriteOperationParsed } from '../../../src/services/api/client.js';
import { cacheManager } from '../../../src/services/cache.js';
import { manageGroupRole } from '../../../src/services/groups/roles.js';

describe('group role management', () => {
  beforeEach(() => {
    cacheManager.invalidateAll();
    vi.mocked(callWriteOperationParsed).mockReset();
  });

  it('invalidates cached member snapshots after assigning a role', async () => {
    cacheManager.set('members', { members: [] }, 60_000, ['group-members:grp_1']);
    vi.mocked(callWriteOperationParsed).mockResolvedValueOnce({ data: ['role_1'] });

    await manageGroupRole('grp_1', {
      action: 'assign_member_role',
      userId: 'usr_1',
      groupRoleId: 'role_1',
    });

    expect(cacheManager.get('members')).toBeUndefined();
  });

  it('invalidates cached member snapshots after deleting a role', async () => {
    cacheManager.set('members', { members: [] }, 60_000, ['group-members:grp_1']);
    vi.mocked(callWriteOperationParsed).mockResolvedValueOnce({ data: [] });

    await manageGroupRole('grp_1', {
      action: 'delete_role',
      groupRoleId: 'role_1',
    });

    expect(cacheManager.get('members')).toBeUndefined();
  });
});
