import type { z } from 'zod';
import {
  CalendarEventCreateSchema,
  type CalendarEventCreateInput,
  type CalendarEventDeleteInput,
  type CalendarEventFollowInput,
  type CalendarEventUpdateInput,
  type EventsDiscoverInput,
  type EventsSearchInput,
  type EventsUpcomingInput,
} from '../../models/events.js';
import type { schemas } from '../../generated/vrchat-schemas.js';
import {
  callReadOperationParsed,
  callWriteOperationParsed,
  type ReadOperationData,
} from '../api/client.js';
import { cacheManager } from '../cache.js';
import {
  getMonthKeys,
  monthKeyToDateTime,
  parseEventTime,
  parseIsoDate,
  type CalendarEventRecord,
} from './utils.js';

interface PageInfo {
  pages: number;
  items: number;
  pageSize: number;
  offsetStart: number;
  truncated: boolean;
}

const DEFAULT_PAGE_SIZE = 50;
const DEFAULT_MAX_PAGES = 4;
const DEFAULT_WINDOW_HOURS = 168;
type CalendarEventCreateRequest = z.infer<typeof schemas.CreateCalendarEventRequest>;
type CalendarEventUpdateRequest = z.infer<typeof schemas.UpdateCalendarEventRequest>;
type CalendarEventUpdatePayload = Omit<CalendarEventUpdateInput, 'groupId' | 'calendarId'> & {
  groupId?: string;
  calendarId?: string;
};
type GroupCalendarEvent = NonNullable<ReadOperationData<'getGroupCalendarEvent'>>;
type CalendarEventDeleteTargetKind = CalendarEventDeleteInput['targetKind'];

function invalidateGroupEventCaches(groupId: string): void {
  cacheManager.invalidateByTag(`groups:${groupId}`);
}

function getOccurrenceKind(event: GroupCalendarEvent): string | undefined {
  const kind = (event as Record<string, unknown>).occurrenceKind;
  return typeof kind === 'string' ? kind : undefined;
}

async function getGroupCalendarEventOrThrow(
  groupId: string,
  calendarId: string,
): Promise<GroupCalendarEvent> {
  const eventResult = await callReadOperationParsed(
    'getGroupCalendarEvent',
    { groupId, calendarId },
    {},
  );
  const event = eventResult.data;
  if (!event) {
    throw new Error('Calendar event not found.');
  }
  return event;
}

function assertDeleteTargetKind(
  event: GroupCalendarEvent,
  calendarId: string,
  targetKind: CalendarEventDeleteTargetKind,
): void {
  const occurrenceKind = getOccurrenceKind(event);
  if (occurrenceKind === targetKind) return;

  const found = occurrenceKind ? `occurrenceKind "${occurrenceKind}"` : 'no occurrenceKind';
  throw new Error(
    `Refusing to delete calendar event ${calendarId}: expected targetKind "${targetKind}" but found ${found}.`,
  );
}

function parseNumber(value: number | null | undefined, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.floor(value);
  return fallback;
}

export async function listUpcomingEvents(input: EventsUpcomingInput) {
  const fromInput = parseIsoDate(input.from);
  if (input.from && !fromInput) {
    throw new Error('from must be a valid ISO date/time string.');
  }
  const fromDate = fromInput ?? new Date();
  const windowHours = parseNumber(input.windowHours, DEFAULT_WINDOW_HOURS);
  const toDate = new Date(fromDate.getTime() + windowHours * 60 * 60 * 1000);
  const pageSize = parseNumber(input.pageSize, DEFAULT_PAGE_SIZE);
  const maxPages = parseNumber(input.maxPages, DEFAULT_MAX_PAGES);
  const maxItems = parseNumber(input.maxItems, pageSize * maxPages);
  const dateKeys = getMonthKeys(fromDate, toDate);
  const segments: { date: string; page?: PageInfo }[] = [];
  const collected: CalendarEventRecord[] = [];
  const seenIds = new Set<string>();
  let truncated = false;

  for (const date of dateKeys) {
    const remaining = maxItems - collected.length;
    if (remaining <= 0) {
      truncated = true;
      break;
    }

    const result = await callReadOperationParsed(
      'getCalendarEvents',
      { date: monthKeyToDateTime(date) },
      {
        fields: input.fields,
        compact: input.compact,
        maxArrayLength: input.maxArrayLength,
        page: {
          enabled: true,
          size: pageSize,
          maxPages,
          maxItems: remaining,
        },
      },
    );

    const batch = result.data;
    const filtered = batch.filter((event) => {
      const ts = parseEventTime(event.startsAt);
      if (ts === null) return false;
      return ts >= fromDate.getTime() && ts < toDate.getTime();
    });
    for (const event of filtered) {
      const id = event.id;
      if (typeof id === 'string') {
        if (seenIds.has(id)) continue;
        seenIds.add(id);
      }
      collected.push(event);
    }
    if (result.page) {
      segments.push({ date, page: result.page as PageInfo });
    } else {
      segments.push({ date });
    }
    if (result.page?.truncated) {
      truncated = true;
    }
  }

  collected.sort((a, b) => {
    const aTime = parseEventTime(a?.startsAt);
    const bTime = parseEventTime(b?.startsAt);
    if (aTime === null && bTime === null) return 0;
    if (aTime === null) return 1;
    if (bTime === null) return -1;
    return aTime - bTime;
  });

  const events = collected.slice(0, maxItems);
  if (events.length < collected.length) {
    truncated = true;
  }

  return {
    from: fromDate,
    to: toDate,
    windowHours,
    pageSize,
    maxPages,
    maxItems,
    totalEvents: events.length,
    truncated,
    segments,
    events,
  };
}

export async function searchEvents(input: EventsSearchInput) {
  const searchTerm = input.searchTerm.trim();
  if (!searchTerm) {
    throw new Error('searchTerm is required.');
  }
  const pageSize = parseNumber(input.pageSize, DEFAULT_PAGE_SIZE);
  const maxPages = parseNumber(input.maxPages, DEFAULT_MAX_PAGES);
  const maxItems = parseNumber(input.maxItems, pageSize * maxPages);

  const params: { searchTerm: string; utcOffset?: number } = { searchTerm };
  if (typeof input.utcOffset === 'number') params.utcOffset = Math.floor(input.utcOffset);

  const result = await callReadOperationParsed('searchCalendarEvents', params, {
    fields: input.fields,
    compact: input.compact,
    maxArrayLength: input.maxArrayLength,
    page: {
      enabled: true,
      size: pageSize,
      maxPages,
      maxItems,
    },
  });

  const events = result.data;
  return {
    searchTerm,
    utcOffset: typeof input.utcOffset === 'number' ? Math.floor(input.utcOffset) : undefined,
    pageSize,
    maxPages,
    totalEvents: events.length,
    truncated: result.page?.truncated ?? false,
    page: result.page as PageInfo | undefined,
    events,
  };
}

function buildDiscoveryParams(
  input: EventsDiscoverInput,
  pageSize: number,
  nextCursor?: string,
): Record<string, unknown> {
  const params: Record<string, unknown> = { n: pageSize };
  if (input.scope) params.scope = input.scope;
  if (input.categories?.length) params.categories = input.categories.join(',');
  if (input.tags?.length) params.tags = input.tags.join(',');
  if (input.featuredResults) params.featuredResults = input.featuredResults;
  if (input.nonFeaturedResults) params.nonFeaturedResults = input.nonFeaturedResults;
  if (input.personalizedResults) params.personalizedResults = input.personalizedResults;
  if (typeof input.minimumInterestCount === 'number') {
    params.minimumInterestCount = Math.floor(input.minimumInterestCount);
  }
  if (typeof input.minimumRemainingMinutes === 'number') {
    params.minimumRemainingMinutes = Math.floor(input.minimumRemainingMinutes);
  }
  if (typeof input.upcomingOffsetMinutes === 'number') {
    params.upcomingOffsetMinutes = Math.floor(input.upcomingOffsetMinutes);
  }
  if (nextCursor) params.nextCursor = nextCursor;
  return params;
}

export async function discoverEvents(input: EventsDiscoverInput) {
  const pageSize = parseNumber(input.pageSize, DEFAULT_PAGE_SIZE);
  const maxPages = parseNumber(input.maxPages, DEFAULT_MAX_PAGES);
  const maxItems = parseNumber(input.maxItems, pageSize * maxPages);
  const events: CalendarEventRecord[] = [];
  let nextCursor = input.nextCursor;
  let pages = 0;

  while (pages < maxPages && events.length < maxItems) {
    const result = await callReadOperationParsed(
      'discoverCalendarEvents',
      buildDiscoveryParams(input, pageSize, nextCursor),
    );
    pages += 1;
    events.push(...result.data.results);
    nextCursor = result.data.nextCursor;
    if (!nextCursor || result.data.results.length === 0) break;
  }

  const sliced = events.slice(0, maxItems);
  const clipped = events.length > sliced.length;
  if (clipped) nextCursor = undefined;
  const truncated = clipped || (Boolean(nextCursor) && (pages >= maxPages || events.length >= maxItems));
  return {
    scope: input.scope,
    pageSize,
    maxPages,
    maxItems,
    totalEvents: sliced.length,
    truncated,
    nextCursor,
    page: {
      pages,
      items: sliced.length,
      pageSize,
      nextCursor,
      truncated,
    },
    events: sliced,
  };
}

export function buildCalendarCreateRequest(
  input: CalendarEventCreateInput,
): CalendarEventCreateRequest {
  const parsed = CalendarEventCreateSchema.parse(input);
  const { groupId, ...request } = parsed;
  void groupId;
  return request;
}

export function buildCalendarUpdateRequest(
  input: CalendarEventUpdatePayload,
): CalendarEventUpdateRequest {
  const { groupId, calendarId, ...request } = input;
  void groupId;
  void calendarId;
  return request;
}

export async function createCalendarEvent(groupId: string, request: CalendarEventCreateRequest) {
  const result = await callWriteOperationParsed('createGroupCalendarEvent', { groupId }, request);
  invalidateGroupEventCaches(groupId);
  return result.data ?? null;
}

export async function updateCalendarEvent(
  groupId: string,
  calendarId: string,
  request: CalendarEventUpdateRequest,
) {
  const result = await callWriteOperationParsed(
    'updateGroupCalendarEvent',
    { groupId, calendarId },
    request,
  );
  invalidateGroupEventCaches(groupId);
  return result.data ?? null;
}

export async function deleteCalendarEvent(
  groupId: string,
  calendarId: string,
  targetKind: CalendarEventDeleteTargetKind,
) {
  const event = await getGroupCalendarEventOrThrow(groupId, calendarId);
  assertDeleteTargetKind(event, calendarId, targetKind);
  const result = await callWriteOperationParsed('deleteGroupCalendarEvent', {
    groupId,
    calendarId,
  });
  invalidateGroupEventCaches(groupId);
  return { event, result: result.data ?? null };
}

export async function followCalendarEvent(input: CalendarEventFollowInput) {
  const result = await callWriteOperationParsed(
    'followGroupCalendarEvent',
    { groupId: input.groupId, calendarId: input.calendarId },
    { isFollowing: input.isFollowing },
  );
  invalidateGroupEventCaches(input.groupId);
  return result.data ?? null;
}
