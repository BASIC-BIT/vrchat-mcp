import { z } from 'zod';

export const WriteOptionsSchema = z.object({
  includeMeta: z.boolean().describe('Include URL, status, and response headers.').optional(),
  options: z
    .object({
      dryRun: z.boolean().describe('Build the request without sending it.').optional(),
      rawResponse: z.boolean().describe('Return the raw response metadata when supported.').optional(),
    })
    .describe('Generated write call options.')
    .optional(),
});

export const WriteToolOutputSchema = z.object({
  data: z.any().optional(),
  url: z.string().optional(),
  status: z.number().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  dryRun: z.boolean().optional(),
});
