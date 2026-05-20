import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/core/client.js', () => ({
  callOperation: vi.fn(),
}));

import { callOperation } from '../../../src/core/client.js';
import {
  inviteUsers,
  inviteUsersToGroup,
  inviteUserToCurrentInstance,
  prepareInviteUser,
  resolveCurrentInviteLocation,
  resolveInviteLocation,
  resolveInviteInstanceId,
  sendSelfInvite,
  sendUserInvite,
} from '../../../src/services/invites/curated.js';

describe('invites curated service', () => {
  beforeEach(() => {
    vi.mocked(callOperation).mockReset();
  });

  it('resolves invite location from location string', () => {
    const location = resolveInviteLocation({ location: 'wrld_1:inst_1' });
    expect(location).toEqual({ worldId: 'wrld_1', instanceId: 'inst_1' });
  });

  it('resolves invite location from worldId and instanceId', () => {
    const location = resolveInviteLocation({ worldId: 'wrld_2', instanceId: 'inst_2' });
    expect(location).toEqual({ worldId: 'wrld_2', instanceId: 'inst_2' });
  });

  it('prepares user invite with instance and message slot', () => {
    const prepared = prepareInviteUser({
      userId: 'usr_1',
      location: 'wrld_2:inst_2',
      messageSlot: 3,
    });
    expect(prepared).toMatchObject({
      ok: true,
      userId: 'usr_1',
      request: { instanceId: 'inst_2', messageSlot: 3 },
    });
  });

  it('returns error when invite user has no location', () => {
    const prepared = prepareInviteUser({ userId: 'usr_1' });
    expect(prepared).toMatchObject({ ok: false });
  });

  it('extracts instanceId from location without delimiter', () => {
    const instanceId = resolveInviteInstanceId({ location: 'inst_only' });
    expect(instanceId).toBe('inst_only');
  });

  it('sends self invite via API', async () => {
    vi.mocked(callOperation).mockResolvedValueOnce({
      data: { id: 'ntf_1' },
      url: 'https://example.test/inviteMyselfTo',
    });
    const notification = await sendSelfInvite({ worldId: 'wrld_1', instanceId: 'inst_1' });
    expect(callOperation).toHaveBeenCalledWith({
      operationId: 'inviteMyselfTo',
      params: { worldId: 'wrld_1', instanceId: 'inst_1' },
      body: undefined,
    });
    expect(notification).toMatchObject({ id: 'ntf_1' });
  });

  it('sends user invite via API', async () => {
    vi.mocked(callOperation).mockResolvedValueOnce({
      data: { id: 'ntf_2' },
      url: 'https://example.test/inviteUser',
    });
    const notification = await sendUserInvite('usr_2', { instanceId: 'inst_9' });
    expect(callOperation).toHaveBeenCalledWith({
      operationId: 'inviteUser',
      params: { userId: 'usr_2' },
      body: { instanceId: 'inst_9' },
    });
    expect(notification).toMatchObject({ id: 'ntf_2' });
  });

  it('resolves current invite location from current user profile', async () => {
    vi.mocked(callOperation).mockResolvedValueOnce({
      data: { id: 'usr_self', location: 'wrld_5:inst_6~private' },
      url: 'https://example.test/getCurrentUser',
    });

    await expect(resolveCurrentInviteLocation()).resolves.toEqual({
      worldId: 'wrld_5',
      instanceId: 'inst_6~private',
      location: 'wrld_5:inst_6~private',
    });
  });

  it('invites user to current instance using current user location', async () => {
    vi.mocked(callOperation)
      .mockResolvedValueOnce({
        data: { id: 'usr_self', location: 'wrld_1:inst_2' },
        url: 'https://example.test/getCurrentUser',
      })
      .mockResolvedValueOnce({
        data: { id: 'ntf_9' },
        url: 'https://example.test/inviteUser',
      });

    const result = await inviteUserToCurrentInstance({ userId: 'usr_target', messageSlot: 4 });

    expect(callOperation).toHaveBeenNthCalledWith(1, {
      operationId: 'getCurrentUser',
      params: {},
    });
    expect(callOperation).toHaveBeenNthCalledWith(2, {
      operationId: 'inviteUser',
      params: { userId: 'usr_target' },
      body: { instanceId: 'inst_2', messageSlot: 4 },
    });
    expect(result).toMatchObject({
      status: 'sent',
      userId: 'usr_target',
      worldId: 'wrld_1',
      instanceId: 'inst_2',
      location: 'wrld_1:inst_2',
      notification: { id: 'ntf_9' },
    });
  });

  it('errors when current location is not a joinable instance', async () => {
    vi.mocked(callOperation).mockResolvedValueOnce({
      data: { id: 'usr_self', location: 'offline' },
      url: 'https://example.test/getCurrentUser',
    });

    await expect(inviteUserToCurrentInstance({ userId: 'usr_target' })).rejects.toThrow(
      'Could not determine your current joinable instance from location.'
    );
  });

  it('bulk invites users here using an existing invite message slot', async () => {
    vi.mocked(callOperation)
      .mockResolvedValueOnce({
        data: { id: 'usr_self', location: 'wrld_1:inst_2' },
        url: 'https://example.test/getCurrentUser',
      })
      .mockResolvedValueOnce({
        data: { id: 'usr_self' },
        url: 'https://example.test/getCurrentUser',
      })
      .mockResolvedValueOnce({
        data: [{ slot: 3, message: 'come hang', canBeUpdated: true, remainingCooldownMinutes: 0 }],
        url: 'https://example.test/getInviteMessages',
      })
      .mockResolvedValueOnce({
        data: { id: 'ntf_1' },
        url: 'https://example.test/inviteUser',
      })
      .mockResolvedValueOnce({
        data: { id: 'ntf_2' },
        url: 'https://example.test/inviteUser',
      });

    const result = await inviteUsers({ here: true, users: ['usr_1', 'usr_2'], message: 'come hang' });

    expect(callOperation).toHaveBeenNthCalledWith(4, {
      operationId: 'inviteUser',
      params: { userId: 'usr_1' },
      body: { instanceId: 'inst_2', messageSlot: 3 },
    });
    expect(callOperation).toHaveBeenNthCalledWith(5, {
      operationId: 'inviteUser',
      params: { userId: 'usr_2' },
      body: { instanceId: 'inst_2', messageSlot: 3 },
    });
    expect(result).toMatchObject({
      status: 'completed',
      sent: 2,
      failed: 0,
      destination: { kind: 'here', worldId: 'wrld_1', instanceId: 'inst_2' },
      message: { slot: 3, matchedExisting: true },
    });
  });

  it('requires overwrite slot when invite message is not saved', async () => {
    vi.mocked(callOperation)
      .mockResolvedValueOnce({
        data: { id: 'usr_self' },
        url: 'https://example.test/getCurrentUser',
      })
      .mockResolvedValueOnce({
        data: [],
        url: 'https://example.test/getInviteMessages',
      });

    await expect(
      inviteUsers({ instanceId: 'inst_1', user: 'usr_1', message: 'new text' })
    ).rejects.toThrow('Provide overwriteMessageSlot');
  });

  it('updates overwrite slot before sending unmatched invite message', async () => {
    vi.mocked(callOperation)
      .mockResolvedValueOnce({
        data: { id: 'usr_self' },
        url: 'https://example.test/getCurrentUser',
      })
      .mockResolvedValueOnce({
        data: [{ slot: 2, message: 'old', canBeUpdated: true, remainingCooldownMinutes: 0 }],
        url: 'https://example.test/getInviteMessages',
      })
      .mockResolvedValueOnce({
        data: [{ slot: 2, message: 'new text' }],
        url: 'https://example.test/updateInviteMessage',
      })
      .mockResolvedValueOnce({
        data: { id: 'ntf_1' },
        url: 'https://example.test/inviteUser',
      });

    const result = await inviteUsers({
      instanceId: 'inst_1',
      user: 'usr_1',
      message: 'new text',
      overwriteMessageSlot: 2,
    });

    expect(callOperation).toHaveBeenNthCalledWith(3, {
      operationId: 'updateInviteMessage',
      params: { userId: 'usr_self', messageType: 'message', slot: 2 },
      body: { message: 'new text' },
    });
    expect(result).toMatchObject({ sent: 1, message: { slot: 2, overwrittenSlot: 2 } });
  });

  it('retries rate-limited invite sends', async () => {
    const rateLimited = Object.assign(new Error('rate limited'), { status: 429 });
    vi.mocked(callOperation)
      .mockRejectedValueOnce(rateLimited)
      .mockResolvedValueOnce({
        data: { id: 'ntf_retry' },
        url: 'https://example.test/inviteUser',
      });

    const result = await inviteUsers({
      instanceId: 'inst_1',
      user: 'usr_1',
      retry: { maxAttempts: 2, baseDelayMs: 0, maxDelayMs: 0 },
    });

    expect(callOperation).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({
      sent: 1,
      results: [{ target: 'usr_1', status: 'sent', attempts: 2 }],
    });
  });

  it('rejects self invite with bare instance id', async () => {
    await expect(inviteUsers({ self: true, instanceId: 'inst_1' })).rejects.toThrow(
      'Self-invite requires a full destination'
    );
  });

  it('dry-runs group invites without writing', async () => {
    const result = await inviteUsersToGroup({ groupId: 'grp_1', users: ['usr_1'], dryRun: true });

    expect(callOperation).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      status: 'dry_run',
      groupId: 'grp_1',
      results: [{ target: 'usr_1', userId: 'usr_1', status: 'would_send' }],
    });
  });
});
