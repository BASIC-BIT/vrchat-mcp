import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/core/client.js', () => ({
  callOperation: vi.fn(),
}));

import { callOperation } from '../../../src/core/client.js';
import {
  prepareInviteUser,
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
    vi.mocked(callOperation).mockResolvedValueOnce({ data: { id: 'ntf_1' } });
    const notification = await sendSelfInvite({ worldId: 'wrld_1', instanceId: 'inst_1' });
    expect(callOperation).toHaveBeenCalledWith({
      operationId: 'inviteMyselfTo',
      params: { worldId: 'wrld_1', instanceId: 'inst_1' },
    });
    expect(notification).toEqual({ id: 'ntf_1' });
  });

  it('sends user invite via API', async () => {
    vi.mocked(callOperation).mockResolvedValueOnce({ data: { id: 'ntf_2' } });
    const notification = await sendUserInvite('usr_2', { instanceId: 'inst_9' });
    expect(callOperation).toHaveBeenCalledWith({
      operationId: 'inviteUser',
      params: { userId: 'usr_2' },
      body: { instanceId: 'inst_9' },
    });
    expect(notification).toEqual({ id: 'ntf_2' });
  });
});
