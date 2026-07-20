import { describe, it, expect, vi, beforeEach } from 'vitest';
vi.mock('../../../src/core/readTools.js', () => ({
  callReadOperation: vi.fn(),
}));

import { callReadOperation } from '../../../src/core/readTools.js';
import { cacheManager } from '../../../src/services/cache.js';
import {
  getGroupProfile,
  getGroupEvent,
  getGroupInstancesOverview,
  getGroupNextEvent,
  listGroupEvents,
  listGroupEventsUpcoming,
  listGroupPosts,
  searchGroups,
  resolveGroupId,
} from '../../../src/services/groups/curated.js';
import {
  GROUP_MEMBER_INTER_PAGE_DELAY_MS,
  GROUP_MEMBER_SNAPSHOT_MAX_PAGES,
  listGroupMembers,
} from '../../../src/services/groups/members.js';

function expectPage(value: Record<string, unknown>) {
  return expect.objectContaining(value) as Record<string, unknown>;
}

describe('groups curated service', () => {
  beforeEach(() => {
    cacheManager.invalidateAll();
    vi.mocked(callReadOperation).mockReset();
  });

  it('resolves group id by shortCode', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: [{ id: 'grp_1', shortCode: 'ABC' }],
      page: { pages: 1, items: 1, pageSize: 25, offsetStart: 0, truncated: false },
    });

    const result = await resolveGroupId({ shortCode: 'ABC' });
    expect(result).toMatchObject({ ok: true, groupId: 'grp_1', resolvedBy: 'shortCode' });
  });

  it('returns resolved id when groupId provided', async () => {
    const result = await resolveGroupId({ groupId: 'grp_9' });
    expect(result).toMatchObject({ ok: true, groupId: 'grp_9', resolvedBy: 'id' });
  });

  it('returns not_found when no group id or shortCode provided', async () => {
    const result = await resolveGroupId({});
    expect(result).toMatchObject({ ok: false, status: 'not_found' });
  });

  it('returns not_found when shortCode search misses', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: [],
      page: { pages: 1, items: 0, pageSize: 25, offsetStart: 0, truncated: false },
    });

    const result = await resolveGroupId({ shortCode: 'ZZZ' });
    expect(result).toMatchObject({ ok: false, status: 'not_found' });
  });

  it('searches groups with paging defaults', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: [{ id: 'grp_1', name: 'Group', shortCode: 'ABC', memberCount: 4 }],
      page: { pages: 1, items: 1, pageSize: 50, offsetStart: 0, truncated: false },
    });

    const result = await searchGroups({ query: 'Group' });
    expect(callReadOperation).toHaveBeenCalledWith(
      'searchGroups',
      { query: 'Group' },
      expect.objectContaining({
        page: expectPage({ size: 50, maxPages: 10, maxItems: 500 }),
      }),
    );
    expect(result).toMatchObject({ groups: [{ groupId: 'grp_1', name: 'Group' }] });
  });

  it('loads group profile and caches data', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({ data: { id: 'grp_1', name: 'Group' } });

    const result = await getGroupProfile('grp_1');
    expect(callReadOperation).toHaveBeenCalledWith('getGroup', { groupId: 'grp_1' }, undefined);
    expect(result.group).toMatchObject({ id: 'grp_1', name: 'Group' });
  });

  it('rejects invalid group event dates', async () => {
    await expect(listGroupEvents('grp_1', { date: 'not-a-date' })).rejects.toThrow(
      'date must be a valid ISO date/time string.',
    );
  });

  it('passes paging and filters for members', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: [{ userId: 'usr_1', user: { displayName: 'Alpha' } }],
      page: { pages: 1, items: 1, pageSize: 10, offsetStart: 0, truncated: false },
    });

    const result = await listGroupMembers('grp_1', {
      roleId: 'role_1',
      sort: 'joinedAt',
      offset: 5,
      pageSize: 10,
    });
    expect(callReadOperation).toHaveBeenCalledWith(
      'getGroupMembers',
      { groupId: 'grp_1', roleId: 'role_1', sort: 'joinedAt', offset: 5 },
      expect.objectContaining({
        page: expectPage({ size: 10, maxPages: 1, maxItems: 10 }),
      }),
    );
    expect(result.view).toBe('page');
    expect(result.members).toHaveLength(1);
  });

  it('lists group members with dedupe', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: [
        { userId: 'usr_1', user: { displayName: 'Alpha' } },
        { user: { id: 'usr_1', displayName: 'Alpha Duplicate' } },
      ],
      page: { pages: 1, items: 2, pageSize: 100, offsetStart: 0, truncated: false },
    });

    const result = await listGroupMembers('grp_1', {});
    expect(result.members).toHaveLength(1);
    expect(result.members[0]).toMatchObject({ userId: 'usr_1', displayName: 'Alpha' });
  });

  it('loads all group members with paced pagination only when explicitly requested', async () => {
    vi.useFakeTimers();
    try {
      const firstPage = Array.from({ length: 100 }, (_, index) => ({
        userId: `usr_${index}`,
        user: { displayName: `Member ${index}` },
      }));
      vi.mocked(callReadOperation)
        .mockResolvedValueOnce({
          data: firstPage,
          page: { pages: 1, items: 100, pageSize: 100, offsetStart: 0, truncated: true },
        })
        .mockResolvedValueOnce({
          data: [{ userId: 'usr_100', user: { displayName: 'Member 100' } }],
          page: { pages: 1, items: 1, pageSize: 100, offsetStart: 100, truncated: false },
        });

      const pending = listGroupMembers('grp_1', { view: 'all' });
      await vi.advanceTimersByTimeAsync(GROUP_MEMBER_INTER_PAGE_DELAY_MS);
      const result = await pending;

      expect(callReadOperation).toHaveBeenCalledTimes(2);
      expect(callReadOperation).toHaveBeenNthCalledWith(
        2,
        'getGroupMembers',
        { groupId: 'grp_1', roleId: undefined, sort: undefined, offset: 100 },
        expect.objectContaining({ page: expectPage({ size: 100, maxPages: 1, maxItems: 100 }) }),
      );
      expect(result).toMatchObject({ view: 'all', truncated: false, stale: false });
      expect(result.members).toHaveLength(101);
    } finally {
      vi.useRealTimers();
    }
  });

  it('retries a rate-limited group member page and caches the completed snapshot', async () => {
    const rateLimited = Object.assign(new Error('rate limited'), {
      status: 429,
      retryAfter: '0',
    });
    vi.mocked(callReadOperation)
      .mockRejectedValueOnce(rateLimited)
      .mockResolvedValueOnce({
        data: [{ userId: 'usr_1', user: { displayName: 'Alpha' } }],
        page: { pages: 1, items: 1, pageSize: 100, offsetStart: 0, truncated: false },
      });

    const first = await listGroupMembers('grp_1', { view: 'all' });
    const second = await listGroupMembers('grp_1', { view: 'all' });

    expect(callReadOperation).toHaveBeenCalledTimes(2);
    expect(first.members).toEqual(second.members);
    expect(second).toMatchObject({ view: 'all', stale: false });
  });

  it('caps an all-members snapshot at 10,000 raw members', async () => {
    vi.useFakeTimers();
    try {
      const fullPage = Array.from({ length: 100 }, (_, index) => ({ userId: `usr_${index}` }));
      vi.mocked(callReadOperation).mockResolvedValue({
        data: fullPage,
        page: { pages: 1, items: 100, pageSize: 100, offsetStart: 0, truncated: true },
      });

      const pending = listGroupMembers('grp_1', { view: 'all' });
      await vi.runAllTimersAsync();
      const result = await pending;

      expect(callReadOperation).toHaveBeenCalledTimes(GROUP_MEMBER_SNAPSHOT_MAX_PAGES);
      expect(result).toMatchObject({
        view: 'all',
        truncated: true,
        page: { pages: 100, pageSize: 100, truncated: true },
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it('lists group posts with paging defaults', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: [{ id: 'post_1', title: 'Hello' }],
      page: { pages: 1, items: 1, pageSize: 50, offsetStart: 0, truncated: false },
    });

    const result = await listGroupPosts('grp_1', { publicOnly: true });
    expect(callReadOperation).toHaveBeenCalledWith(
      'getGroupPosts',
      { groupId: 'grp_1', publicOnly: true },
      expect.objectContaining({
        page: expectPage({ size: 50, maxPages: 10 }),
      }),
    );
    expect(result.posts).toHaveLength(1);
  });

  it('lists group posts when publicOnly is false', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: [{ id: 'post_2', title: 'Private' }],
      page: { pages: 1, items: 1, pageSize: 5, offsetStart: 0, truncated: false },
    });

    const result = await listGroupPosts('grp_1', { publicOnly: false, pageSize: 5, maxPages: 1 });
    expect(callReadOperation).toHaveBeenCalledWith(
      'getGroupPosts',
      { groupId: 'grp_1', publicOnly: false },
      expect.objectContaining({
        page: expectPage({ size: 5, maxPages: 1 }),
      }),
    );
    expect(result.posts).toHaveLength(1);
  });

  it('lists group events with date filter', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: [{ id: 'evt_1' }],
      page: { pages: 1, items: 1, pageSize: 5, offsetStart: 0, truncated: false },
    });

    const result = await listGroupEvents('grp_1', { date: '2025-12-01', pageSize: 5, maxPages: 1 });
    expect(callReadOperation).toHaveBeenCalledWith(
      'getGroupCalendarEvents',
      { groupId: 'grp_1', date: '2025-12-01T00:00:00.000Z' },
      expect.objectContaining({
        page: expectPage({ size: 5, maxPages: 1, maxItems: 5 }),
      }),
    );
    expect(result.date).toBe('2025-12-01');
  });

  it('gets a specific group event', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({ data: { id: 'evt_1' } });
    const result = await getGroupEvent('grp_1', { calendarId: 'evt_1' });
    expect(callReadOperation).toHaveBeenCalledWith(
      'getGroupCalendarEvent',
      { groupId: 'grp_1', calendarId: 'evt_1' },
      {},
    );
    expect(result.event).toMatchObject({ id: 'evt_1' });
  });

  it('gets next group event', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({ data: { id: 'evt_next' } });
    const result = await getGroupNextEvent('grp_1');
    expect(callReadOperation).toHaveBeenCalledWith(
      'getGroupNextCalendarEvent',
      { groupId: 'grp_1' },
      {},
    );
    expect(result.event).toMatchObject({ id: 'evt_next' });
  });

  it('requires calendarId for group event fetch', async () => {
    await expect(getGroupEvent('grp_1', { calendarId: ' ' })).rejects.toThrow(
      'calendarId is required.',
    );
  });

  it('filters upcoming group events within the window', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: [
        { id: 'evt_in', startsAt: '2025-12-20T10:00:00Z' },
        { id: 'evt_out', startsAt: '2025-12-25T10:00:00Z' },
      ],
      page: { pages: 1, items: 2, pageSize: 50, offsetStart: 0, truncated: false },
    });

    const result = await listGroupEventsUpcoming('grp_1', {
      from: '2025-12-20T00:00:00Z',
      windowHours: 24,
    });
    expect(result.events[0]).toMatchObject({ id: 'evt_in', startsAt: '2025-12-20T10:00:00Z' });
    expect(result.segments[0]?.date).toBe('2025-12-01');
    expect(callReadOperation).toHaveBeenCalledWith(
      'getGroupCalendarEvents',
      { groupId: 'grp_1', date: '2025-12-01T00:00:00.000Z' },
      expect.objectContaining({ page: expectPage({ size: 50 }) }),
    );
  });

  it('rejects invalid upcoming from date', async () => {
    await expect(listGroupEventsUpcoming('grp_1', { from: 'bad-date' })).rejects.toThrow(
      'from must be a valid ISO date/time string.',
    );
  });

  it('deduplicates upcoming events across months and truncates', async () => {
    vi.mocked(callReadOperation)
      .mockResolvedValueOnce({
        data: [
          { id: 'evt_1', startsAt: '2025-12-31T10:00:00Z' },
          { id: 'evt_1', startsAt: '2025-12-31T10:00:00Z' },
          { id: 'evt_2', startsAt: '2025-12-31T11:00:00Z' },
        ],
        page: { pages: 1, items: 3, pageSize: 50, offsetStart: 0, truncated: false },
      })
      .mockResolvedValueOnce({
        data: [{ id: 'evt_2', startsAt: '2026-01-01T10:00:00Z' }],
        page: { pages: 1, items: 1, pageSize: 50, offsetStart: 0, truncated: true },
      });

    const result = await listGroupEventsUpcoming('grp_1', {
      from: '2025-12-31T00:00:00Z',
      windowHours: 72,
      maxItems: 2,
    });
    expect(result.events.length).toBe(2);
    expect(result.truncated).toBe(true);
    expect(result.segments).toHaveLength(1);
  });

  it('summarizes group instances', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: [
        {
          instanceId: 'i1',
          location: 'wrld_1:1',
          memberCount: 5,
          world: { id: 'wrld_1', name: 'Test World' },
        },
        {
          instanceId: 'i2',
          location: 'wrld_2:1',
          memberCount: 2,
          world: { id: 'wrld_2', name: 'Another' },
        },
      ],
    });

    const result = await getGroupInstancesOverview('grp_1', 100);
    expect(result).toMatchObject({
      totalMembers: 7,
      instances: [
        { instanceId: 'i1', memberCount: 5 },
        { instanceId: 'i2', memberCount: 2 },
      ],
    });
  });

  it('enforces minimum instance count of 1', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: [
        {
          instanceId: 'i1',
          location: 'wrld_1:1',
          memberCount: 5,
          world: { id: 'wrld_1', name: 'Test World' },
        },
        {
          instanceId: 'i2',
          location: 'wrld_2:1',
          memberCount: 2,
          world: { id: 'wrld_2', name: 'Another' },
        },
      ],
    });

    const result = await getGroupInstancesOverview('grp_1', 0);
    expect(result.instances).toHaveLength(1);
  });
});
