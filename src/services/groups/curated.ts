import { callReadOperationParsed, type ReadOperationData } from '../api/client.js';
import { buildCacheKey, cacheConfig, cacheManager } from '../cache.js';
import {
  toGroupInstanceSummary,
  toGroupMemberSummary,
  toGroupPostSummary,
  toGroupSummary,
  type GroupEventsListInput,
  type GroupEventsUpcomingInput,
  type GroupEventGetInput,
  type GroupInstanceSummary,
  type GroupMembersInput,
  type GroupPostsRecentInput,
  type GroupPostSummary,
  type GroupResolution,
  type GroupSearchInput,
  type GroupSummary,
} from '../../models/groups.js';
import {
  getMonthKeys,
  monthKeyToDateTime,
  parseEventTime,
  parseIsoDate,
  toMonthDateTime,
} from '../events/utils.js';
import type { CalendarEventRecord } from '../events/utils.js';

interface PageInfo {
  pages: number;
  items: number;
  pageSize: number;
  offsetStart: number;
  truncated: boolean;
}

const DEFAULT_GROUP_PAGE_SIZE = 50;
const DEFAULT_GROUP_MAX_PAGES = 10;
const DEFAULT_GROUP_MEMBER_PAGE_SIZE = 100;
const DEFAULT_GROUP_MEMBER_MAX_PAGES = 100;
const DEFAULT_GROUP_POSTS_PAGE_SIZE = 50;
const DEFAULT_GROUP_POSTS_MAX_PAGES = 10;
const DEFAULT_GROUP_EVENT_PAGE_SIZE = 50;
const DEFAULT_GROUP_EVENT_MAX_PAGES = 10;
type GroupRecord = ReadOperationData<'getGroup'>;
type GroupCalendarEvent = ReadOperationData<'getGroupCalendarEvent'>;
type GroupNextCalendarEvent = ReadOperationData<'getGroupNextCalendarEvent'>;

export async function searchGroups(
  input: GroupSearchInput,
): Promise<{
  groups: GroupSummary[];
  page?: PageInfo;
  truncated: boolean;
  stale: boolean;
  pageSize: number;
  maxPages: number;
  maxItems: number;
}> {
  const query = input.query.trim();
  const pageSize =
    typeof input.pageSize === 'number' ? Math.floor(input.pageSize) : DEFAULT_GROUP_PAGE_SIZE;
  const maxPages =
    typeof input.maxPages === 'number' ? Math.floor(input.maxPages) : DEFAULT_GROUP_MAX_PAGES;
  const maxItems =
    typeof input.maxItems === 'number' ? Math.floor(input.maxItems) : pageSize * maxPages;

  const cacheKey = buildCacheKey('groups:search', { query, pageSize, maxPages, maxItems });
  const tags = ['groups', `groups:search:${query.toLowerCase()}`];

  const { value, stale } = await cacheManager.getOrSetStale(
    cacheKey,
    cacheConfig.groupsTtlMs,
    cacheConfig.groupsStaleTtlMs,
    tags,
    async () => {
      const result = await callReadOperationParsed(
        'searchGroups',
        { query },
        {
          page: {
            enabled: true,
            size: pageSize,
            maxPages,
            maxItems,
          },
        },
      );
      const groups = result.data
        .map(toGroupSummary)
        .filter((group): group is GroupSummary => Boolean(group));
      return {
        groups,
        page: result.page as PageInfo | undefined,
        truncated: result.page?.truncated ?? false,
      };
    },
  );

  return {
    groups: value.groups,
    page: value.page,
    truncated: value.truncated,
    stale,
    pageSize,
    maxPages,
    maxItems,
  };
}

export async function resolveGroupId(
  input: { groupId?: string; shortCode?: string } | undefined,
): Promise<GroupResolution> {
  if (input?.groupId) {
    return { ok: true, groupId: input.groupId, resolvedBy: 'id' };
  }
  const shortCode = typeof input?.shortCode === 'string' ? input.shortCode.trim() : '';
  if (!shortCode) {
    return {
      ok: false,
      reason: 'Provide groupId or shortCode.',
      status: 'not_found',
      nextSteps: ['vrchat_groups_search'],
    };
  }
  const results = await searchGroups({ query: shortCode, pageSize: 25, maxPages: 2, maxItems: 50 });
  const match = results.groups.find(
    (group) => group.shortCode && group.shortCode.toLowerCase() === shortCode.toLowerCase(),
  );
  if (!match) {
    return {
      ok: false,
      reason: `No group found with shortCode "${shortCode}".`,
      status: 'not_found',
      nextSteps: ['vrchat_groups_search'],
    };
  }
  return { ok: true, groupId: match.groupId, resolvedBy: 'shortCode' };
}

export async function getGroupProfile(
  groupId: string,
): Promise<{ group: GroupRecord | null; stale: boolean }> {
  const cacheKey = buildCacheKey('groups:profile', { groupId });
  const tags = ['groups', `groups:${groupId}`];
  const { value, stale } = await cacheManager.getOrSetStale(
    cacheKey,
    cacheConfig.groupsTtlMs,
    cacheConfig.groupsStaleTtlMs,
    tags,
    async () => {
      const result = await callReadOperationParsed('getGroup', { groupId });
      const group = result.data ?? null;
      return { group };
    },
  );
  return { group: value.group, stale };
}

export async function listGroupMembers(
  groupId: string,
  input: GroupMembersInput,
): Promise<{
  members: { userId: string; displayName?: string }[];
  page?: PageInfo;
  truncated: boolean;
  stale: boolean;
}> {
  const pageSize =
    typeof input.pageSize === 'number' ? Math.floor(input.pageSize) : DEFAULT_GROUP_MEMBER_PAGE_SIZE;
  const maxPages =
    typeof input.maxPages === 'number' ? Math.floor(input.maxPages) : DEFAULT_GROUP_MEMBER_MAX_PAGES;
  const maxItems =
    typeof input.maxItems === 'number' ? Math.floor(input.maxItems) : pageSize * maxPages;
  const offset = typeof input.offset === 'number' ? Math.floor(input.offset) : 0;
  const roleId = typeof input.roleId === 'string' ? input.roleId : undefined;
  const sort = typeof input.sort === 'string' ? input.sort : undefined;

  const cacheKey = buildCacheKey('groups:members', {
    groupId,
    roleId,
    sort,
    pageSize,
    maxPages,
    maxItems,
    offset,
  });
  const tags = ['groups', `groups:${groupId}`];
  const { value, stale } = await cacheManager.getOrSetStale(
    cacheKey,
    cacheConfig.groupsTtlMs,
    cacheConfig.groupsStaleTtlMs,
    tags,
    async () => {
      const result = await callReadOperationParsed(
        'getGroupMembers',
        { groupId, roleId, sort, offset },
        {
          page: {
            enabled: true,
            size: pageSize,
            maxPages,
            maxItems,
          },
        },
      );
      const members = result.data
        .map(toGroupMemberSummary)
        .filter(
          (member): member is { userId: string; displayName?: string } =>
            Boolean(member),
        );
      const byId = new Map<string, { userId: string; displayName?: string }>();
      for (const member of members) {
        if (!byId.has(member.userId)) byId.set(member.userId, member);
      }
      return {
        members: [...byId.values()],
        page: result.page as PageInfo | undefined,
        truncated: result.page?.truncated ?? false,
      };
    },
  );

  return {
    members: value.members,
    page: value.page,
    truncated: value.truncated,
    stale,
  };
}

export async function listGroupPosts(
  groupId: string,
  input: GroupPostsRecentInput,
): Promise<{
  posts: GroupPostSummary[];
  page?: PageInfo;
  truncated: boolean;
  stale: boolean;
  pageSize: number;
  maxPages: number;
}> {
  const pageSize =
    typeof input.pageSize === 'number' ? Math.floor(input.pageSize) : DEFAULT_GROUP_POSTS_PAGE_SIZE;
  const maxPages =
    typeof input.maxPages === 'number' ? Math.floor(input.maxPages) : DEFAULT_GROUP_POSTS_MAX_PAGES;
  const maxItems =
    typeof input.maxItems === 'number' ? Math.floor(input.maxItems) : pageSize * maxPages;
  const publicOnly = input.publicOnly === true;

  const cacheKey = buildCacheKey('groups:posts', { groupId, pageSize, maxPages, maxItems, publicOnly });
  const tags = ['groups', `groups:${groupId}`];
  const { value, stale } = await cacheManager.getOrSetStale(
    cacheKey,
    cacheConfig.groupsTtlMs,
    cacheConfig.groupsStaleTtlMs,
    tags,
    async () => {
      const result = await callReadOperationParsed(
        'getGroupPosts',
        { groupId, publicOnly },
        {
          page: {
            enabled: true,
            size: pageSize,
            maxPages,
            maxItems,
          },
        },
      );
      const posts = result.data
        .map(toGroupPostSummary)
        .filter(
          (post): post is GroupPostSummary => Boolean(post),
        );
      return {
        posts,
        page: result.page as PageInfo | undefined,
        truncated: result.page?.truncated ?? false,
      };
    },
  );

  return {
    posts: value.posts,
    page: value.page,
    truncated: value.truncated,
    stale,
    pageSize,
    maxPages,
  };
}

export async function listGroupEvents(
  groupId: string,
  input: GroupEventsListInput,
): Promise<{
  events: CalendarEventRecord[];
  page?: PageInfo;
  truncated: boolean;
  stale: boolean;
  pageSize: number;
  maxPages: number;
  maxItems: number;
  date?: string;
}> {
  const dateInput = typeof input.date === 'string' ? input.date : undefined;
  const parsedDate = dateInput ? parseIsoDate(dateInput) : null;
  if (dateInput && !parsedDate) {
    throw new Error('date must be a valid ISO date/time string.');
  }
  const monthDate = parsedDate ? toMonthDateTime(parsedDate) : undefined;
  const pageSize =
    typeof input.pageSize === 'number' ? Math.floor(input.pageSize) : DEFAULT_GROUP_EVENT_PAGE_SIZE;
  const maxPages =
    typeof input.maxPages === 'number' ? Math.floor(input.maxPages) : DEFAULT_GROUP_EVENT_MAX_PAGES;
  const maxItems =
    typeof input.maxItems === 'number' ? Math.floor(input.maxItems) : pageSize * maxPages;

  const cacheKey = buildCacheKey('groups:events:list', {
    groupId,
    date: dateInput ?? '',
    pageSize,
    maxPages,
    maxItems,
  });
  const tags = ['groups', `groups:${groupId}`];
  const { value, stale } = await cacheManager.getOrSetStale(
    cacheKey,
    cacheConfig.groupsTtlMs,
    cacheConfig.groupsStaleTtlMs,
    tags,
    async () => {
      const result = await callReadOperationParsed(
        'getGroupCalendarEvents',
        { groupId, date: monthDate },
        {
          page: {
            enabled: true,
            size: pageSize,
            maxPages,
            maxItems,
          },
        },
      );
      const events = result.data;
      return {
        events,
        page: result.page as PageInfo | undefined,
        truncated: result.page?.truncated ?? false,
      };
    },
  );

  return {
    events: value.events,
    page: value.page,
    truncated: value.truncated,
    stale,
    pageSize,
    maxPages,
    maxItems,
    date: dateInput,
  };
}

export async function getGroupEvent(
  groupId: string,
  input: GroupEventGetInput,
): Promise<{ event: GroupCalendarEvent | null; stale: boolean }> {
  const calendarId = typeof input.calendarId === 'string' ? input.calendarId.trim() : '';
  if (!calendarId) {
    throw new Error('calendarId is required.');
  }
  const cacheKey = buildCacheKey('groups:event', { groupId, calendarId });
  const tags = ['groups', `groups:${groupId}`];
  const { value, stale } = await cacheManager.getOrSetStale(
    cacheKey,
    cacheConfig.groupsTtlMs,
    cacheConfig.groupsStaleTtlMs,
    tags,
    async () => {
      const result = await callReadOperationParsed(
        'getGroupCalendarEvent',
        { groupId, calendarId },
        {},
      );
      const event = result.data ?? null;
      return { event };
    },
  );

  return { event: value.event ?? null, stale };
}

export async function getGroupNextEvent(
  groupId: string,
): Promise<{ event: GroupNextCalendarEvent | null; stale: boolean }> {
  const cacheKey = buildCacheKey('groups:event:next', { groupId });
  const tags = ['groups', `groups:${groupId}`];
  const { value, stale } = await cacheManager.getOrSetStale(
    cacheKey,
    cacheConfig.groupsTtlMs,
    cacheConfig.groupsStaleTtlMs,
    tags,
    async () => {
      const result = await callReadOperationParsed('getGroupNextCalendarEvent', { groupId }, {});
      const event = result.data ?? null;
      return { event };
    },
  );

  return { event: value.event ?? null, stale };
}

export async function listGroupEventsUpcoming(
  groupId: string,
  input: GroupEventsUpcomingInput,
): Promise<{
  events: CalendarEventRecord[];
  truncated: boolean;
  stale: boolean;
  segments: { date: string; page?: PageInfo }[];
  from: Date;
  to: Date;
  windowHours: number;
  pageSize: number;
  maxPages: number;
  maxItems: number;
}> {
  const fromInput = parseIsoDate(input.from);
  if (input.from && !fromInput) {
    throw new Error('from must be a valid ISO date/time string.');
  }
  const fromDate = fromInput ?? new Date();
  const windowHours =
    typeof input.windowHours === 'number' ? Math.floor(input.windowHours) : 168;
  const toDate = new Date(fromDate.getTime() + windowHours * 60 * 60 * 1000);
  const pageSize =
    typeof input.pageSize === 'number' ? Math.floor(input.pageSize) : DEFAULT_GROUP_EVENT_PAGE_SIZE;
  const maxPages =
    typeof input.maxPages === 'number' ? Math.floor(input.maxPages) : DEFAULT_GROUP_EVENT_MAX_PAGES;
  const maxItems =
    typeof input.maxItems === 'number' ? Math.floor(input.maxItems) : pageSize * maxPages;

  const cacheKey = buildCacheKey('groups:events', {
    groupId,
    from: fromDate.toISOString(),
    windowHours,
    pageSize,
    maxPages,
    maxItems,
  });
  const tags = ['groups', `groups:${groupId}`];
  const { value, stale } = await cacheManager.getOrSetStale(
    cacheKey,
    cacheConfig.groupsTtlMs,
    cacheConfig.groupsStaleTtlMs,
    tags,
    async () => {
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
          'getGroupCalendarEvents',
          { groupId, date: monthKeyToDateTime(date) },
          {
            page: {
              enabled: true,
              size: pageSize,
              maxPages,
              maxItems: remaining,
            },
          },
        );
        const data = result.data;
        const filtered = data.filter((event) => {
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

      return { events, truncated, segments };
    },
  );

  return {
    events: value.events,
    truncated: value.truncated,
    stale,
    segments: value.segments,
    from: fromDate,
    to: toDate,
    windowHours,
    pageSize,
    maxPages,
    maxItems,
  };
}

export async function getGroupInstancesOverview(
  groupId: string,
  maxInstances: number,
): Promise<{ instances: GroupInstanceSummary[]; stale: boolean; totalMembers: number }> {
  const cacheKey = buildCacheKey('groups:instances', { groupId });
  const tags = ['groups', `groups:${groupId}`];
  const { value, stale } = await cacheManager.getOrSetStale(
    cacheKey,
    cacheConfig.groupsTtlMs,
    cacheConfig.groupsStaleTtlMs,
    tags,
    async () => {
      const result = await callReadOperationParsed('getGroupInstances', { groupId });
      const instances = result.data
        .map(toGroupInstanceSummary)
        .filter(
          (instance): instance is GroupInstanceSummary => Boolean(instance),
        );
      return { instances };
    },
  );

  const instances = value.instances.slice(0, Math.max(1, maxInstances));
  const totalMembers = instances.reduce((sum, entry) => sum + entry.memberCount, 0);
  return { instances, stale, totalMembers };
}
