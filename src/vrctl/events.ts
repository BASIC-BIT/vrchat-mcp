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
  const match = /(grp_[A-Za-z0-9]+)/.exec(vrcGroupUrl);
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

  private async getEventsChunk(params: { before?: string; after?: string }) {
    const cacheKey = buildCacheKey('vrctl:events:chunk', {
      before: params.before,
      after: params.after,
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
    const config = getConfig();
    if (!config.vrctl.enabled) {
      throw new Error(
        'vrc.tl tools are disabled. Set vrctl.enabled=true (or VRCHAT_MCP_VRCTL_ENABLED=1).'
      );
    }

    const daysBack = Math.max(0, Math.min(30, options.daysBack ?? 0));
    const daysForward = Math.max(0, Math.min(30, options.daysForward ?? 0));
    const maxItems = Math.max(1, Math.min(500, options.maxItems ?? 200));
    const includeHidden = Boolean(options.includeHidden);

    const sessionStatus = vrctlAuthManager.getStatus();
    const bootstrap = await this.metadata.getBootstrapCached();
    const isLoggedIn = bootstrap.loggedIn === true;

    if (includeHidden && !isLoggedIn) {
      throw new Error('includeHidden requires vrc.tl login. Use vrctl_auth_begin and try again.');
    }

    const { categoriesById } = buildCategoryMap(bootstrap.categories);
    const { tagsById, hiddenEventTagIds, hiddenTagIds } = buildTagMaps(bootstrap.tags);

    const base = await this.getEventsChunk({});
    let firstLoadedDay = base.range.firstLoadedDay;
    let lastLoadedDay = base.range.lastLoadedDay;

    const chunks = [base];

    // Page backwards.
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

    // Page forwards.
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

    const organizersById = new Map<number, z.infer<typeof OrganizerSchema>>();
    const performersById = new Map<number, z.infer<typeof PerformerSchema>>();
    const eventsById = new Map<number, z.infer<typeof EventSchema>>();

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

    const rawEvents = [...eventsById.values()];
    rawEvents.sort((a, b) => (a.start ?? 0) - (b.start ?? 0));

    const filtered: z.infer<typeof EventSchema>[] = [];
    let filteredHiddenEvents = 0;

    for (const e of rawEvents) {
      const tagIds = e.tags ?? [];
      const hidden = tagIds.some((id) => hiddenEventTagIds.has(id));
      if (hidden && !isLoggedIn && !includeHidden) {
        filteredHiddenEvents += 1;
        continue;
      }
      filtered.push(e);
    }

    const truncated = filtered.length > maxItems;
    const picked = filtered.slice(0, maxItems);

    const summaries: VrctlEventSummary[] = picked.map((e) => {
      const categoryId = e.category ?? null;
      const categoryLabel = categoryId ? categoriesById.get(categoryId)?.name : undefined;

      const tagIds = e.tags ?? [];
      const tagLabels = !isLoggedIn
        ? tagIds
            .filter((id) => !hiddenTagIds.has(id))
            .map((id) => tagsById.get(id)?.name)
            .filter((name): name is string => Boolean(name))
        : tagIds
            .map((id) => tagsById.get(id)?.name)
            .filter((name): name is string => Boolean(name));

      const orgs = (e.organizers ?? [])
        .map((id) => organizersById.get(id))
        .filter((o): o is z.infer<typeof OrganizerSchema> => Boolean(o))
        .map(organizerSummary);

      return {
        eventId: e.id,
        name: e.name,
        startEpoch: e.start,
        startIso: epochToIso(e.start),
        endEpoch: e.end,
        endIso: epochToIso(e.end),
        durationSec: e.duration,
        eventUrl: buildEventUrl(this.siteUrl, e.id),
        posterUrl: e.poster ?? undefined,
        categoryId,
        category: categoryLabel,
        tagIds,
        tags: tagLabels.length ? tagLabels : undefined,
        organizers: orgs,
      };
    });

    return {
      requested: {
        daysBack,
        daysForward,
        includeHidden,
        maxItems,
      },
      auth: {
        loggedIn: bootstrap.loggedIn,
        verified: bootstrap.loggedIn !== null,
        hasSessionCookie: sessionStatus.hasSessionCookie,
      },
      range: { firstLoadedDay, lastLoadedDay },
      totalEvents: rawEvents.length,
      returnedEvents: summaries.length,
      filteredHiddenEvents,
      truncated,
      events: summaries,
    };
  }

  async getEventById(
    eventId: number,
    options: VrctlEventGetOptions = {}
  ): Promise<VrctlEventGetResult> {
    const config = getConfig();
    if (!config.vrctl.enabled) {
      throw new Error(
        'vrc.tl tools are disabled. Set vrctl.enabled=true (or VRCHAT_MCP_VRCTL_ENABLED=1).'
      );
    }

    const includeHidden = Boolean(options.includeHidden);
    const sessionStatus = vrctlAuthManager.getStatus();
    const bootstrap = await this.metadata.getBootstrapCached();
    const isLoggedIn = bootstrap.loggedIn === true;
    if (includeHidden && !isLoggedIn) {
      throw new Error('includeHidden requires vrc.tl login. Use vrctl_auth_begin and try again.');
    }

    const { categoriesById } = buildCategoryMap(bootstrap.categories);
    const { tagsById, hiddenEventTagIds, hiddenTagIds } = buildTagMaps(bootstrap.tags);

    const data = await this.client.getApiJson(`/events/${eventId}`);
    const dataset = EventDatasetResponseSchema.parse(data);

    const event = dataset.events[0];
    if (!event) {
      throw new Error(`Event not found: ${eventId}`);
    }

    const tagIds = event.tags ?? [];
    const hidden = tagIds.some((id) => hiddenEventTagIds.has(id));
    if (hidden && !isLoggedIn && !includeHidden) {
      throw new Error(
        'Event is hidden on vrc.tl unless logged in. Use vrctl_auth_begin and try again.'
      );
    }

    const organizersById = new Map<number, z.infer<typeof OrganizerSchema>>();
    for (const org of dataset.organizers) {
      organizersById.set(org.id, org);
    }
    const performersById = new Map<number, z.infer<typeof PerformerSchema>>();
    for (const perf of dataset.performers) {
      performersById.set(perf.id, perf);
    }

    const categoryId = event.category ?? null;
    const categoryLabel = categoryId ? categoriesById.get(categoryId)?.name : undefined;

    const tagLabels = !isLoggedIn
      ? tagIds
          .filter((id) => !hiddenTagIds.has(id))
          .map((id) => tagsById.get(id)?.name)
          .filter((name): name is string => Boolean(name))
      : tagIds.map((id) => tagsById.get(id)?.name).filter((name): name is string => Boolean(name));

    const orgs = (event.organizers ?? [])
      .map((id) => organizersById.get(id))
      .filter((o): o is z.infer<typeof OrganizerSchema> => Boolean(o))
      .map(organizerSummary);

    const slots = (event.eventSlots ?? []).map((slot) => {
      const performerIds = slot.performers ?? [];
      const performers = performerIds
        .map((id) => performersById.get(id))
        .filter((p): p is z.infer<typeof PerformerSchema> => Boolean(p))
        .map((p) => ({ performerId: p.id, name: p.name }));
      return {
        slotId: slot.id,
        startEpoch: slot.start,
        startIso: epochToIso(slot.start),
        durationSec: slot.duration,
        order: slot.order,
        flag: slot.flag,
        performers,
      } satisfies VrctlEventSlot;
    });

    const promoted = typeof event.promoted === 'boolean' ? event.promoted : Boolean(event.promoted);

    const detail: VrctlEventDetail = {
      eventId: event.id,
      name: event.name,
      description: event.description,
      startEpoch: event.start,
      startIso: epochToIso(event.start),
      endEpoch: event.end,
      endIso: epochToIso(event.end),
      durationSec: event.duration,
      eventUrl: buildEventUrl(this.siteUrl, event.id),
      posterUrl: event.poster ?? undefined,
      categoryId,
      category: categoryLabel,
      tagIds,
      tags: tagLabels.length ? tagLabels : undefined,
      organizers: orgs,
      urls: event.urls,
      isHighlighted: event.isHighlighted,
      promoted,
      eventSlots: slots,
    };

    return {
      requested: { includeHidden },
      auth: {
        loggedIn: bootstrap.loggedIn,
        verified: bootstrap.loggedIn !== null,
        hasSessionCookie: sessionStatus.hasSessionCookie,
      },
      event: detail,
    };
  }
}

export function createVrctlEventsService(deps: VrctlEventsServiceDeps = {}): VrctlEventsService {
  return new VrctlEventsService(deps);
}

export const vrctlEventsService = createVrctlEventsService();
