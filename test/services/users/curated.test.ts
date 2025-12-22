import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/core/client.js', () => ({
  callOperation: vi.fn(),
}));

vi.mock('../../../src/services/users/groups.js', () => ({
  fetchUserGroupsWithMeta: vi.fn(),
}));

import { callOperation } from '../../../src/core/client.js';
import { fetchUserGroupsWithMeta } from '../../../src/services/users/groups.js';
import { listUserGroups, resolveUserId, resolveUserProfile } from '../../../src/services/users/curated.js';

describe('users curated service', () => {
  beforeEach(() => {
    vi.mocked(callOperation).mockReset();
    vi.mocked(fetchUserGroupsWithMeta).mockReset();
  });

  it('resolves user id from username', async () => {
    vi.mocked(callOperation).mockResolvedValueOnce({ data: { id: 'usr_1' } });
    const result = await resolveUserId({ username: 'nakk' });
    expect(callOperation).toHaveBeenCalledWith({
      operationId: 'getUserByName',
      params: { username: 'nakk' },
    });
    expect(result).toMatchObject({ ok: true, userId: 'usr_1' });
  });

  it('returns user id directly when provided', async () => {
    const result = await resolveUserId({ userId: 'usr_direct' });
    expect(result).toMatchObject({ ok: true, userId: 'usr_direct' });
    expect(callOperation).not.toHaveBeenCalled();
  });

  it('returns error when username lookup lacks id', async () => {
    vi.mocked(callOperation).mockResolvedValueOnce({ data: { displayName: 'Mystery' } });
    const result = await resolveUserId({ username: 'mystery' });
    expect(result).toMatchObject({ ok: false, reason: 'Unable to resolve userId from username.' });
  });

  it('falls back to current user when no id or name', async () => {
    vi.mocked(callOperation).mockResolvedValueOnce({ data: { id: 'usr_self' } });
    const result = await resolveUserId(undefined);
    expect(callOperation).toHaveBeenCalledWith({ operationId: 'getCurrentUser' });
    expect(result).toMatchObject({ ok: true, userId: 'usr_self' });
  });

  it('returns error when current user lookup lacks id', async () => {
    vi.mocked(callOperation).mockResolvedValueOnce({ data: { displayName: 'NoId' } });
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
    vi.mocked(callOperation).mockResolvedValueOnce({
      data: { id: 'usr_2', displayName: 'User Two' },
    });

    const result = await resolveUserProfile({ username: 'user2' });
    expect(callOperation).toHaveBeenCalledWith({
      operationId: 'getUserByName',
      params: { username: 'user2' },
    });
    expect(result).toMatchObject({
      ok: true,
      userId: 'usr_2',
      user: { id: 'usr_2', displayName: 'User Two' },
    });
  });

  it('returns error when username lookup lacks id', async () => {
    vi.mocked(callOperation).mockResolvedValueOnce({ data: { displayName: 'Mystery' } });
    const result = await resolveUserProfile({ username: 'mystery' });
    expect(result).toMatchObject({ ok: false });
  });

  it('resolves user profile by userId even if response lacks id', async () => {
    vi.mocked(callOperation).mockResolvedValueOnce({ data: { displayName: 'User' } });
    const result = await resolveUserProfile({ userId: 'usr_3' });
    expect(callOperation).toHaveBeenCalledWith({
      operationId: 'getUser',
      params: { userId: 'usr_3' },
    });
    expect(result).toMatchObject({ ok: true, userId: 'usr_3' });
  });

  it('returns error when current user profile lacks id', async () => {
    vi.mocked(callOperation).mockResolvedValueOnce({ data: { displayName: 'NoId' } });
    const result = await resolveUserProfile(undefined);
    expect(result).toMatchObject({ ok: false, reason: 'Unable to resolve current user id.' });
  });
});
