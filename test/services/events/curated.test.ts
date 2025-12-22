import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/core/readTools.js', () => ({
  callReadOperation: vi.fn(),
}));
vi.mock('../../../src/core/client.js', () => ({
  callOperation: vi.fn(),
}));

import { callReadOperation } from '../../../src/core/readTools.js';
import { callOperation } from '../../../src/core/client.js';
import {
  buildCalendarCreateRequest,
  buildCalendarUpdateRequest,
  createCalendarEvent,
  deleteCalendarEvent,
  listUpcomingEvents,
  searchEvents,
  updateCalendarEvent,
} from '../../../src/services/events/curated.js';

describe('events curated service', () => {
  beforeEach(() => {
    vi.mocked(callReadOperation).mockReset();
    vi.mocked(callOperation).mockReset();
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
    expect(result.events).toEqual([{ id: 'evt_1', startsAt: '2025-12-22T13:00:00Z' }]);
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

  it('builds calendar create and update requests', () => {
    const create = buildCalendarCreateRequest({
      title: 'Party',
      startsAt: '2025-12-31T10:00:00Z',
      category: 'meetup',
    });
    const update = buildCalendarUpdateRequest({
      title: 'Updated Party',
      sendCreationNotification: true,
    });

    expect(create).toMatchObject({
      title: 'Party',
      startsAt: '2025-12-31T10:00:00Z',
      category: 'meetup',
      accessType: 'group',
      sendCreationNotification: false,
    });
    expect(update).toMatchObject({
      title: 'Updated Party',
      sendCreationNotification: true,
    });
  });

  it('calls create/update/delete event operations', async () => {
    vi.mocked(callOperation)
      .mockResolvedValueOnce({ data: { id: 'evt_new' } })
      .mockResolvedValueOnce({ data: { id: 'evt_updated' } })
      .mockResolvedValueOnce({ data: { id: 'evt_deleted' } });

    const created = await createCalendarEvent('grp_1', { title: 'Party' });
    const updated = await updateCalendarEvent('grp_1', 'cal_1', { title: 'Updated' });
    const deleted = await deleteCalendarEvent('grp_1', 'cal_1');

    expect(created).toEqual({ id: 'evt_new' });
    expect(updated).toEqual({ id: 'evt_updated' });
    expect(deleted).toEqual({ id: 'evt_deleted' });
  });
});
