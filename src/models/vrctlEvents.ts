import { z } from 'zod';

export const VrctlEventsCurrentInputSchema = z
  .object({
    daysBack: z.number().int().min(0).max(30).optional(),
    daysForward: z.number().int().min(0).max(30).optional(),
    includeHidden: z.boolean().optional(),
    maxItems: z.number().int().min(1).max(500).optional(),
  })
  .strict();

export const VrctlOrganizerSummarySchema = z
  .object({
    name: z.string(),
    slug: z.string().optional(),
    shortCode: z.string().optional(),
    vrcGroupUrl: z.string().optional(),
    vrchatGroupId: z.string().optional(),
  })
  .strict();

export const VrctlEventSummarySchema = z
  .object({
    eventId: z.number().int(),
    name: z.string(),
    startEpoch: z.number().int().optional(),
    startIso: z.string().optional(),
    endEpoch: z.number().int().optional(),
    endIso: z.string().optional(),
    durationSec: z.number().int().optional(),
    eventUrl: z.string(),
    posterUrl: z.string().optional(),
    categoryId: z.number().int().nullable().optional(),
    category: z.string().optional(),
    tagIds: z.array(z.number().int()),
    tags: z.array(z.string()).optional(),
    organizers: z.array(VrctlOrganizerSummarySchema),
  })
  .strict();

export const VrctlEventsCurrentOutputSchema = z
  .object({
    requested: z.object({
      daysBack: z.number().int(),
      daysForward: z.number().int(),
      includeHidden: z.boolean(),
      maxItems: z.number().int(),
    }),
    auth: z.object({
      loggedIn: z.boolean().nullable(),
      verified: z.boolean(),
      hasSessionCookie: z.boolean(),
    }),
    range: z.object({
      firstLoadedDay: z.string(),
      lastLoadedDay: z.string(),
    }),
    totalEvents: z.number().int(),
    returnedEvents: z.number().int(),
    filteredHiddenEvents: z.number().int(),
    truncated: z.boolean(),
    events: z.array(VrctlEventSummarySchema),
  })
  .strict();

export const VrctlEventGetInputSchema = z
  .object({
    eventId: z.number().int(),
    includeHidden: z.boolean().optional(),
  })
  .strict();

export const VrctlEventSlotSchema = z
  .object({
    slotId: z.string(),
    startEpoch: z.number().int().optional(),
    startIso: z.string().optional(),
    durationSec: z.number().int().optional(),
    order: z.number().int().optional(),
    flag: z.string().optional(),
    performers: z.array(
      z
        .object({
          performerId: z.number().int(),
          name: z.string(),
        })
        .strict()
    ),
  })
  .strict();

export const VrctlEventDetailSchema = VrctlEventSummarySchema.extend({
  description: z.string().nullable().optional(),
  urls: z.record(z.string(), z.unknown()).optional(),
  isHighlighted: z.boolean().optional(),
  promoted: z.boolean().optional(),
  eventSlots: z.array(VrctlEventSlotSchema),
}).strict();

export const VrctlEventGetOutputSchema = z
  .object({
    requested: z.object({ includeHidden: z.boolean() }),
    auth: z.object({
      loggedIn: z.boolean().nullable(),
      verified: z.boolean(),
      hasSessionCookie: z.boolean(),
    }),
    event: VrctlEventDetailSchema,
  })
  .strict();
