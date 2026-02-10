import { z } from 'zod';

export const VrctlOrganizersSearchInputSchema = z
  .object({
    query: z.string().min(1),
    maxResults: z.number().int().min(1).max(100).optional(),
  })
  .strict();

export const VrctlOrganizerSummarySchema = z
  .object({
    name: z.string(),
    slug: z.string().optional(),
    shortCode: z.string().optional(),
    vrcGroupUrl: z.string().optional(),
    vrchatGroupId: z.string().optional(),
    discordInv: z.string().optional(),
    isSupporter: z.boolean().optional(),
    providesInstances: z.boolean().optional(),
    showOnlyIfFavourite: z.boolean().optional(),
  })
  .strict();

export const VrctlOrganizersSearchOutputSchema = z
  .object({
    query: z.string(),
    totalMatches: z.number().int().min(0),
    matches: z.array(VrctlOrganizerSummarySchema),
  })
  .strict();

export const VrctlOrganizerProfileInputSchema = z
  .object({
    vrchatGroupId: z.string().optional(),
    slug: z.string().optional(),
    shortCode: z.string().optional(),
  })
  .strict();

export const VrctlOrganizerProfileOutputSchema = z
  .object({
    organizer: VrctlOrganizerSummarySchema.nullable(),
  })
  .strict();
