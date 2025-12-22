import { z } from 'zod';

export const GroupShapeSchema = z.object({
  fields: z.array(z.string()).optional(),
  compact: z.boolean().optional(),
  maxArrayLength: z.number().int().positive().optional(),
});

export const GroupSummarySchema = z.object({
  groupId: z.string(),
  name: z.string().optional(),
  shortCode: z.string().optional(),
  memberCount: z.number().int().optional(),
});

export const GroupPostSummarySchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  text: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  authorId: z.string().optional(),
  visibility: z.string().optional(),
});

export const GroupAnnouncementSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  text: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  authorId: z.string().optional(),
});

export const GroupInstanceSummarySchema = z.object({
  worldId: z.string().optional(),
  worldName: z.string().optional(),
  instanceId: z.string(),
  location: z.string().optional(),
  memberCount: z.number().int().min(0),
});

export const GroupMemberSchema = z.object({
  userId: z.string(),
  displayName: z.string().optional(),
});

export const GroupPageSchema = z.object({
  pages: z.number().int().min(0),
  items: z.number().int().min(0),
  pageSize: z.number().int().min(1),
  offsetStart: z.number().int().min(0),
  truncated: z.boolean(),
});

export const GroupSearchInputSchema = z.object({
  query: z.string(),
  pageSize: z.number().int().min(1).max(100).optional(),
  maxPages: z.number().int().min(1).max(100).optional(),
  maxItems: z.number().int().min(1).optional(),
});

export const GroupSearchOutputSchema = z.object({
  query: z.string(),
  pageSize: z.number().int().min(1),
  maxPages: z.number().int().min(1),
  totalGroups: z.number().int().min(0),
  truncated: z.boolean(),
  stale: z.boolean(),
  page: GroupPageSchema.optional(),
  groups: z.array(GroupSummarySchema),
});

export const GroupProfileInputSchema = GroupShapeSchema.extend({
  groupId: z.string().optional(),
  shortCode: z.string().optional(),
});

export const GroupProfileOutputSchema = z.object({
  groupId: z.string(),
  stale: z.boolean(),
  group: z.any(),
});

export const GroupMembersInputSchema = z.object({
  groupId: z.string().optional(),
  shortCode: z.string().optional(),
  roleId: z.string().optional(),
  sort: z.string().optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  maxPages: z.number().int().min(1).max(200).optional(),
  maxItems: z.number().int().min(1).optional(),
  offset: z.number().int().min(0).optional(),
});

export const GroupMembersOutputSchema = z.object({
  groupId: z.string(),
  totalMembers: z.number().int().min(0),
  truncated: z.boolean(),
  stale: z.boolean(),
  page: GroupPageSchema.optional(),
  members: z.array(GroupMemberSchema).optional(),
});

export const GroupAnnouncementInputSchema = z.object({
  groupId: z.string().optional(),
  shortCode: z.string().optional(),
});

export const GroupAnnouncementOutputSchema = z.object({
  groupId: z.string(),
  stale: z.boolean(),
  announcement: GroupAnnouncementSchema.nullable(),
});

export const GroupPostsRecentInputSchema = z.object({
  groupId: z.string().optional(),
  shortCode: z.string().optional(),
  publicOnly: z.boolean().optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  maxPages: z.number().int().min(1).max(100).optional(),
  maxItems: z.number().int().min(1).optional(),
});

export const GroupPostsRecentOutputSchema = z.object({
  groupId: z.string(),
  pageSize: z.number().int().min(1),
  maxPages: z.number().int().min(1),
  totalPosts: z.number().int().min(0),
  truncated: z.boolean(),
  stale: z.boolean(),
  page: GroupPageSchema.optional(),
  posts: z.array(GroupPostSummarySchema),
});

export const GroupEventsListInputSchema = GroupShapeSchema.extend({
  groupId: z.string().optional(),
  shortCode: z.string().optional(),
  date: z.string().optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  maxPages: z.number().int().min(1).max(100).optional(),
  maxItems: z.number().int().min(1).optional(),
});

export const GroupEventsListOutputSchema = z.object({
  groupId: z.string(),
  date: z.string().optional(),
  pageSize: z.number().int().min(1),
  maxPages: z.number().int().min(1),
  maxItems: z.number().int().min(1),
  totalEvents: z.number().int().min(0),
  truncated: z.boolean(),
  stale: z.boolean(),
  page: GroupPageSchema.optional(),
  events: z.array(z.any()),
});

export const GroupEventGetInputSchema = GroupShapeSchema.extend({
  groupId: z.string().optional(),
  shortCode: z.string().optional(),
  calendarId: z.string(),
});

export const GroupEventGetOutputSchema = z.object({
  groupId: z.string(),
  calendarId: z.string(),
  stale: z.boolean(),
  event: z.any().optional(),
});

export const GroupEventsUpcomingInputSchema = GroupShapeSchema.extend({
  groupId: z.string().optional(),
  shortCode: z.string().optional(),
  from: z.string().optional(),
  windowHours: z.number().int().min(1).max(168).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  maxPages: z.number().int().min(1).max(100).optional(),
  maxItems: z.number().int().min(1).optional(),
});

export const GroupEventsUpcomingOutputSchema = z.object({
  groupId: z.string(),
  from: z.string(),
  to: z.string(),
  windowHours: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  maxPages: z.number().int().min(1),
  maxItems: z.number().int().min(1),
  totalEvents: z.number().int().min(0),
  truncated: z.boolean(),
  stale: z.boolean(),
  segments: z.array(
    z.object({
      date: z.string(),
      page: GroupPageSchema.optional(),
    }),
  ),
  events: z.array(z.any()),
});

export const GroupInstancesOverviewInputSchema = z.object({
  groupId: z.string().optional(),
  shortCode: z.string().optional(),
  maxInstances: z.number().int().min(1).max(200).optional(),
});

export const GroupInstancesOverviewOutputSchema = z.object({
  groupId: z.string(),
  totalInstances: z.number().int().min(0),
  totalMembers: z.number().int().min(0),
  stale: z.boolean(),
  instances: z.array(GroupInstanceSummarySchema),
});

export type GroupSummary = z.infer<typeof GroupSummarySchema>;
export type GroupPostSummary = z.infer<typeof GroupPostSummarySchema>;
export type GroupAnnouncement = z.infer<typeof GroupAnnouncementSchema>;
export type GroupInstanceSummary = z.infer<typeof GroupInstanceSummarySchema>;
export type GroupMemberSummary = z.infer<typeof GroupMemberSchema>;
export type GroupSearchInput = z.infer<typeof GroupSearchInputSchema>;
export type GroupSearchOutput = z.infer<typeof GroupSearchOutputSchema>;
export type GroupProfileInput = z.infer<typeof GroupProfileInputSchema>;
export type GroupMembersInput = z.infer<typeof GroupMembersInputSchema>;
export type GroupAnnouncementInput = z.infer<typeof GroupAnnouncementInputSchema>;
export type GroupPostsRecentInput = z.infer<typeof GroupPostsRecentInputSchema>;
export type GroupEventsListInput = z.infer<typeof GroupEventsListInputSchema>;
export type GroupEventGetInput = z.infer<typeof GroupEventGetInputSchema>;
export type GroupEventsUpcomingInput = z.infer<typeof GroupEventsUpcomingInputSchema>;
export type GroupInstancesOverviewInput = z.infer<typeof GroupInstancesOverviewInputSchema>;

export type GroupResolution =
  | { ok: true; groupId: string; resolvedBy: 'id' | 'shortCode' }
  | { ok: false; reason: string; status: 'not_found'; nextSteps: string[] };

export function mapGroupSummary(entry: unknown): GroupSummary | null {
  if (!entry || typeof entry !== 'object') return null;
  const record = entry as Record<string, unknown>;
  const groupId =
    typeof record.id === 'string'
      ? record.id
      : typeof record.groupId === 'string'
        ? record.groupId
        : '';
  if (!groupId) return null;
  const name = typeof record.name === 'string' ? record.name : undefined;
  const shortCode = typeof record.shortCode === 'string' ? record.shortCode : undefined;
  const memberCount =
    typeof record.memberCount === 'number' && Number.isFinite(record.memberCount)
      ? Math.floor(record.memberCount)
      : undefined;
  return { groupId, name, shortCode, memberCount };
}

export function mapGroupAnnouncement(entry: unknown): GroupAnnouncement | null {
  if (!entry || typeof entry !== 'object') return null;
  const record = entry as Record<string, unknown>;
  const id = typeof record.id === 'string' ? record.id : undefined;
  const title = typeof record.title === 'string' ? record.title : undefined;
  const text = typeof record.text === 'string' ? record.text : undefined;
  const createdAt = typeof record.createdAt === 'string' ? record.createdAt : undefined;
  const updatedAt = typeof record.updatedAt === 'string' ? record.updatedAt : undefined;
  const authorId = typeof record.authorId === 'string' ? record.authorId : undefined;
  if (!id && !title && !text && !createdAt && !updatedAt && !authorId) return null;
  return { id, title, text, createdAt, updatedAt, authorId };
}

export function mapGroupPost(entry: unknown): GroupPostSummary | null {
  if (!entry || typeof entry !== 'object') return null;
  const record = entry as Record<string, unknown>;
  const id = typeof record.id === 'string' ? record.id : '';
  if (!id) return null;
  const title = typeof record.title === 'string' ? record.title : undefined;
  const text = typeof record.text === 'string' ? record.text : undefined;
  const createdAt = typeof record.createdAt === 'string' ? record.createdAt : undefined;
  const updatedAt = typeof record.updatedAt === 'string' ? record.updatedAt : undefined;
  const authorId = typeof record.authorId === 'string' ? record.authorId : undefined;
  const visibility = typeof record.visibility === 'string' ? record.visibility : undefined;
  return { id, title, text, createdAt, updatedAt, authorId, visibility };
}

export function mapGroupInstance(entry: unknown): GroupInstanceSummary | null {
  if (!entry || typeof entry !== 'object') return null;
  const record = entry as Record<string, unknown>;
  const instanceId = typeof record.instanceId === 'string' ? record.instanceId : '';
  if (!instanceId) return null;
  const location = typeof record.location === 'string' ? record.location : undefined;
  const memberCount =
    typeof record.memberCount === 'number' && Number.isFinite(record.memberCount)
      ? Math.floor(record.memberCount)
      : 0;
  const world = record.world && typeof record.world === 'object' ? (record.world as Record<string, unknown>) : undefined;
  const worldId = typeof world?.id === 'string' ? world.id : undefined;
  const worldName = typeof world?.name === 'string' ? world.name : undefined;
  return { instanceId, location, memberCount, worldId, worldName };
}

export function mapGroupMember(entry: unknown): GroupMemberSummary | null {
  if (!entry || typeof entry !== 'object') return null;
  const record = entry as Record<string, unknown>;
  const userId = typeof record.userId === 'string' ? record.userId : '';
  const user = record.user && typeof record.user === 'object' ? (record.user as Record<string, unknown>) : undefined;
  const fallbackId = typeof user?.id === 'string' ? user.id : '';
  const resolvedId = userId || fallbackId;
  if (!resolvedId) return null;
  const displayName = typeof user?.displayName === 'string' ? user.displayName : undefined;
  return { userId: resolvedId, displayName };
}
