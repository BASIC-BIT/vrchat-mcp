import { describe, it, expect, vi, beforeEach } from 'vitest';
vi.mock('../../../src/core/client.js', () => ({
  callOperation: vi.fn(),
}));
vi.mock('../../../src/core/readTools.js', () => ({
  callReadOperation: vi.fn(),
}));
vi.mock('../../../src/services/users/groups.js', () => ({
  fetchUserGroupsWithMeta: vi.fn(),
}));

import { callOperation } from '../../../src/core/client.js';
import { callReadOperation } from '../../../src/core/readTools.js';
import { fetchUserGroupsWithMeta } from '../../../src/services/users/groups.js';
import { listUserGroups, resolveUserId, resolveUserProfile, updateProfile } from '../../../src/services/users/curated.js';

describe('users curated service', () => {
  beforeEach(() => {
    vi.mocked(callOperation).mockReset();
    vi.mocked(callReadOperation).mockReset();
    vi.mocked(fetchUserGroupsWithMeta).mockReset();
  });

  it('resolves user id from username', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({ data: { id: 'usr_1' } });
    const result = await resolveUserId({ username: 'nakk' });
    expect(callReadOperation).toHaveBeenCalledWith('getUserByName', { username: 'nakk' }, undefined);
    expect(result).toMatchObject({ ok: true, userId: 'usr_1' });
  });

  it('returns user id directly when provided', async () => {
    const result = await resolveUserId({ userId: 'usr_direct' });
    expect(result).toMatchObject({ ok: true, userId: 'usr_direct' });
    expect(callReadOperation).not.toHaveBeenCalled();
    expect(callOperation).not.toHaveBeenCalled();
  });

  it('returns error when username lookup lacks id', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({ data: { displayName: 'Mystery' } });
    const result = await resolveUserId({ username: 'mystery' });
    expect(result).toMatchObject({ ok: false, reason: 'Unable to resolve userId from username.' });
  });

  it('falls back to current user when no id or name', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({ data: { id: 'usr_self' } });
    const result = await resolveUserId(undefined);
    expect(callReadOperation).toHaveBeenCalledWith('getCurrentUser', {}, undefined);
    expect(result).toMatchObject({ ok: true, userId: 'usr_self' });
  });

  it('returns error when current user lookup lacks id', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({ data: { displayName: 'NoId' } });
    const result = await resolveUserId(undefined);
    expect(result).toMatchObject({ ok: false, reason: 'Unable to resolve current user id.' });
  });

  it('maps user group list into output', async () => {
    vi.mocked(fetchUserGroupsWithMeta).mockResolvedValueOnce({
      groups: [{ groupId: 'grp_1', name: 'Alpha', shortCode: 'ALP' }],
      meta: {
        total: 1,
        truncated: false,
        stale: false,
        page: { pages: 1, items: 1, pageSize: 100, offsetStart: 0, truncated: false },
      },
    });

    const result = await listUserGroups({
      userId: 'usr_1',
      pageSize: 100,
      maxPages: 1,
      offset: 0,
    });

    expect(fetchUserGroupsWithMeta).toHaveBeenCalledWith({
      userId: 'usr_1',
      pageSize: 100,
      maxPages: 1,
      offset: 0,
    });
    expect(result).toMatchObject({
      userId: 'usr_1',
      totalGroups: 1,
      groups: [{ groupId: 'grp_1', name: 'Alpha', shortCode: 'ALP' }],
    });
  });

  it('resolves user profile by username', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: { id: 'usr_2', displayName: 'User Two' },
    });

    const result = await resolveUserProfile({ username: 'user2' });
    expect(callReadOperation).toHaveBeenCalledWith('getUserByName', { username: 'user2' }, undefined);
    expect(result).toMatchObject({
      ok: true,
      userId: 'usr_2',
      user: { id: 'usr_2', displayName: 'User Two' },
    });
  });

  it('returns error when username lookup lacks id', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({ data: { displayName: 'Mystery' } });
    const result = await resolveUserProfile({ username: 'mystery' });
    expect(result).toMatchObject({ ok: false });
  });

  it('resolves user profile by userId even if response lacks id', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({ data: { displayName: 'User' } });
    const result = await resolveUserProfile({ userId: 'usr_3' });
    expect(callReadOperation).toHaveBeenCalledWith('getUser', { userId: 'usr_3' }, undefined);
    expect(result).toMatchObject({ ok: true, userId: 'usr_3' });
  });

  it('returns error when current user profile lacks id', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({ data: { displayName: 'NoId' } });
    const result = await resolveUserProfile(undefined);
    expect(result).toMatchObject({ ok: false, reason: 'Unable to resolve current user id.' });
  });

  it('updates profile while preserving current status', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: {
        id: 'usr_self',
        status: 'ask me',
        statusDescription: 'busy',
      },
    });
    vi.mocked(callOperation).mockResolvedValueOnce({
      data: { id: 'usr_self', bio: 'Hello', status: 'ask me' },
    });

    const result = await updateProfile({ bio: 'Hello' });
    expect(callReadOperation).toHaveBeenCalledWith('getCurrentUser', {}, undefined);
    expect(callOperation).toHaveBeenCalledWith({
      operationId: 'updateUser',
      params: { userId: 'usr_self' },
      body: {
        bio: 'Hello',
        status: 'ask me',
        statusDescription: 'busy',
      },
    });
    expect(result).toMatchObject({ userId: 'usr_self' });
  });

  it('rejects profile update when no fields are provided', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: { id: 'usr_self', status: 'ask me', statusDescription: '' },
    });

    await expect(updateProfile({})).rejects.toThrow(
      'Provide at least one profile field to update.',
    );
  });
});
