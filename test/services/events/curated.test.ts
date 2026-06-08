import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/core/readTools.js', () => ({
  callReadOperation: vi.fn(),
}));
vi.mock('../../../src/core/client.js', () => ({
  callOperation: vi.fn(),
}));

import { callReadOperation } from '../../../src/core/readTools.js';
import { callOperation } from '../../../src/core/client.js';
import { cacheManager } from '../../../src/services/cache.js';
import {
  buildCalendarCreateRequest,
  buildCalendarUpdateRequest,
  createCalendarEvent,
  deleteCalendarEvent,
  discoverEvents,
  followCalendarEvent,
  listUpcomingEvents,
  searchEvents,
  updateCalendarEvent,
} from '../../../src/services/events/curated.js';

function expectPage(value: Record<string, unknown>) {
  return expect.objectContaining(value) as Record<string, unknown>;
}

describe('events curated service', () => {
  beforeEach(() => {
    vi.mocked(callReadOperation).mockReset();
    vi.mocked(callOperation).mockReset();
    cacheManager.invalidateAll();
  });

  it('filters upcoming events within the window', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: [
        { id: 'evt_1', startsAt: '2025-12-22T13:00:00Z' },
        { id: 'evt_2', startsAt: '2025-12-24T10:00:00Z' },
      ],
      page: { pages: 1, items: 2, pageSize: 50, offsetStart: 0, truncated: false },
    });

    const result = await listUpcomingEvents({
      from: '2025-12-22T12:00:00Z',
      windowHours: 24,
    });
    expect(result.totalEvents).toBe(1);
    expect(result.events[0]).toMatchObject({ id: 'evt_1', startsAt: '2025-12-22T13:00:00Z' });
    expect(callReadOperation).toHaveBeenCalledWith(
      'getCalendarEvents',
      { date: '2025-12-01T00:00:00.000Z' },
      expect.objectContaining({ page: expectPage({ size: 50 }) }),
    );
  });

  it('rejects invalid from values', async () => {
    await expect(listUpcomingEvents({ from: 'not-a-date' })).rejects.toThrow(
      'from must be a valid ISO date/time string.',
    );
  });

  it('deduplicates and sorts events across months', async () => {
    vi.mocked(callReadOperation)
      .mockResolvedValueOnce({
        data: [
          { id: 'evt_dupe', startsAt: '2025-12-31T10:00:00Z' },
          { id: 'evt_early', startsAt: '2025-12-31T05:00:00Z' },
        ],
        page: { pages: 1, items: 2, pageSize: 50, offsetStart: 0, truncated: false },
      })
      .mockResolvedValueOnce({
        data: [
          { id: 'evt_dupe', startsAt: '2026-01-01T01:00:00Z' },
          { id: 'evt_late', startsAt: '2026-01-01T12:00:00Z' },
        ],
        page: { pages: 1, items: 2, pageSize: 50, offsetStart: 0, truncated: true },
      });

    const result = await listUpcomingEvents({
      from: '2025-12-31T00:00:00Z',
      windowHours: 48,
    });

    expect(result.events.map((event) => (event as { id: string }).id)).toEqual([
      'evt_early',
      'evt_dupe',
      'evt_late',
    ]);
    expect(result.truncated).toBe(true);
    expect(result.segments).toHaveLength(2);
  });

  it('requires a search term', async () => {
    await expect(searchEvents({ searchTerm: '' })).rejects.toThrow('searchTerm is required.');
  });

  it('passes utcOffset and paging to search events', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: [{ id: 'evt_1' }],
      page: { pages: 1, items: 1, pageSize: 25, offsetStart: 0, truncated: true },
    });

    const result = await searchEvents({ searchTerm: 'party', utcOffset: -420, pageSize: 25 });
    expect(result.utcOffset).toBe(-420);
    expect(result.totalEvents).toBe(1);
    expect(result.truncated).toBe(true);
  });

  it('discovers events with cursor pagination', async () => {
    vi.mocked(callReadOperation)
      .mockResolvedValueOnce({
        data: { results: [{ id: 'evt_1' }], nextCursor: ' cursor_2 ' },
      })
      .mockResolvedValueOnce({
        data: { results: [{ id: 'evt_2' }], nextCursor: '' },
      });

    const result = await discoverEvents({
      scope: 'upcoming',
      categories: ['music'],
      pageSize: 1,
      maxPages: 2,
    });

    expect(callReadOperation).toHaveBeenNthCalledWith(
      1,
      'discoverCalendarEvents',
      expect.objectContaining({ scope: 'upcoming', categories: 'music', n: 1 }),
      undefined,
    );
    expect(callReadOperation).toHaveBeenNthCalledWith(
      2,
      'discoverCalendarEvents',
      expect.objectContaining({ nextCursor: ' cursor_2 ' }),
      undefined,
    );
    expect(result.events.map((event) => event.id)).toEqual(['evt_1', 'evt_2']);
    expect(result.truncated).toBe(false);
    expect(result.nextCursor).toBeUndefined();
    expect(result.page.nextCursor).toBeUndefined();
  });

  it('marks discovery truncated and clears cursor when maxItems clips a fetched page', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: {
        results: [{ id: 'evt_1' }, { id: 'evt_2' }, { id: 'evt_3' }],
        nextCursor: 'cursor_after_full_page',
      },
    });

    const result = await discoverEvents({ pageSize: 3, maxPages: 1, maxItems: 2 });

    expect(result.events.map((event) => event.id)).toEqual(['evt_1', 'evt_2']);
    expect(result.truncated).toBe(true);
    expect(result.nextCursor).toBeUndefined();
    expect(result.page.nextCursor).toBeUndefined();
  });

  it('keeps valid discovery cursor when page ends exactly at maxItems', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: { results: [{ id: 'evt_1' }, { id: 'evt_2' }], nextCursor: 'cursor_2' },
    });

    const result = await discoverEvents({ pageSize: 2, maxPages: 2, maxItems: 2 });

    expect(result.events.map((event) => event.id)).toEqual(['evt_1', 'evt_2']);
    expect(result.truncated).toBe(true);
    expect(result.nextCursor).toBe('cursor_2');
  });

  it('marks discovery truncated when maxItems clips the final page', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: { results: [{ id: 'evt_1' }, { id: 'evt_2' }, { id: 'evt_3' }], nextCursor: '' },
    });

    const result = await discoverEvents({ pageSize: 3, maxPages: 1, maxItems: 2 });

    expect(result.events.map((event) => event.id)).toEqual(['evt_1', 'evt_2']);
    expect(result.truncated).toBe(true);
    expect(result.nextCursor).toBeUndefined();
  });

  it('builds calendar create and update requests', () => {
    const create = buildCalendarCreateRequest({
      groupId: 'grp_1',
      title: 'Party',
      description: 'Party time',
      category: 'hangout',
      startsAt: '2025-12-31T10:00:00Z',
      endsAt: '2025-12-31T12:00:00Z',
    });
    const update = buildCalendarUpdateRequest({
      title: 'Updated Party',
      sendCreationNotification: true,
    });

    expect(create).toMatchObject({
      title: 'Party',
      startsAt: '2025-12-31T10:00:00Z',
      category: 'hangout',
      accessType: 'group',
      sendCreationNotification: false,
    });
    expect(update).toMatchObject({
      title: 'Updated Party',
      sendCreationNotification: true,
    });
  });

  it('calls create/update/delete event operations', async () => {
    const invalidateSpy = vi.spyOn(cacheManager, 'invalidateByTag');
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: { id: 'cal_1', occurrenceKind: 'occurrence' },
    });
    vi.mocked(callOperation)
      .mockResolvedValueOnce({ data: { id: 'evt_new' } })
      .mockResolvedValueOnce({ data: { id: 'evt_updated' } })
      .mockResolvedValueOnce({ data: { status: 'success' } });

    const created = await createCalendarEvent('grp_1', {
      title: 'Party',
      description: 'Party time',
      category: 'hangout',
      startsAt: '2025-12-31T10:00:00Z',
      endsAt: '2025-12-31T12:00:00Z',
      accessType: 'group',
      sendCreationNotification: false,
    });
    const updated = await updateCalendarEvent('grp_1', 'cal_1', { title: 'Updated' });
    const deleted = await deleteCalendarEvent('grp_1', 'cal_1', 'occurrence');

    expect(created).toMatchObject({ id: 'evt_new' });
    expect(updated).toMatchObject({ id: 'evt_updated' });
    expect(deleted.event).toMatchObject({ id: 'cal_1', occurrenceKind: 'occurrence' });
    expect(deleted.result).toEqual({ status: 'success' });
    expect(invalidateSpy).toHaveBeenCalledTimes(3);
    expect(invalidateSpy).toHaveBeenCalledWith('groups:grp_1');
    invalidateSpy.mockRestore();
  });

  it('invalidates cached group event reads after deleting an event', async () => {
    cacheManager.set('cached-group-event', { event: { id: 'cal_1' } }, 60_000, [
      'groups',
      'groups:grp_1',
    ]);
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: { id: 'cal_1', occurrenceKind: 'occurrence' },
    });
    vi.mocked(callOperation).mockResolvedValueOnce({ data: { status: 'success' } });

    await deleteCalendarEvent('grp_1', 'cal_1', 'occurrence');

    expect(cacheManager.get('cached-group-event')).toBeUndefined();
  });

  it('deletes occurrence events after verifying targetKind', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: { id: 'cal_1', occurrenceKind: 'occurrence' },
    });
    vi.mocked(callOperation).mockResolvedValueOnce({ data: { status: 'success' } });

    const result = await deleteCalendarEvent('grp_1', 'cal_1', 'occurrence');

    expect(callReadOperation).toHaveBeenCalledWith(
      'getGroupCalendarEvent',
      { groupId: 'grp_1', calendarId: 'cal_1' },
      {},
    );
    expect(callOperation).toHaveBeenCalledWith({
      operationId: 'deleteGroupCalendarEvent',
      params: { groupId: 'grp_1', calendarId: 'cal_1' },
      body: undefined,
    });
    expect(result.event).toMatchObject({ id: 'cal_1', occurrenceKind: 'occurrence' });
  });

  it('deletes series events after verifying targetKind', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: { id: 'cal_series', occurrenceKind: 'series' },
    });
    vi.mocked(callOperation).mockResolvedValueOnce({ data: { status: 'success' } });

    const result = await deleteCalendarEvent('grp_1', 'cal_series', 'series');

    expect(callOperation).toHaveBeenCalledWith({
      operationId: 'deleteGroupCalendarEvent',
      params: { groupId: 'grp_1', calendarId: 'cal_series' },
      body: undefined,
    });
    expect(result.event).toMatchObject({ id: 'cal_series', occurrenceKind: 'series' });
  });

  it('deletes single events after verifying targetKind', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: { id: 'cal_single' },
    });
    vi.mocked(callOperation).mockResolvedValueOnce({ data: { status: 'success' } });

    const result = await deleteCalendarEvent('grp_1', 'cal_single', 'single_event');

    expect(callOperation).toHaveBeenCalledWith({
      operationId: 'deleteGroupCalendarEvent',
      params: { groupId: 'grp_1', calendarId: 'cal_single' },
      body: undefined,
    });
    expect(result.event).toMatchObject({ id: 'cal_single' });
  });

  it('refuses to delete when targetKind does not match', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: { id: 'cal_series', occurrenceKind: 'series' },
    });

    await expect(deleteCalendarEvent('grp_1', 'cal_series', 'occurrence')).rejects.toThrow(
      'expected targetKind "occurrence"',
    );
    expect(callOperation).not.toHaveBeenCalled();
  });

  it('refuses to delete single events as recurring targets', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: { id: 'cal_single' },
    });

    await expect(deleteCalendarEvent('grp_1', 'cal_single', 'series')).rejects.toThrow(
      'found "single_event"',
    );
    expect(callOperation).not.toHaveBeenCalled();
  });

  it('follows events via API', async () => {
    const invalidateSpy = vi.spyOn(cacheManager, 'invalidateByTag');
    vi.mocked(callOperation).mockResolvedValueOnce({ data: { id: 'evt_followed' } });

    const result = await followCalendarEvent({
      groupId: 'grp_1',
      calendarId: 'cal_1',
      isFollowing: true,
    });

    expect(callOperation).toHaveBeenCalledWith({
      operationId: 'followGroupCalendarEvent',
      params: { groupId: 'grp_1', calendarId: 'cal_1' },
      body: { isFollowing: true },
    });
    expect(result).toMatchObject({ id: 'evt_followed' });
    expect(invalidateSpy).toHaveBeenCalledWith('groups:grp_1');
    invalidateSpy.mockRestore();
  });
});
