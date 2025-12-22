import { z } from 'zod';

export const CallInputSchema = z.object({
  operationId: z.string(),
  params: z.record(z.string(), z.any()).optional(),
  body: z.any().optional(),
  options: z
    .object({
      dryRun: z.boolean().optional(),
      rawResponse: z.boolean().optional(),
    })
    .optional(),
});
