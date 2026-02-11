import { z } from 'zod';
import { buildCacheKey, cacheManager } from '../services/cache.js';
import type { VrctlCategory, VrctlTag } from './timelineBootstrap.js';
import { createVrctlClient, type VrctlClient } from './client.js';
import { vrctlAuthManager } from './auth.js';
import { getConfig } from '../config/index.js';
import { vrctlMetadataService, type VrctlMetadataService } from './metadata.js';

const RangeSchema = z
  .object({
    firstLoadedDay: z.string().min(1),
    lastLoadedDay: z.string().min(1),
  })
  .strict();

const OrganizerSchema = z
  .object({
    id: z.number().int(),
    name: z.string(),
    slug: z.string().optional(),
    shortCode: z.string().optional(),
    vrcGroup: z.string().optional(),
    discordInv: z.string().optional(),
  })
  .passthrough();

const PerformerSchema = z
  .object({
    id: z.number().int(),
    name: z.string(),
    slug: z.string().optional(),
  })
  .passthrough();

const SlotSchema = z
  .object({
    id: z.string(),
    start: z.number().int().optional(),
    duration: z.number().int().optional(),
    performers: z.array(z.number().int()).optional(),
    order: z.number().int().optional(),
    flag: z.string().optional(),
  })
  .passthrough();

const EventSchema = z
  .object({
    id: z.number().int(),
    name: z.string(),
    description: z.string().optional().nullable(),
    category: z.number().int().optional().nullable(),
    tags: z.array(z.number().int()).optional(),
    organizers: z.array(z.number().int()).optional(),
    hostOrganizer: z.number().int().optional().nullable(),
    start: z.number().int().optional(),
    end: z.number().int().optional(),
    duration: z.number().int().optional(),
    poster: z.string().optional().nullable(),
    urls: z.record(z.string(), z.unknown()).optional(),
    isHighlighted: z.boolean().optional(),
    promoted: z.union([z.boolean(), z.number().int()]).optional(),
    eventSlots: z.array(SlotSchema).optional(),
    showSlots: z.array(SlotSchema).optional(),
    extensions: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

const EventsFeedResponseSchema = z
  .object({
    lastUpdates: z.unknown().optional(),
    live: z.unknown().optional(),
    range: RangeSchema,
    eventData: z
      .object({
        events: z.array(EventSchema),
        organizers: z.array(OrganizerSchema).optional().default([]),
        performers: z.array(PerformerSchema).optional().default([]),
      })
      .strict(),
  })
  .passthrough();

const EventDatasetResponseSchema = z
  .object({
    events: z.array(EventSchema),
    organizers: z.array(OrganizerSchema).optional().default([]),
    performers: z.array(PerformerSchema).optional().default([]),
  })
  .passthrough();

export interface VrctlOrganizerSummary {
  name: string;
  slug?: string;
  shortCode?: string;
  vrcGroupUrl?: string;
  vrchatGroupId?: string;
}

export interface VrctlEventSummary {
  eventId: number;
  name: string;
  startEpoch?: number;
  startIso?: string;
  endEpoch?: number;
  endIso?: string;
  durationSec?: number;
  eventUrl: string;
  posterUrl?: string;
  categoryId?: number | null;
  category?: string;
  tagIds: number[];
  tags?: string[];
  organizers: VrctlOrganizerSummary[];
}

export interface VrctlEventSlot {
  slotId: string;
  startEpoch?: number;
  startIso?: string;
  durationSec?: number;
  order?: number;
  flag?: string;
  performers: { performerId: number; name: string }[];
}

export interface VrctlEventDetail extends VrctlEventSummary {
  description?: string | null;
  urls?: Record<string, unknown>;
  isHighlighted?: boolean;
  promoted?: boolean;
  eventSlots: VrctlEventSlot[];
}

export interface VrctlEventsCurrentOptions {
  daysBack?: number;
  daysForward?: number;
  includeHidden?: boolean;
  maxItems?: number;
}

export interface VrctlEventsCurrentResult {
  requested: {
    daysBack: number;
    daysForward: number;
    includeHidden: boolean;
    maxItems: number;
  };
  auth: { loggedIn: boolean | null; verified: boolean; hasSessionCookie: boolean };
  range: { firstLoadedDay: string; lastLoadedDay: string };
  totalEvents: number;
  returnedEvents: number;
  filteredHiddenEvents: number;
  truncated: boolean;
  events: VrctlEventSummary[];
}

export interface VrctlEventGetOptions {
  includeHidden?: boolean;
}

export interface VrctlEventGetResult {
  requested: { includeHidden: boolean };
  auth: { loggedIn: boolean | null; verified: boolean; hasSessionCookie: boolean };
  event: VrctlEventDetail;
}

function epochToIso(epochSec?: number): string | undefined {
  if (typeof epochSec !== 'number' || !Number.isFinite(epochSec)) return undefined;
  return new Date(epochSec * 1000).toISOString();
}

function addDays(date: string, deltaDays: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return date;
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

function extractVrchatGroupId(vrcGroupUrl?: string): string | undefined {
  if (!vrcGroupUrl) return undefined;
  const match = /(grp_[A-Za-z0-9-]+)/.exec(vrcGroupUrl);
  return match ? match[1] : undefined;
}

function buildEventUrl(siteUrl: string, eventId: number): string {
  const url = new URL(`/event/${eventId}`, siteUrl);
  return url.toString();
}

function organizerSummary(org: z.infer<typeof OrganizerSchema>): VrctlOrganizerSummary {
  const vrcGroupUrl = org.vrcGroup;
  return {
    name: org.name,
    slug: org.slug,
    shortCode: org.shortCode,
    vrcGroupUrl,
    vrchatGroupId: extractVrchatGroupId(vrcGroupUrl),
  };
}

function buildTagMaps(tags: VrctlTag[] | undefined) {
  const tagsById = new Map<number, VrctlTag>();
  const hiddenEventTagIds = new Set<number>();
  const hiddenTagIds = new Set<number>();
  for (const tag of tags ?? []) {
    tagsById.set(tag.id, tag);
    if (tag.eventsHiddenForNotLoggedIn) hiddenEventTagIds.add(tag.id);
    if (tag.tagHiddenForNotLoggedIn) hiddenTagIds.add(tag.id);
  }
  // Fallback: if we fail to load metadata, default to hiding NSFW and its label.
  if (tagsById.size === 0) {
    hiddenEventTagIds.add(1);
    hiddenTagIds.add(1);
    hiddenTagIds.add(6);
  }
  return { tagsById, hiddenEventTagIds, hiddenTagIds };
}

function buildCategoryMap(categories: VrctlCategory[] | undefined) {
  const categoriesById = new Map<number, VrctlCategory>();
  for (const c of categories ?? []) {
    categoriesById.set(c.id, c);
  }
  return { categoriesById };
}

type EventsFeedChunk = z.infer<typeof EventsFeedResponseSchema>;
type EventRecord = z.infer<typeof EventSchema>;
type OrganizerRecord = z.infer<typeof OrganizerSchema>;
type PerformerRecord = z.infer<typeof PerformerSchema>;
type SlotRecord = z.infer<typeof SlotSchema>;

function clampInt(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeCurrentOptions(options: VrctlEventsCurrentOptions) {
  const daysBack = clampInt(options.daysBack ?? 0, 0, 30);
  const daysForward = clampInt(options.daysForward ?? 0, 0, 30);
  const maxItems = clampInt(options.maxItems ?? 200, 1, 500);
  const includeHidden = Boolean(options.includeHidden);
  return { daysBack, daysForward, maxItems, includeHidden };
}

function resolveTagLabels(params: {
  tagIds: number[];
  isLoggedIn: boolean;
  hiddenTagIds: Set<number>;
  tagsById: Map<number, VrctlTag>;
}): string[] {
  const visibleIds = params.isLoggedIn
    ? params.tagIds
    : params.tagIds.filter((id) => !params.hiddenTagIds.has(id));
  return visibleIds
    .map((id) => params.tagsById.get(id)?.name)
    .filter((name): name is string => Boolean(name));
}

function resolveOrganizerSummaries(
  organizerIds: number[] | undefined,
  organizersById: Map<number, OrganizerRecord>
): VrctlOrganizerSummary[] {
  return (organizerIds ?? [])
    .map((id) => organizersById.get(id))
    .filter((o): o is OrganizerRecord => Boolean(o))
    .map(organizerSummary);
}

function mergeEventsFeedChunks(chunks: EventsFeedChunk[]): {
  organizersById: Map<number, OrganizerRecord>;
  performersById: Map<number, PerformerRecord>;
  events: EventRecord[];
} {
  const organizersById = new Map<number, OrganizerRecord>();
  const performersById = new Map<number, PerformerRecord>();
  const eventsById = new Map<number, EventRecord>();

  for (const chunk of chunks) {
    for (const org of chunk.eventData.organizers) {
      organizersById.set(org.id, org);
    }
    for (const perf of chunk.eventData.performers) {
      performersById.set(perf.id, perf);
    }
    for (const event of chunk.eventData.events) {
      eventsById.set(event.id, event);
    }
  }

  const events = [...eventsById.values()];
  events.sort((a, b) => (a.start ?? 0) - (b.start ?? 0));
  return { organizersById, performersById, events };
}

function filterEventsByVisibility(params: {
  events: EventRecord[];
  hiddenEventTagIds: Set<number>;
  includeHidden: boolean;
  isLoggedIn: boolean;
}): { events: EventRecord[]; filteredHiddenEvents: number } {
  if (params.isLoggedIn || params.includeHidden) {
    return { events: params.events, filteredHiddenEvents: 0 };
  }

  const visible: EventRecord[] = [];
  let filteredHiddenEvents = 0;
  for (const e of params.events) {
    const tagIds = e.tags ?? [];
    const hidden = tagIds.some((id) => params.hiddenEventTagIds.has(id));
    if (hidden) {
      filteredHiddenEvents += 1;
      continue;
    }
    visible.push(e);
  }
  return { events: visible, filteredHiddenEvents };
}

function buildIdMap<T extends { id: number }>(items: T[]): Map<number, T> {
  const map = new Map<number, T>();
  for (const item of items) {
    map.set(item.id, item);
  }
  return map;
}

function resolveEventSlots(
  eventSlots: SlotRecord[] | undefined,
  performersById: Map<number, PerformerRecord>
): VrctlEventSlot[] {
  return (eventSlots ?? []).map((slot) => {
    const performerIds = slot.performers ?? [];
    const performers = performerIds
      .map((id) => performersById.get(id))
      .filter((p): p is PerformerRecord => Boolean(p))
      .map((p) => ({ performerId: p.id, name: p.name }));
    return {
      slotId: slot.id,
      startEpoch: slot.start,
      startIso: epochToIso(slot.start),
      durationSec: slot.duration,
      order: slot.order,
      flag: slot.flag,
      performers,
    };
  });
}

function isHiddenByTag(tagIds: number[], hiddenEventTagIds: Set<number>): boolean {
  return tagIds.some((id) => hiddenEventTagIds.has(id));
}

function toEventSummary(params: {
  event: EventRecord;
  siteUrl: string;
  isLoggedIn: boolean;
  categoriesById: Map<number, VrctlCategory>;
  tagsById: Map<number, VrctlTag>;
  hiddenTagIds: Set<number>;
  organizersById: Map<number, OrganizerRecord>;
}): VrctlEventSummary {
  const categoryId = params.event.category ?? null;
  const category = categoryId ? params.categoriesById.get(categoryId)?.name : undefined;

  const tagIds = params.event.tags ?? [];
  const tags = resolveTagLabels({
    tagIds,
    isLoggedIn: params.isLoggedIn,
    hiddenTagIds: params.hiddenTagIds,
    tagsById: params.tagsById,
  });

  const organizers = resolveOrganizerSummaries(params.event.organizers, params.organizersById);

  return {
    eventId: params.event.id,
    name: params.event.name,
    startEpoch: params.event.start,
    startIso: epochToIso(params.event.start),
    endEpoch: params.event.end,
    endIso: epochToIso(params.event.end),
    durationSec: params.event.duration,
    eventUrl: buildEventUrl(params.siteUrl, params.event.id),
    posterUrl: params.event.poster ?? undefined,
    categoryId,
    category,
    tagIds,
    tags: tags.length ? tags : undefined,
    organizers,
  };
}

function toEventDetail(params: {
  event: EventRecord;
  siteUrl: string;
  isLoggedIn: boolean;
  categoriesById: Map<number, VrctlCategory>;
  tagsById: Map<number, VrctlTag>;
  hiddenTagIds: Set<number>;
  organizersById: Map<number, OrganizerRecord>;
  performersById: Map<number, PerformerRecord>;
}): VrctlEventDetail {
  const summary = toEventSummary({
    event: params.event,
    siteUrl: params.siteUrl,
    isLoggedIn: params.isLoggedIn,
    categoriesById: params.categoriesById,
    tagsById: params.tagsById,
    hiddenTagIds: params.hiddenTagIds,
    organizersById: params.organizersById,
  });

  const promoted =
    typeof params.event.promoted === 'boolean'
      ? params.event.promoted
      : Boolean(params.event.promoted);

  return {
    ...summary,
    description: params.event.description,
    urls: params.event.urls,
    isHighlighted: params.event.isHighlighted,
    promoted,
    eventSlots: resolveEventSlots(params.event.eventSlots, params.performersById),
  };
}

export interface VrctlEventsServiceDeps {
  client?: Pick<VrctlClient, 'getSiteHtml' | 'getApiJson'>;
  metadata?: Pick<VrctlMetadataService, 'getBootstrapCached'>;
}

export class VrctlEventsService {
  private client: Pick<VrctlClient, 'getSiteHtml' | 'getApiJson'>;
  private siteUrl: string;
  private metadata: Pick<VrctlMetadataService, 'getBootstrapCached'>;

  constructor(deps: VrctlEventsServiceDeps = {}) {
    this.client = deps.client ?? createVrctlClient();
    this.siteUrl = getConfig().vrctl.siteUrl;
    this.metadata = deps.metadata ?? vrctlMetadataService;
  }

  private assertVrctlEnabled(): void {
    const config = getConfig();
    if (!config.vrctl.enabled) {
      throw new Error(
        'vrc.tl tools are disabled. Set vrctl.enabled=true (or VRCHAT_MCP_VRCTL_ENABLED=1).'
      );
    }
  }

  private async getAuthAndMetadata(includeHidden: boolean) {
    const sessionStatus = vrctlAuthManager.getStatus();
    const bootstrap = await this.metadata.getBootstrapCached();
    const isLoggedIn = bootstrap.loggedIn === true;

    if (includeHidden && !isLoggedIn) {
      throw new Error('includeHidden requires vrc.tl login. Use vrctl_auth_begin and try again.');
    }

    const { categoriesById } = buildCategoryMap(bootstrap.categories);
    const { tagsById, hiddenEventTagIds, hiddenTagIds } = buildTagMaps(bootstrap.tags);
    return {
      sessionStatus,
      bootstrap,
      isLoggedIn,
      categoriesById,
      tagsById,
      hiddenEventTagIds,
      hiddenTagIds,
    };
  }

  private async pageEventChunks(
    base: EventsFeedChunk,
    daysBack: number,
    daysForward: number
  ): Promise<{
    chunks: EventsFeedChunk[];
    range: { firstLoadedDay: string; lastLoadedDay: string };
  }> {
    let firstLoadedDay = base.range.firstLoadedDay;
    let lastLoadedDay = base.range.lastLoadedDay;
    const chunks: EventsFeedChunk[] = [base];

    if (daysBack > 0) {
      const target = addDays(firstLoadedDay, -daysBack);
      let safety = 0;
      while (firstLoadedDay > target && safety < 20) {
        const before = addDays(firstLoadedDay, -1);
        const chunk = await this.getEventsChunk({ before });
        chunks.unshift(chunk);
        firstLoadedDay = chunk.range.firstLoadedDay;
        safety += 1;
      }
    }

    if (daysForward > 0) {
      const target = addDays(lastLoadedDay, daysForward);
      let safety = 0;
      while (lastLoadedDay < target && safety < 20) {
        const after = addDays(lastLoadedDay, 1);
        const chunk = await this.getEventsChunk({ after });
        chunks.push(chunk);
        lastLoadedDay = chunk.range.lastLoadedDay;
        safety += 1;
      }
    }

    return { chunks, range: { firstLoadedDay, lastLoadedDay } };
  }

  private async getEventsChunk(params: { before?: string; after?: string }) {
    const hasSessionCookie = vrctlAuthManager.getStatus().hasSessionCookie;
    const cacheKey = buildCacheKey('vrctl:events:chunk', {
      before: params.before,
      after: params.after,
      hasSessionCookie,
    });
    const ttlMs = 15_000;

    return await cacheManager.getOrSet(cacheKey, ttlMs, ['vrctl:events'], async () => {
      const data = await this.client.getApiJson('/events', {
        before: params.before,
        after: params.after,
      });
      return EventsFeedResponseSchema.parse(data);
    });
  }

  async listCurrentEvents(
    options: VrctlEventsCurrentOptions = {}
  ): Promise<VrctlEventsCurrentResult> {
    this.assertVrctlEnabled();

    const { daysBack, daysForward, maxItems, includeHidden } = normalizeCurrentOptions(options);
    const ctx = await this.getAuthAndMetadata(includeHidden);

    const base = await this.getEventsChunk({});
    const paged = await this.pageEventChunks(base, daysBack, daysForward);
    const merged = mergeEventsFeedChunks(paged.chunks);

    const visible = filterEventsByVisibility({
      events: merged.events,
      hiddenEventTagIds: ctx.hiddenEventTagIds,
      includeHidden,
      isLoggedIn: ctx.isLoggedIn,
    });

    const truncated = visible.events.length > maxItems;
    const picked = visible.events.slice(0, maxItems);
    const summaries = picked.map((event) =>
      toEventSummary({
        event,
        siteUrl: this.siteUrl,
        isLoggedIn: ctx.isLoggedIn,
        categoriesById: ctx.categoriesById,
        tagsById: ctx.tagsById,
        hiddenTagIds: ctx.hiddenTagIds,
        organizersById: merged.organizersById,
      })
    );

    return {
      requested: { daysBack, daysForward, includeHidden, maxItems },
      auth: {
        loggedIn: ctx.bootstrap.loggedIn,
        verified: ctx.bootstrap.loggedIn !== null,
        hasSessionCookie: ctx.sessionStatus.hasSessionCookie,
      },
      range: paged.range,
      totalEvents: merged.events.length,
      returnedEvents: summaries.length,
      filteredHiddenEvents: visible.filteredHiddenEvents,
      truncated,
      events: summaries,
    };
  }

  async getEventById(
    eventId: number,
    options: VrctlEventGetOptions = {}
  ): Promise<VrctlEventGetResult> {
    this.assertVrctlEnabled();

    const includeHidden = Boolean(options.includeHidden);
    const ctx = await this.getAuthAndMetadata(includeHidden);

    const data = await this.client.getApiJson(`/events/${eventId}`);
    const dataset = EventDatasetResponseSchema.parse(data);
    const event = dataset.events[0];
    if (!event) throw new Error(`Event not found: ${eventId}`);

    const tagIds = event.tags ?? [];
    if (isHiddenByTag(tagIds, ctx.hiddenEventTagIds) && !ctx.isLoggedIn && !includeHidden) {
      throw new Error(
        'Event is hidden on vrc.tl unless logged in. Use vrctl_auth_begin and try again.'
      );
    }

    const organizersById = buildIdMap(dataset.organizers);
    const performersById = buildIdMap(dataset.performers);
    const detail = toEventDetail({
      event,
      siteUrl: this.siteUrl,
      isLoggedIn: ctx.isLoggedIn,
      categoriesById: ctx.categoriesById,
      tagsById: ctx.tagsById,
      hiddenTagIds: ctx.hiddenTagIds,
      organizersById,
      performersById,
    });

    return {
      requested: { includeHidden },
      auth: {
        loggedIn: ctx.bootstrap.loggedIn,
        verified: ctx.bootstrap.loggedIn !== null,
        hasSessionCookie: ctx.sessionStatus.hasSessionCookie,
      },
      event: detail,
    };
  }
}

export function createVrctlEventsService(deps: VrctlEventsServiceDeps = {}): VrctlEventsService {
  return new VrctlEventsService(deps);
}

export const vrctlEventsService = createVrctlEventsService();
