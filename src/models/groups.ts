import { z } from 'zod';
import { schemas } from '../generated/vrchat-schemas.js';
import { ApiObjectSchema } from './common.js';

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
  // roleIds and imageId are part of the post's edit surface: vrchat_group_post_update
  // replaces the whole post, so omitting them here would silently clear them.
  roleIds: schemas.GroupRoleIDList.optional(),
  imageId: schemas.FileID.optional(),
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
  group: ApiObjectSchema,
});

export const GroupMembersInputSchema = z.object({
  groupId: schemas.GroupID.describe('Exact group ID. Provide groupId or shortCode.').optional(),
  shortCode: z
    .string()
    .describe('Exact group short code. Provide groupId or shortCode.')
    .optional(),
  roleId: schemas.GroupRoleID.describe('Only include members with this role.').optional(),
  sort: z.string().describe('VRChat group-member sort expression.').optional(),
  view: z
    .enum(['page', 'all'])
    .default('page')
    .optional()
    .describe(
      'page fetches one bounded API page; all explicitly loads and caches a rate-aware snapshot capped at 10,000 members.'
    ),
  pageSize: z
    .number()
    .int()
    .min(1)
    .max(100)
    .describe('Members to fetch when view=page. Ignored when view=all.')
    .optional(),
  offset: z
    .number()
    .int()
    .min(0)
    .describe('Starting member offset when view=page. Ignored when view=all.')
    .optional(),
});

export const GroupMembersOutputSchema = z.object({
  groupId: schemas.GroupID,
  view: z.enum(['page', 'all']),
  returnedMembers: z.number().int().min(0),
  truncated: z.boolean(),
  stale: z.boolean(),
  page: GroupPageSchema.optional(),
  members: z.array(GroupMemberSchema),
});

export const GroupRoleSummarySchema = z.object({
  roleId: schemas.GroupRoleID,
  name: z.string().optional(),
  description: z.string().optional(),
  order: z.number().int().optional(),
  permissions: z.array(schemas.GroupPermissions).optional(),
  isManagementRole: z.boolean().optional(),
  isSelfAssignable: z.boolean().optional(),
});

export const GroupRolesInputSchema = z.object({
  view: z.enum(['roles', 'templates']).default('roles'),
  groupId: schemas.GroupID.optional(),
  shortCode: z.string().optional(),
});

export const GroupRolesOutputSchema = z.object({
  view: z.string(),
  groupId: schemas.GroupID.optional(),
  totalRoles: z.number().int().min(0).optional(),
  roles: z.array(GroupRoleSummarySchema).optional(),
  templates: z.record(z.string(), schemas.GroupRoleTemplateValues.partial()).optional(),
});

const GroupRoleBodySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  permissions: z.array(schemas.GroupPermissions).optional(),
  isSelfAssignable: z.boolean().optional(),
});

export const GroupRolesManageInputSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('assign_member_role'),
    groupId: schemas.GroupID.optional(),
    shortCode: z.string().optional(),
    userId: schemas.UserID,
    groupRoleId: schemas.GroupRoleID,
  }),
  z.object({
    action: z.literal('remove_member_role'),
    groupId: schemas.GroupID.optional(),
    shortCode: z.string().optional(),
    userId: schemas.UserID,
    groupRoleId: schemas.GroupRoleID,
  }),
  GroupRoleBodySchema.extend({
    action: z.literal('create_role'),
    groupId: schemas.GroupID.optional(),
    shortCode: z.string().optional(),
    roleId: schemas.GroupRoleID.optional(),
  }),
  GroupRoleBodySchema.extend({
    action: z.literal('update_role'),
    groupId: schemas.GroupID.optional(),
    shortCode: z.string().optional(),
    groupRoleId: schemas.GroupRoleID,
    order: z.number().int().optional(),
  }),
  z.object({
    action: z.literal('delete_role'),
    groupId: schemas.GroupID.optional(),
    shortCode: z.string().optional(),
    groupRoleId: schemas.GroupRoleID,
  }),
]);

// The MCP SDK only serializes ZodObject shapes into the advertised JSON Schema; a
// discriminatedUnion publishes `properties: {}`, which strips typed fields like
// `permissions` from the wire contract and makes clients send them as strings.
// Advertise this flat superset, and keep the union above as the real validator.
export const GroupRolesManageToolSchema = z.object({
  action: z.enum([
    'assign_member_role',
    'remove_member_role',
    'create_role',
    'update_role',
    'delete_role',
  ]),
  groupId: schemas.GroupID.optional(),
  shortCode: z.string().optional(),
  userId: schemas.UserID.optional(),
  groupRoleId: schemas.GroupRoleID.optional(),
  roleId: schemas.GroupRoleID.optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  permissions: z.array(schemas.GroupPermissions).optional(),
  isSelfAssignable: z.boolean().optional(),
  order: z.number().int().optional(),
});

export const GroupRolesManageOutputSchema = z.object({
  action: z.string(),
  groupId: schemas.GroupID,
  userId: schemas.UserID.optional(),
  groupRoleId: schemas.GroupRoleID.optional(),
  roleIds: z.array(schemas.GroupRoleID).optional(),
  role: GroupRoleSummarySchema.nullable().optional(),
  roles: z.array(GroupRoleSummarySchema).optional(),
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

const GroupPostBodySchema = z.object({
  title: z.string().min(1).describe('Post title.'),
  text: z.string().min(1).describe('Post body text.'),
  visibility: schemas.GroupPostVisibility.describe(
    'group restricts the post to members; public shows it on the group page.'
  ),
  roleIds: schemas.GroupRoleIDList.describe(
    'Restrict the post to these group roles. Omit to show it to everyone who can see the post.'
  ).optional(),
  imageId: schemas.FileID.describe(
    'Existing VRChat file ID to attach as the post image.'
  ).optional(),
  // .default().optional() rather than .default() alone: the former keeps the false
  // default while leaving the field out of the advertised required list.
  sendNotification: z
    .boolean()
    .default(false)
    .optional()
    .describe(
      'Notify group members. Defaults to false; set true only when the post warrants a ping.'
    ),
});

const GroupPostTargetSchema = z.object({
  groupId: schemas.GroupID.describe('Exact group ID. Provide groupId or shortCode.').optional(),
  shortCode: z
    .string()
    .describe('Exact group short code. Provide groupId or shortCode.')
    .optional(),
});

export const GroupPostCreateInputSchema = GroupPostBodySchema.extend(GroupPostTargetSchema.shape);

export const GroupPostUpdateInputSchema = GroupPostBodySchema.partial()
  .extend(GroupPostTargetSchema.shape)
  .extend({
    postId: schemas.NotificationID.describe(
      'Post ID from vrchat_group_post_create or vrchat_group_posts_recent. Shaped like a notification ID (not_...).'
    ),
    roleIds: schemas.GroupRoleIDList.describe(
      'Replace the post role restrictions. Omit to keep the current roles; pass an empty array to clear them.'
    ).optional(),
    imageId: schemas.FileID.nullable()
      .describe('Replace the post image. Omit to keep the current image; pass null to remove it.')
      .optional(),
    sendNotification: z
      .boolean()
      .default(false)
      .optional()
      .describe(
        'Re-notify group members about the edit. Defaults to false so corrections stay quiet.'
      ),
  });

export const GroupPostDeleteInputSchema = GroupPostTargetSchema.extend({
  postId: schemas.NotificationID.describe('Post ID to delete.'),
});

export const GroupPostWriteOutputSchema = z.object({
  status: z.enum(['created', 'updated', 'deleted']),
  groupId: schemas.GroupID,
  postId: schemas.NotificationID.optional(),
  /** True when update merged missing fields from the existing post instead of replacing blind. */
  mergedFromExisting: z.boolean().optional(),
  post: GroupPostSummarySchema.nullable().optional(),
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
  events: z.array(ApiObjectSchema),
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
  event: ApiObjectSchema.nullable().optional(),
});

export const GroupEventNextInputSchema = GroupShapeSchema.extend({
  groupId: schemas.GroupID.optional(),
  shortCode: z.string().optional(),
});

export const GroupEventNextOutputSchema = z.object({
  groupId: schemas.GroupID,
  stale: z.boolean(),
  event: ApiObjectSchema.nullable().optional(),
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
    })
  ),
  events: z.array(ApiObjectSchema),
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
export type GroupInstanceSummary = z.infer<typeof GroupInstanceSummarySchema>;
export type GroupMemberSummary = z.infer<typeof GroupMemberSchema>;
export type GroupSearchInput = z.infer<typeof GroupSearchInputSchema>;
export type GroupSearchOutput = z.infer<typeof GroupSearchOutputSchema>;
export type GroupProfileInput = z.infer<typeof GroupProfileInputSchema>;
export type GroupMembersInput = z.input<typeof GroupMembersInputSchema>;
export type GroupRolesInput = z.infer<typeof GroupRolesInputSchema>;
export type GroupRolesManageInput = z.infer<typeof GroupRolesManageInputSchema>;
export type GroupRoleSummary = z.infer<typeof GroupRoleSummarySchema>;
export type GroupPostsRecentInput = z.infer<typeof GroupPostsRecentInputSchema>;
export type GroupPostCreateInput = z.infer<typeof GroupPostCreateInputSchema>;
export type GroupPostUpdateInput = z.infer<typeof GroupPostUpdateInputSchema>;
export type GroupPostDeleteInput = z.infer<typeof GroupPostDeleteInputSchema>;
export type GroupEventsListInput = z.infer<typeof GroupEventsListInputSchema>;
export type GroupEventGetInput = z.infer<typeof GroupEventGetInputSchema>;
export type GroupEventNextInput = z.infer<typeof GroupEventNextInputSchema>;
export type GroupEventsUpcomingInput = z.infer<typeof GroupEventsUpcomingInputSchema>;
export type GroupInstancesOverviewInput = z.infer<typeof GroupInstancesOverviewInputSchema>;

export type GroupResolution =
  | { ok: true; groupId: string; resolvedBy: 'id' | 'shortCode' }
  | { ok: false; reason: string; status: 'not_found'; nextSteps: string[] };

type LimitedGroupRecord = Partial<z.infer<typeof schemas.LimitedGroup>>;
type GroupPostRecord = Partial<z.infer<typeof schemas.GroupPost>>;
type GroupMemberRecord = Partial<z.infer<typeof schemas.GroupMember>>;
type GroupRoleRecord = Partial<z.infer<typeof schemas.GroupRole>>;
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
    memberCount: typeof group.memberCount === 'number' ? Math.floor(group.memberCount) : undefined,
  };
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
    // The API reads back the role list as singular `roleId` but accepts it as `roleIds`.
    roleIds: Array.isArray(post.roleId) ? post.roleId : undefined,
    imageId: post.imageId ?? undefined,
  };
}

export function toGroupInstanceSummary(instance: GroupInstanceRecord): GroupInstanceSummary | null {
  const instanceId = typeof instance.instanceId === 'string' ? instance.instanceId : '';
  if (!instanceId) return null;
  const worldId = typeof instance.world?.id === 'string' ? instance.world.id : undefined;
  const worldName = typeof instance.world?.name === 'string' ? instance.world.name : undefined;
  return {
    instanceId,
    location: typeof instance.location === 'string' ? instance.location : undefined,
    memberCount: typeof instance.memberCount === 'number' ? instance.memberCount : 0,
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

export function toGroupRoleSummary(role: GroupRoleRecord): GroupRoleSummary | null {
  const roleId = role.id ?? undefined;
  if (!roleId) return null;
  return {
    roleId,
    name: role.name ?? undefined,
    description: role.description ?? undefined,
    order: typeof role.order === 'number' ? role.order : undefined,
    permissions: Array.isArray(role.permissions) ? role.permissions : undefined,
    isManagementRole: role.isManagementRole ?? undefined,
    isSelfAssignable: role.isSelfAssignable ?? undefined,
  };
}
