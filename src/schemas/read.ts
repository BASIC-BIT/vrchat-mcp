import { z } from 'zod';

export const ReadOptionsSchema = z.object({
  fields: z.array(z.string()).optional(),
  compact: z.boolean().optional(),
  maxArrayLength: z.number().int().positive().optional(),
  includeMeta: z.boolean().optional(),
  page: z
    .object({
      enabled: z.boolean().optional(),
      size: z.number().int().min(1).optional(),
      maxPages: z.number().int().min(1).optional(),
      maxItems: z.number().int().min(1).optional(),
      offset: z.number().int().min(0).optional(),
    })
    .optional(),
});

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
