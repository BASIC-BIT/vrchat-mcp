import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/core/client.js', () => ({
  callOperation: vi.fn(),
}));

import { callOperation } from '../../../src/core/client.js';
import {
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
});
