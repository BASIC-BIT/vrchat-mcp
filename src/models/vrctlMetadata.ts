import { z } from 'zod';

export const VrctlMetadataOutputSchema = z
  .object({
    loggedIn: z.boolean().nullable(),
    verified: z.boolean(),
    counts: z
      .object({
        categories: z.number().int().min(0),
        tags: z.number().int().min(0),
      })
      .strict(),
    categories: z.array(
      z
        .object({
          id: z.number().int(),
          name: z.string(),
          urlName: z.string().optional(),
          icon: z.string().optional(),
          description: z.string().optional(),
        })
        .strict()
    ),
    tags: z.array(
      z
        .object({
          id: z.number().int(),
          name: z.string(),
          urlName: z.string().optional(),
          group: z.number().int().optional(),
          tooltip: z.string().nullable().optional(),
          icon: z.string().nullable().optional(),
          visibleOnEvent: z.boolean().optional(),
          visibleOnFilter: z.boolean().optional(),
          eventsHiddenForNotLoggedIn: z.boolean().optional(),
          tagHiddenForNotLoggedIn: z.boolean().optional(),
        })
        .strict()
    ),
  })
  .strict();
