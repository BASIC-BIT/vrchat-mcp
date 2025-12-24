import { z } from 'zod';

export const WriteOptionsSchema = z.object({
  includeMeta: z.boolean().optional(),
  options: z
    .object({
      dryRun: z.boolean().optional(),
      rawResponse: z.boolean().optional(),
    })
    .optional(),
});

export const WriteToolOutputSchema = z.object({
  data: z.any().optional(),
  url: z.string().optional(),
  status: z.number().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  dryRun: z.boolean().optional(),
});
