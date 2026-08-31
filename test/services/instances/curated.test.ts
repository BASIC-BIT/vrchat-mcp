import { describe, it, expect, vi, beforeEach } from 'vitest';

const invalidateByTagMock = vi.hoisted(() => vi.fn());

vi.mock('../../../src/core/client.js', () => ({
  callOperation: vi.fn(),
}));

vi.mock('../../../src/services/groups/allowlist.js', () => ({
  checkGroupAllowed: vi.fn(),
}));

vi.mock('../../../src/services/cache.js', () => ({
  cacheManager: { invalidateByTag: invalidateByTagMock },
}));

import { callOperation } from '../../../src/core/client.js';
import { checkGroupAllowed } from '../../../src/services/groups/allowlist.js';
import {
  createInstance,
  linkInstanceToCalendarEvent,
  prepareInstanceCreate,
} from '../../../src/services/instances/curated.js';

describe('instances curated service', () => {
  beforeEach(() => {
    vi.mocked(callOperation).mockReset();
    vi.mocked(checkGroupAllowed).mockReset();
    invalidateByTagMock.mockReset();
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
      calendarEntryId: 'cal_1',
      instancePersistenceEnabled: true,
      playerPersistenceEnabled: false,
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
        calendarEntryId: 'cal_1',
        instancePersistenceEnabled: true,
        playerPersistenceEnabled: false,
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

  it('links an allowlisted group instance to an event owned by the same group', async () => {
    vi.mocked(checkGroupAllowed).mockReturnValue({ ok: true });
    vi.mocked(callOperation)
      .mockResolvedValueOnce({ data: { id: 'cal_1', ownerId: 'grp_1' } })
      .mockResolvedValueOnce({
        data: {
          id: '123~group(grp_1)',
          type: 'group',
          ownerId: 'grp_1',
          calendarEntryId: null,
        },
      })
      .mockResolvedValueOnce({
        data: {
          id: '123~group(grp_1)',
          type: 'group',
          ownerId: 'grp_1',
          calendarEntryId: 'cal_1',
        },
      });

    const result = await linkInstanceToCalendarEvent({
      groupId: 'grp_1',
      calendarId: 'cal_1',
      worldId: 'wrld_1',
      instanceId: '123~group(grp_1)',
    });

    expect(callOperation).toHaveBeenNthCalledWith(3, {
      operationId: 'updateInstance',
      params: { worldId: 'wrld_1', instanceId: '123~group(grp_1)' },
      body: { calendarEntryId: 'cal_1' },
    });
    expect(invalidateByTagMock).toHaveBeenCalledWith('instances:wrld_1');
    expect(invalidateByTagMock).toHaveBeenCalledWith('groups:grp_1');
    expect(result).toEqual({ status: 'linked' });
  });

  it('rejects event linking before reads when the group is not allowlisted', async () => {
    vi.mocked(checkGroupAllowed).mockReturnValue({ ok: false, reason: 'blocked' });

    await expect(
      linkInstanceToCalendarEvent({
        groupId: 'grp_blocked',
        calendarId: 'cal_1',
        worldId: 'wrld_1',
        instanceId: '123',
      })
    ).rejects.toThrow('blocked');
    expect(callOperation).not.toHaveBeenCalled();
  });

  it('rejects an event that is not owned by the requested group', async () => {
    vi.mocked(checkGroupAllowed).mockReturnValue({ ok: true });
    vi.mocked(callOperation).mockResolvedValueOnce({
      data: { id: 'cal_1', ownerId: 'grp_other' },
    });

    await expect(
      linkInstanceToCalendarEvent({
        groupId: 'grp_1',
        calendarId: 'cal_1',
        worldId: 'wrld_1',
        instanceId: '123',
      })
    ).rejects.toThrow('not owned by group grp_1');
    expect(callOperation).toHaveBeenCalledTimes(1);
  });

  it('rejects an instance that is not owned by the requested group', async () => {
    vi.mocked(checkGroupAllowed).mockReturnValue({ ok: true });
    vi.mocked(callOperation)
      .mockResolvedValueOnce({ data: { id: 'cal_1', ownerId: 'grp_1' } })
      .mockResolvedValueOnce({
        data: { id: '123', type: 'group', ownerId: 'grp_other', calendarEntryId: null },
      });

    await expect(
      linkInstanceToCalendarEvent({
        groupId: 'grp_1',
        calendarId: 'cal_1',
        worldId: 'wrld_1',
        instanceId: '123',
      })
    ).rejects.toThrow('not owned by group grp_1');
    expect(callOperation).toHaveBeenCalledTimes(2);
  });

  it('does not overwrite a different existing calendar link', async () => {
    vi.mocked(checkGroupAllowed).mockReturnValue({ ok: true });
    vi.mocked(callOperation)
      .mockResolvedValueOnce({ data: { id: 'cal_1', ownerId: 'grp_1' } })
      .mockResolvedValueOnce({
        data: {
          id: '123',
          type: 'group',
          ownerId: 'grp_1',
          calendarEntryId: 'cal_other',
        },
      });

    await expect(
      linkInstanceToCalendarEvent({
        groupId: 'grp_1',
        calendarId: 'cal_1',
        worldId: 'wrld_1',
        instanceId: '123',
      })
    ).rejects.toThrow('Refusing to replace existing calendar link cal_other');
    expect(callOperation).toHaveBeenCalledTimes(2);
  });

  it('returns already_linked without repeating the write', async () => {
    vi.mocked(checkGroupAllowed).mockReturnValue({ ok: true });
    vi.mocked(callOperation)
      .mockResolvedValueOnce({ data: { id: 'cal_1', ownerId: 'grp_1' } })
      .mockResolvedValueOnce({
        data: { id: '123', type: 'group', ownerId: 'grp_1', calendarEntryId: 'cal_1' },
      });

    const result = await linkInstanceToCalendarEvent({
      groupId: 'grp_1',
      calendarId: 'cal_1',
      worldId: 'wrld_1',
      instanceId: '123',
    });

    expect(result.status).toBe('already_linked');
    expect(callOperation).toHaveBeenCalledTimes(2);
    expect(invalidateByTagMock).not.toHaveBeenCalled();
  });
});
