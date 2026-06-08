import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakeServer } from '../../helpers/fake-server.js';

vi.mock('../../../src/services/events/curated.js', async () => {
  const actual = await vi.importActual<Record<string, unknown>>(
    '../../../src/services/events/curated.js',
  );
  return {
    ...actual,
    listUpcomingEvents: vi.fn(),
    searchEvents: vi.fn(),
    discoverEvents: vi.fn(),
    createCalendarEvent: vi.fn(),
    updateCalendarEvent: vi.fn(),
    deleteCalendarEvent: vi.fn(),
    deleteCalendarEventOccurrence: vi.fn(),
    followCalendarEvent: vi.fn(),
  };
});

vi.mock('../../../src/services/groups/index.js', () => ({
  checkGroupAllowed: vi.fn(() => ({ ok: true })),
}));

import { registerCuratedEventTools } from '../../../src/tools/curated/events.js';
import {
  buildCalendarCreateRequest,
  buildCalendarUpdateRequest,
  createCalendarEvent,
  deleteCalendarEvent,
  deleteCalendarEventOccurrence,
  discoverEvents,
  followCalendarEvent,
  listUpcomingEvents,
  searchEvents,
  updateCalendarEvent,
} from '../../../src/services/events/curated.js';
import { checkGroupAllowed } from '../../../src/services/groups/index.js';

describe('curated event tools', () => {
  beforeEach(() => {
    vi.mocked(listUpcomingEvents).mockReset();
    vi.mocked(searchEvents).mockReset();
    vi.mocked(discoverEvents).mockReset();
    vi.mocked(createCalendarEvent).mockReset();
    vi.mocked(updateCalendarEvent).mockReset();
    vi.mocked(deleteCalendarEvent).mockReset();
    vi.mocked(deleteCalendarEventOccurrence).mockReset();
    vi.mocked(followCalendarEvent).mockReset();
    vi.mocked(checkGroupAllowed).mockReturnValue({ ok: true });
  });

  it('fetches upcoming events with default window', async () => {
    vi.mocked(listUpcomingEvents).mockResolvedValue({
      from: new Date('2025-12-22T12:00:00Z'),
      to: new Date('2025-12-29T12:00:00Z'),
      windowHours: 168,
      pageSize: 50,
      maxPages: 4,
      maxItems: 200,
      totalEvents: 2,
      truncated: false,
      segments: [{ date: '2025-12-01' }],
      events: [{ id: 'evt_1' }, { id: 'evt_2' }],
    });

    const server = new FakeServer();
    registerCuratedEventTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_events_upcoming');
    const result = await tool!.handler({});

    expect(result).toMatchObject({
      structuredContent: {
        windowHours: 168,
        totalEvents: 2,
        from: '2025-12-22T12:00:00.000Z',
        to: '2025-12-29T12:00:00.000Z',
      },
    });
  });

  it('searches events by term', async () => {
    vi.mocked(searchEvents).mockResolvedValue({
      searchTerm: 'music',
      utcOffset: -480,
      pageSize: 50,
      maxPages: 4,
      totalEvents: 0,
      truncated: false,
      page: { pages: 1, items: 0, pageSize: 50, offsetStart: 0, truncated: false },
      events: [],
    });

    const server = new FakeServer();
    registerCuratedEventTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_events_search');
    const result = await tool!.handler({ searchTerm: 'music', utcOffset: -480 });

    expect(result).toMatchObject({
      structuredContent: { searchTerm: 'music', totalEvents: 0 },
    });
  });

  it('discovers events', async () => {
    vi.mocked(discoverEvents).mockResolvedValue({
      scope: 'upcoming',
      pageSize: 50,
      maxPages: 4,
      maxItems: 200,
      totalEvents: 1,
      truncated: false,
      nextCursor: undefined,
      page: { pages: 1, items: 1, pageSize: 50, truncated: false },
      events: [{ id: 'evt_1' }],
    });

    const server = new FakeServer();
    registerCuratedEventTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_events_discover');
    const result = await tool!.handler({ scope: 'upcoming' });

    expect(result).toMatchObject({
      structuredContent: { scope: 'upcoming', totalEvents: 1 },
    });
  });

  it('creates events', async () => {
    vi.mocked(createCalendarEvent).mockResolvedValue({ id: 'evt_2' });

    const server = new FakeServer();
    registerCuratedEventTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_event_create');

    const result = await tool!.handler({
      groupId: 'grp_1',
      title: 'Test',
      description: 'Desc',
      category: 'performance',
      startsAt: '2025-12-25T00:00:00Z',
      endsAt: '2025-12-25T01:00:00Z',
    });

    const request = buildCalendarCreateRequest({
      groupId: 'grp_1',
      title: 'Test',
      description: 'Desc',
      category: 'performance',
      startsAt: '2025-12-25T00:00:00Z',
      endsAt: '2025-12-25T01:00:00Z',
    });
    expect(createCalendarEvent).toHaveBeenCalledWith('grp_1', expect.objectContaining(request));
    expect(result).toMatchObject({
      structuredContent: { status: 'created' },
    });
  });

  it('blocks create when group is not allowlisted', async () => {
    vi.mocked(checkGroupAllowed).mockReturnValue({ ok: false, reason: 'Nope' });

    const server = new FakeServer();
    registerCuratedEventTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_event_create');
    const result = await tool!.handler({
      groupId: 'grp_1',
      title: 'Test',
      description: 'Desc',
      category: 'performance',
      startsAt: '2025-12-25T00:00:00Z',
      endsAt: '2025-12-25T01:00:00Z',
    });

    expect(result).toMatchObject({ isError: true });
  });

  it('updates events', async () => {
    vi.mocked(updateCalendarEvent).mockResolvedValue({ id: 'evt_9' });

    const server = new FakeServer();
    registerCuratedEventTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_event_update');

    const result = await tool!.handler({
      groupId: 'grp_1',
      calendarId: 'evt_9',
      title: 'Updated',
    });

    const request = buildCalendarUpdateRequest({
      groupId: 'grp_1',
      calendarId: 'evt_9',
      title: 'Updated',
    });
    expect(updateCalendarEvent).toHaveBeenCalledWith(
      'grp_1',
      'evt_9',
      expect.objectContaining(request),
    );
    expect(result).toMatchObject({
      structuredContent: { status: 'updated' },
    });
  });

  it('deletes events', async () => {
    vi.mocked(deleteCalendarEvent).mockResolvedValue({ ok: true });

    const server = new FakeServer();
    registerCuratedEventTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_event_delete');

    const result = await tool!.handler({ groupId: 'grp_1', calendarId: 'evt_1' });
    expect(deleteCalendarEvent).toHaveBeenCalledWith('grp_1', 'evt_1');
    expect(result).toMatchObject({
      structuredContent: { status: 'deleted' },
    });
  });

  it('deletes occurrence events with the guarded tool', async () => {
    vi.mocked(deleteCalendarEventOccurrence).mockResolvedValue({
      event: { id: 'evt_1', occurrenceKind: 'occurrence' },
      result: { ok: true },
    });

    const server = new FakeServer();
    registerCuratedEventTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_event_delete_occurrence');

    const result = await tool!.handler({ groupId: 'grp_1', calendarId: 'evt_1' });
    expect(deleteCalendarEventOccurrence).toHaveBeenCalledWith('grp_1', 'evt_1');
    expect(result).toMatchObject({
      structuredContent: {
        status: 'deleted',
        event: { id: 'evt_1', occurrenceKind: 'occurrence' },
      },
    });
  });

  it('surfaces guarded occurrence delete errors', async () => {
    vi.mocked(deleteCalendarEventOccurrence).mockRejectedValue(new Error('Refusing to delete series'));

    const server = new FakeServer();
    registerCuratedEventTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_event_delete_occurrence');

    const result = await tool!.handler({ groupId: 'grp_1', calendarId: 'evt_1' });

    expect(result).toMatchObject({ isError: true });
  });

  it('follows events', async () => {
    vi.mocked(followCalendarEvent).mockResolvedValue({ id: 'evt_1' });

    const server = new FakeServer();
    registerCuratedEventTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_event_follow');

    const result = await tool!.handler({
      groupId: 'grp_1',
      calendarId: 'evt_1',
      isFollowing: true,
    });

    expect(followCalendarEvent).toHaveBeenCalledWith({
      groupId: 'grp_1',
      calendarId: 'evt_1',
      isFollowing: true,
    });
    expect(result).toMatchObject({
      structuredContent: { status: 'followed' },
    });
  });
});
