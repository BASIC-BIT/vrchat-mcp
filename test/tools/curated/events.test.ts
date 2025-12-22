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
    createCalendarEvent: vi.fn(),
    updateCalendarEvent: vi.fn(),
    deleteCalendarEvent: vi.fn(),
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
  listUpcomingEvents,
  searchEvents,
  updateCalendarEvent,
} from '../../../src/services/events/curated.js';
import { checkGroupAllowed } from '../../../src/services/groups/index.js';
import { resetConfirmationsForTest } from '../../../src/services/confirmations.js';

describe('curated event tools', () => {
  beforeEach(() => {
    vi.mocked(listUpcomingEvents).mockReset();
    vi.mocked(searchEvents).mockReset();
    vi.mocked(createCalendarEvent).mockReset();
    vi.mocked(updateCalendarEvent).mockReset();
    vi.mocked(deleteCalendarEvent).mockReset();
    vi.mocked(checkGroupAllowed).mockReturnValue({ ok: true });
    resetConfirmationsForTest();
  });

  function readConfirmId(result: unknown): string | undefined {
    if (!result || typeof result !== 'object') return undefined;
    const structured = (result as { structuredContent?: unknown }).structuredContent;
    if (!structured || typeof structured !== 'object') return undefined;
    const confirmId = (structured as { confirmId?: unknown }).confirmId;
    return typeof confirmId === 'string' ? confirmId : undefined;
  }

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

  it('requires confirmation before creating events', async () => {
    vi.mocked(createCalendarEvent).mockResolvedValue({ id: 'evt_2' });

    const server = new FakeServer();
    registerCuratedEventTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_event_create');

    const first = await tool!.handler({
      groupId: 'grp_1',
      title: 'Test',
      description: 'Desc',
      category: 'performance',
      startsAt: '2025-12-25T00:00:00Z',
      endsAt: '2025-12-25T01:00:00Z',
    });
    const confirmId = readConfirmId(first);
    expect(confirmId).toBeTruthy();

    const second = await tool!.handler({
      groupId: 'grp_1',
      title: 'Test',
      description: 'Desc',
      category: 'performance',
      startsAt: '2025-12-25T00:00:00Z',
      endsAt: '2025-12-25T01:00:00Z',
      confirmId,
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
    expect(second).toMatchObject({
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

  it('updates events after confirmation', async () => {
    vi.mocked(updateCalendarEvent).mockResolvedValue({ id: 'evt_9' });

    const server = new FakeServer();
    registerCuratedEventTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_event_update');

    const first = await tool!.handler({
      groupId: 'grp_1',
      calendarId: 'evt_9',
      title: 'Updated',
    });
    const confirmId = readConfirmId(first);
    expect(confirmId).toBeTruthy();

    const second = await tool!.handler({
      groupId: 'grp_1',
      calendarId: 'evt_9',
      title: 'Updated',
      confirmId,
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
    expect(second).toMatchObject({
      structuredContent: { status: 'updated' },
    });
  });

  it('deletes events after confirmation', async () => {
    vi.mocked(deleteCalendarEvent).mockResolvedValue({ ok: true });

    const server = new FakeServer();
    registerCuratedEventTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_event_delete');

    const first = await tool!.handler({ groupId: 'grp_1', calendarId: 'evt_1' });
    const confirmId = readConfirmId(first);
    expect(confirmId).toBeTruthy();

    const second = await tool!.handler({
      groupId: 'grp_1',
      calendarId: 'evt_1',
      confirmId,
    });

    expect(deleteCalendarEvent).toHaveBeenCalledWith('grp_1', 'evt_1');
    expect(second).toMatchObject({
      structuredContent: { status: 'deleted' },
    });
  });
});
