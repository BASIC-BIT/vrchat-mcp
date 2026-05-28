import { z } from 'zod';

export const WriteOptionsSchema = z.object({
  includeMeta: z.boolean().describe('Include URL/status/headers.').optional(),
  options: z
    .object({
      dryRun: z.boolean().describe('Preview request.').optional(),
      rawResponse: z.boolean().describe('Return raw metadata.').optional(),
    })
    .describe('Write options.')
    .optional(),
});

export const GeneratedWriteToolInputSchema = z
  .object({
    operationId: z.string().min(1).describe('OpenAPI operationId.'),
    params: z.record(z.string(), z.unknown()).describe('OpenAPI params.').optional(),
    body: z.unknown().describe('OpenAPI request body.').optional(),
  })
  .merge(WriteOptionsSchema)
  .passthrough();

export const WriteToolOutputSchema = z.object({
  data: z.any().optional(),
  url: z.string().optional(),
  status: z.number().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  dryRun: z.boolean().optional(),
});

export const GeneratedWriteToolOutputSchema = z
  .object({
    data: z.unknown().describe('VRChat API response data.').optional(),
  })
  .passthrough();
