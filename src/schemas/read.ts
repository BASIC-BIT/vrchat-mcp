import { z } from 'zod';

export const ReadOptionsSchema = z.object({
  fields: z.array(z.string()).describe('Fields to keep.').optional(),
  compact: z.boolean().describe('Compact response.').optional(),
  maxArrayLength: z.number().int().positive().describe('Max array items.').optional(),
  includeMeta: z.boolean().describe('Include URL/page metadata.').optional(),
  page: z
    .object({
      enabled: z.boolean().describe('Enable paging.').optional(),
      size: z.number().int().min(1).describe('Items/page.').optional(),
      maxPages: z.number().int().min(1).describe('Max pages.').optional(),
      maxItems: z.number().int().min(1).describe('Max items.').optional(),
      offset: z.number().int().min(0).describe('Start offset.').optional(),
    })
    .describe('Paging controls.')
    .optional(),
});

export const GeneratedReadToolInputSchema = z
  .object({
    operationId: z.string().min(1).describe('OpenAPI operationId.'),
    params: z.record(z.string(), z.unknown()).describe('OpenAPI params.').optional(),
  })
  .merge(ReadOptionsSchema)
  .passthrough();

export const ReadToolOutputSchema = z.object({
  data: z.any(),
  url: z.string().optional(),
  page: z
    .object({
      pages: z.number().int().min(0),
      items: z.number().int().min(0),
      pageSize: z.number().int().min(1),
      offsetStart: z.number().int().min(0),
      truncated: z.boolean(),
    })
    .optional(),
});

export const GeneratedReadToolOutputSchema = z
  .object({
    data: z.unknown().describe('VRChat API response data.'),
  })
  .passthrough();

export const PagingSchema = {
  offset: z.number().int().min(0).optional(),
  n: z.number().int().min(1).optional(),
  number: z.number().int().min(1).optional(),
};

export const WorldCommonQuerySchema = {
  featured: z.boolean().optional(),
  sort: z.string().optional(),
  order: z.string().optional(),
  search: z.string().optional(),
  tag: z.string().optional(),
  notag: z.string().optional(),
  releaseStatus: z.string().optional(),
  maxUnityVersion: z.string().optional(),
  minUnityVersion: z.string().optional(),
  platform: z.string().optional(),
};

export const AvatarCommonQuerySchema = {
  featured: z.boolean().optional(),
  sort: z.string().optional(),
  order: z.string().optional(),
  tag: z.string().optional(),
  notag: z.string().optional(),
  releaseStatus: z.string().optional(),
  maxUnityVersion: z.string().optional(),
  minUnityVersion: z.string().optional(),
  platform: z.string().optional(),
};
