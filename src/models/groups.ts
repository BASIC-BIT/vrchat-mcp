import { z } from 'zod';
import { schemas } from '../generated/vrchat-schemas.js';

export const GroupShapeSchema = z.object({
  fields: z.array(z.string()).optional(),
  compact: z.boolean().optional(),
  maxArrayLength: z.number().int().positive().optional(),
});

export const GroupSummarySchema = z.object({
  groupId: schemas.GroupID,
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
  authorId: schemas.UserID.optional(),
  visibility: z.string().optional(),
});

export const GroupAnnouncementSchema = z.object({
  id: schemas.GroupAnnouncementID.optional(),
  title: z.string().optional(),
  text: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  authorId: schemas.UserID.optional(),
});

export const GroupInstanceSummarySchema = z.object({
  worldId: schemas.WorldID.optional(),
  worldName: z.string().optional(),
  instanceId: schemas.InstanceID,
  location: z.string().optional(),
  memberCount: z.number().int().min(0),
});

export const GroupMemberSchema = z.object({
  userId: schemas.UserID,
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
  groupId: schemas.GroupID.optional(),
  shortCode: z.string().optional(),
});

export const GroupProfileOutputSchema = z.object({
  groupId: schemas.GroupID,
  stale: z.boolean(),
  group: schemas.Group.partial(),
});

export const GroupMembersInputSchema = z.object({
  groupId: schemas.GroupID.optional(),
  shortCode: z.string().optional(),
  roleId: schemas.GroupRoleID.optional(),
  sort: z.string().optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  maxPages: z.number().int().min(1).max(200).optional(),
  maxItems: z.number().int().min(1).optional(),
  offset: z.number().int().min(0).optional(),
});

export const GroupMembersOutputSchema = z.object({
  groupId: schemas.GroupID,
  totalMembers: z.number().int().min(0),
  truncated: z.boolean(),
  stale: z.boolean(),
  page: GroupPageSchema.optional(),
  members: z.array(GroupMemberSchema).optional(),
});

export const GroupAnnouncementInputSchema = z.object({
  groupId: schemas.GroupID.optional(),
  shortCode: z.string().optional(),
});

export const GroupAnnouncementOutputSchema = z.object({
  groupId: schemas.GroupID,
  stale: z.boolean(),
  announcement: GroupAnnouncementSchema.nullable(),
});

export const GroupPostsRecentInputSchema = z.object({
  groupId: schemas.GroupID.optional(),
  shortCode: z.string().optional(),
  publicOnly: z.boolean().optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  maxPages: z.number().int().min(1).max(100).optional(),
  maxItems: z.number().int().min(1).optional(),
});

export const GroupPostsRecentOutputSchema = z.object({
  groupId: schemas.GroupID,
  pageSize: z.number().int().min(1),
  maxPages: z.number().int().min(1),
  totalPosts: z.number().int().min(0),
  truncated: z.boolean(),
  stale: z.boolean(),
  page: GroupPageSchema.optional(),
  posts: z.array(GroupPostSummarySchema),
});

export const GroupEventsListInputSchema = GroupShapeSchema.extend({
  groupId: schemas.GroupID.optional(),
  shortCode: z.string().optional(),
  date: z.string().optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  maxPages: z.number().int().min(1).max(100).optional(),
  maxItems: z.number().int().min(1).optional(),
});

export const GroupEventsListOutputSchema = z.object({
  groupId: schemas.GroupID,
  date: z.string().optional(),
  pageSize: z.number().int().min(1),
  maxPages: z.number().int().min(1),
  maxItems: z.number().int().min(1),
  totalEvents: z.number().int().min(0),
  truncated: z.boolean(),
  stale: z.boolean(),
  page: GroupPageSchema.optional(),
  events: z.array(schemas.CalendarEvent.partial()),
});

export const GroupEventGetInputSchema = GroupShapeSchema.extend({
  groupId: schemas.GroupID.optional(),
  shortCode: z.string().optional(),
  calendarId: schemas.CalendarID,
});

export const GroupEventGetOutputSchema = z.object({
  groupId: schemas.GroupID,
  calendarId: schemas.CalendarID,
  stale: z.boolean(),
  event: schemas.CalendarEvent.partial().optional(),
});

export const GroupEventsUpcomingInputSchema = GroupShapeSchema.extend({
  groupId: schemas.GroupID.optional(),
  shortCode: z.string().optional(),
  from: z.string().optional(),
  windowHours: z.number().int().min(1).max(168).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  maxPages: z.number().int().min(1).max(100).optional(),
  maxItems: z.number().int().min(1).optional(),
});

export const GroupEventsUpcomingOutputSchema = z.object({
  groupId: schemas.GroupID,
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
  events: z.array(schemas.CalendarEvent.partial()),
});

export const GroupInstancesOverviewInputSchema = z.object({
  groupId: schemas.GroupID.optional(),
  shortCode: z.string().optional(),
  maxInstances: z.number().int().min(1).max(200).optional(),
});

export const GroupInstancesOverviewOutputSchema = z.object({
  groupId: schemas.GroupID,
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

type LimitedGroupRecord = Partial<z.infer<typeof schemas.LimitedGroup>>;
type GroupAnnouncementRecord = Partial<z.infer<typeof schemas.GroupAnnouncement>>;
type GroupPostRecord = Partial<z.infer<typeof schemas.GroupPost>>;
type GroupMemberRecord = Partial<z.infer<typeof schemas.GroupMember>>;
type GroupInstanceRecord = Partial<
  Omit<z.infer<typeof schemas.GroupInstance>, 'world'> & {
    world?: Partial<z.infer<typeof schemas.World>>;
  }
>;

export function toGroupSummary(group: LimitedGroupRecord): GroupSummary | null {
  const groupId = group.id ?? '';
  if (!groupId) return null;
  return {
    groupId,
    name: group.name ?? undefined,
    shortCode: group.shortCode ?? undefined,
    memberCount:
      typeof group.memberCount === 'number' ? Math.floor(group.memberCount) : undefined,
  };
}

export function toGroupAnnouncement(
  announcement: GroupAnnouncementRecord,
): GroupAnnouncement | null {
  const content: GroupAnnouncement = {
    id: announcement.id ?? undefined,
    title: announcement.title ?? undefined,
    text: announcement.text ?? undefined,
    createdAt: announcement.createdAt ?? undefined,
    updatedAt: announcement.updatedAt ?? undefined,
    authorId: announcement.authorId ?? undefined,
  };
  if (
    !content.id &&
    !content.title &&
    !content.text &&
    !content.createdAt &&
    !content.updatedAt &&
    !content.authorId
  ) {
    return null;
  }
  return content;
}

export function toGroupPostSummary(post: GroupPostRecord): GroupPostSummary | null {
  const id = post.id ?? '';
  if (!id) return null;
  return {
    id,
    title: post.title ?? undefined,
    text: post.text ?? undefined,
    createdAt: post.createdAt ?? undefined,
    updatedAt: post.updatedAt ?? undefined,
    authorId: post.authorId ?? undefined,
    visibility: post.visibility ?? undefined,
  };
}

export function toGroupInstanceSummary(
  instance: GroupInstanceRecord,
): GroupInstanceSummary | null {
  const instanceId =
    typeof instance.instanceId === 'string' ? instance.instanceId : '';
  if (!instanceId) return null;
  const worldId =
    typeof instance.world?.id === 'string' ? instance.world.id : undefined;
  const worldName =
    typeof instance.world?.name === 'string' ? instance.world.name : undefined;
  return {
    instanceId,
    location: typeof instance.location === 'string' ? instance.location : undefined,
    memberCount:
      typeof instance.memberCount === 'number' ? instance.memberCount : 0,
    worldId,
    worldName,
  };
}

export function toGroupMemberSummary(member: GroupMemberRecord): GroupMemberSummary | null {
  const userId = member.userId ?? member.user?.id ?? '';
  if (!userId) return null;
  return {
    userId,
    displayName: member.user?.displayName ?? undefined,
  };
}
