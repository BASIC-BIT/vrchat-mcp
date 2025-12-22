import { z } from 'zod';
import { GroupPageSchema, GroupSummarySchema } from './groups.js';

export const UserShapeSchema = z.object({
  fields: z.array(z.string()).optional(),
  compact: z.boolean().optional(),
  maxArrayLength: z.number().int().positive().optional(),
});

export const UserGroupsOutputSchema = z.object({
  userId: z.string(),
  pageSize: z.number().int().min(1),
  maxPages: z.number().int().min(1),
  totalGroups: z.number().int().min(0),
  truncated: z.boolean(),
  stale: z.boolean(),
  page: GroupPageSchema,
  groups: z.array(GroupSummarySchema),
});

export const UserProfileInputSchema = UserShapeSchema.extend({
  userId: z.string().optional(),
  username: z.string().optional(),
  includeGroups: z.boolean().optional(),
  groupPageSize: z.number().int().min(1).max(100).optional(),
  groupMaxPages: z.number().int().min(1).max(50).optional(),
  groupOffset: z.number().int().min(0).optional(),
});

export const UserProfileOutputSchema = z.object({
  userId: z.string(),
  user: z.any(),
  groups: UserGroupsOutputSchema.optional(),
});

export const UserGroupsInputSchema = z.object({
  userId: z.string().optional(),
  username: z.string().optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  maxPages: z.number().int().min(1).max(50).optional(),
  offset: z.number().int().min(0).optional(),
});

export type UserGroupsOutput = z.infer<typeof UserGroupsOutputSchema>;
