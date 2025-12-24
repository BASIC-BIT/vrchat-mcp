import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/core/client.js', () => ({
  callOperation: vi.fn(),
}));

vi.mock('../../../src/services/groups/allowlist.js', () => ({
  checkGroupAllowed: vi.fn(),
}));

import { callOperation } from '../../../src/core/client.js';
import { checkGroupAllowed } from '../../../src/services/groups/allowlist.js';
import { createInstance, prepareInstanceCreate } from '../../../src/services/instances/curated.js';

describe('instances curated service', () => {
  beforeEach(() => {
    vi.mocked(callOperation).mockReset();
    vi.mocked(checkGroupAllowed).mockReset();
  });

  it('rejects group instance without groupId', () => {
    const result = prepareInstanceCreate({
      worldId: 'wrld_1',
      type: 'group',
      region: 'us',
    });
    expect(result).toMatchObject({ ok: false });
  });

  it('rejects group instance when allowlist fails', () => {
    vi.mocked(checkGroupAllowed).mockReturnValue({ ok: false, reason: 'blocked' });
    const result = prepareInstanceCreate({
      worldId: 'wrld_1',
      type: 'group',
      region: 'us',
      groupId: 'grp_blocked',
    });
    expect(result).toMatchObject({ ok: false, reason: 'blocked' });
  });

  it('rejects group-only options for non-group instances', () => {
    const result = prepareInstanceCreate({
      worldId: 'wrld_1',
      type: 'private',
      region: 'us',
      groupAccessType: 'members',
    });
    expect(result).toMatchObject({ ok: false });
  });

  it('rejects groupId when type is not group', () => {
    const result = prepareInstanceCreate({
      worldId: 'wrld_1',
      type: 'public',
      region: 'us',
      groupId: 'grp_1',
    });
    expect(result).toMatchObject({ ok: false, reason: 'groupId is only valid when type=group.' });
  });

  it('accepts ownerId as group id and includes group options', () => {
    vi.mocked(checkGroupAllowed).mockReturnValue({ ok: true });
    const result = prepareInstanceCreate({
      worldId: 'wrld_2',
      type: 'group',
      region: 'eu',
      ownerId: 'grp_owner',
      groupAccessType: 'members',
      roleIds: ['role_a'],
      displayName: 'Launch Party',
      inviteOnly: true,
      canRequestInvite: false,
      queueEnabled: true,
      ageGate: true,
      instancePersistenceEnabled: true,
      closedAt: '2025-12-31T23:00:00Z',
      hardClose: true,
      contentSettings: { allowAvatars: true },
    });

    expect(result).toEqual({
      ok: true,
      request: {
        worldId: 'wrld_2',
        type: 'group',
        region: 'eu',
        ownerId: 'grp_owner',
        groupAccessType: 'members',
        roleIds: ['role_a'],
        displayName: 'Launch Party',
        inviteOnly: true,
        canRequestInvite: false,
        queueEnabled: true,
        ageGate: true,
        instancePersistenceEnabled: true,
        closedAt: '2025-12-31T23:00:00Z',
        hardClose: true,
        contentSettings: { allowAvatars: true },
      },
    });
  });

  it('builds non-group request with ownerId and flags', () => {
    const result = prepareInstanceCreate({
      worldId: 'wrld_3',
      type: 'friends',
      region: 'us',
      ownerId: 'usr_123',
      displayName: 'Chill Hangout',
      inviteOnly: true,
      canRequestInvite: true,
      queueEnabled: false,
    });

    expect(result).toEqual({
      ok: true,
      request: {
        worldId: 'wrld_3',
        type: 'friends',
        region: 'us',
        ownerId: 'usr_123',
        displayName: 'Chill Hangout',
        inviteOnly: true,
        canRequestInvite: true,
        queueEnabled: false,
      },
    });
  });

  it('creates instance via API', async () => {
    vi.mocked(callOperation).mockResolvedValueOnce({ data: { id: 'inst_1' } });
    const result = await createInstance({ worldId: 'wrld_1', type: 'private', region: 'us' });
    expect(callOperation).toHaveBeenCalledWith({
      operationId: 'createInstance',
      params: undefined,
      body: { worldId: 'wrld_1', type: 'private', region: 'us' },
    });
    expect(result).toMatchObject({ id: 'inst_1' });
  });

  it('returns null when createInstance has no data', async () => {
    vi.mocked(callOperation).mockResolvedValueOnce({ data: null });
    const result = await createInstance({ worldId: 'wrld_1', type: 'private', region: 'us' });
    expect(result).toBeNull();
  });
});
