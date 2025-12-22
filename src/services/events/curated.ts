import { callOperation } from '../../core/client.js';
import { callReadOperation } from '../../core/readTools.js';
import type {
  CalendarEventCreateInput,
  CalendarEventUpdateInput,
  EventsSearchInput,
  EventsUpcomingInput,
} from '../../models/events.js';
import { getMonthKeys, parseEventTime, parseIsoDate } from './utils.js';

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

function parseNumber(value: unknown, fallback: number): number {
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
  const collected: unknown[] = [];
  const seenIds = new Set<string>();
  let truncated = false;

  for (const date of dateKeys) {
    const remaining = maxItems - collected.length;
    if (remaining <= 0) {
      truncated = true;
      break;
    }

    const result = await callReadOperation(
      'getCalendarEvents',
      { date },
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

    const batch = Array.isArray(result.data) ? result.data : [];
    const filtered = batch.filter((event) => {
      if (!event || typeof event !== 'object') return false;
      const startsAt = (event as Record<string, unknown>).startsAt;
      const ts = parseEventTime(startsAt);
      if (ts === null) return false;
      return ts >= fromDate.getTime() && ts < toDate.getTime();
    });
    for (const event of filtered) {
      if (event && typeof event === 'object') {
        const id = (event as Record<string, unknown>).id;
        if (typeof id === 'string') {
          if (seenIds.has(id)) continue;
          seenIds.add(id);
        }
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
    const aTime = parseEventTime((a as Record<string, unknown>)?.startsAt);
    const bTime = parseEventTime((b as Record<string, unknown>)?.startsAt);
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

  const params: Record<string, unknown> = { searchTerm };
  if (typeof input.utcOffset === 'number') params.utcOffset = Math.floor(input.utcOffset);

  const result = await callReadOperation('searchCalendarEvents', params, {
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

  const events = Array.isArray(result.data) ? result.data : [];
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

export function buildCalendarCreateRequest(input: CalendarEventCreateInput) {
  return {
    accessType: input.accessType ?? 'group',
    category: input.category,
    description: input.description,
    endsAt: input.endsAt,
    sendCreationNotification: input.sendCreationNotification ?? false,
    startsAt: input.startsAt,
    title: input.title,
    closeInstanceAfterEndMinutes: input.closeInstanceAfterEndMinutes,
    featured: input.featured,
    guestEarlyJoinMinutes: input.guestEarlyJoinMinutes,
    hostEarlyJoinMinutes: input.hostEarlyJoinMinutes,
    imageId: input.imageId,
    isDraft: input.isDraft,
    languages: input.languages,
    parentId: input.parentId,
    platforms: input.platforms,
    roleIds: input.roleIds,
    tags: input.tags,
    usesInstanceOverflow: input.usesInstanceOverflow,
  };
}

export function buildCalendarUpdateRequest(input: CalendarEventUpdateInput) {
  return {
    accessType: input.accessType,
    category: input.category,
    description: input.description,
    endsAt: input.endsAt,
    sendCreationNotification: input.sendCreationNotification,
    startsAt: input.startsAt,
    title: input.title,
    closeInstanceAfterEndMinutes: input.closeInstanceAfterEndMinutes,
    featured: input.featured,
    guestEarlyJoinMinutes: input.guestEarlyJoinMinutes,
    hostEarlyJoinMinutes: input.hostEarlyJoinMinutes,
    imageId: input.imageId,
    isDraft: input.isDraft,
    languages: input.languages,
    parentId: input.parentId,
    platforms: input.platforms,
    roleIds: input.roleIds,
    tags: input.tags,
    usesInstanceOverflow: input.usesInstanceOverflow,
  };
}

export async function createCalendarEvent(groupId: string, request: Record<string, unknown>) {
  const result = await callOperation({
    operationId: 'createGroupCalendarEvent',
    params: { groupId },
    body: request,
  });
  return result.data ?? null;
}

export async function updateCalendarEvent(
  groupId: string,
  calendarId: string,
  request: Record<string, unknown>,
) {
  const result = await callOperation({
    operationId: 'updateGroupCalendarEvent',
    params: { groupId, calendarId },
    body: request,
  });
  return result.data ?? null;
}

export async function deleteCalendarEvent(groupId: string, calendarId: string) {
  const result = await callOperation({
    operationId: 'deleteGroupCalendarEvent',
    params: { groupId, calendarId },
  });
  return result.data ?? null;
}
