import { z } from 'zod';
import { callOperation } from '../../core/client.js';
import { callReadOperation, type ReadToolOptions } from '../../core/readTools.js';
import { schemas } from '../../generated/vrchat-schemas.js';
import { parseArrayWithSchema, parseWithSchema } from '../../utils/schema.js';
import { parseCalendarEventDiscovery, parseCalendarEvents } from '../events/utils.js';

const UserSchema = schemas.User.partial();
const CurrentUserSchema = schemas.CurrentUser.partial();
const InstanceSchema = schemas.Instance.partial();
const WorldSchema = schemas.World.partial();
const AvatarSchema = schemas.Avatar.partial();
const CalendarEventSchema = schemas.CalendarEvent.partial();
const SentNotificationSchema = schemas.SentNotification.partial();
const FavoriteSchema = schemas.Favorite.partial();
const FavoriteGroupSchema = schemas.FavoriteGroup.partial();
const FavoriteLimitsSchema = schemas.FavoriteLimits.partial();
const GroupRoleSchema = schemas.GroupRole.partial();
const GroupRoleTemplatesSchema = z.record(z.string(), schemas.GroupRoleTemplateValues.partial());

function parseNullable<T>(schema: z.ZodType<T>, value: unknown, label: string): T | null {
  if (value === null || value === undefined) return null;
  return parseWithSchema(schema, value, label);
}

const readParsers = {
  getUser: (data: unknown) => parseNullable(UserSchema, data, 'getUser'),
  getUserByName: (data: unknown) => parseNullable(UserSchema, data, 'getUserByName'),
  getCurrentUser: (data: unknown) => parseNullable(CurrentUserSchema, data, 'getCurrentUser'),
  getInstance: (data: unknown) => parseNullable(InstanceSchema, data, 'getInstance'),
  getWorld: (data: unknown) => parseNullable(WorldSchema, data, 'getWorld'),
  getAvatar: (data: unknown) => parseNullable(AvatarSchema, data, 'getAvatar'),
  searchWorlds: (data: unknown) => parseArrayWithSchema(WorldSchema, data, 'searchWorlds'),
  getFavoritedWorlds: (data: unknown) =>
    parseArrayWithSchema(schemas.FavoritedWorld.partial(), data, 'getFavoritedWorlds'),
  getFavoritedAvatars: (data: unknown) =>
    parseArrayWithSchema(AvatarSchema, data, 'getFavoritedAvatars'),
  getFavorites: (data: unknown) => parseArrayWithSchema(FavoriteSchema, data, 'getFavorites'),
  getFavoriteGroups: (data: unknown) =>
    parseArrayWithSchema(FavoriteGroupSchema, data, 'getFavoriteGroups'),
  getFavoriteGroup: (data: unknown) => parseNullable(FavoriteGroupSchema, data, 'getFavoriteGroup'),
  getFavoriteLimits: (data: unknown) => parseNullable(FavoriteLimitsSchema, data, 'getFavoriteLimits'),
  getFriends: (data: unknown) =>
    parseArrayWithSchema(schemas.LimitedUserFriend.partial(), data, 'getFriends'),
  getNotifications: (data: unknown) =>
    parseArrayWithSchema(schemas.Notification.partial(), data, 'getNotifications'),
  getUserGroups: (data: unknown) =>
    parseArrayWithSchema(schemas.LimitedUserGroups.partial(), data, 'getUserGroups'),
  searchGroups: (data: unknown) =>
    parseArrayWithSchema(schemas.LimitedGroup.partial(), data, 'searchGroups'),
  getGroup: (data: unknown) => parseNullable(schemas.Group.partial(), data, 'getGroup'),
  getGroupMembers: (data: unknown) =>
    parseArrayWithSchema(schemas.GroupMember.partial(), data, 'getGroupMembers'),
  getGroupRoles: (data: unknown) => parseArrayWithSchema(GroupRoleSchema, data, 'getGroupRoles'),
  getGroupRoleTemplates: (data: unknown) =>
    parseWithSchema(GroupRoleTemplatesSchema, data, 'getGroupRoleTemplates'),
  getGroupPosts: (data: unknown) =>
    parseArrayWithSchema(schemas.GroupPost.partial(), data, 'getGroupPosts'),
  getGroupInstances: (data: unknown) =>
    parseArrayWithSchema(
      schemas.GroupInstance.extend({ world: WorldSchema.optional() }).partial(),
      data,
      'getGroupInstances'
    ),
  getCalendarEvents: (data: unknown) => parseCalendarEvents(data),
  searchCalendarEvents: (data: unknown) => parseCalendarEvents(data),
  discoverCalendarEvents: (data: unknown) => parseCalendarEventDiscovery(data),
  getGroupCalendarEvents: (data: unknown) => parseCalendarEvents(data),
  getGroupNextCalendarEvent: (data: unknown) =>
    parseNullable(CalendarEventSchema, data, 'getGroupNextCalendarEvent'),
  getGroupCalendarEvent: (data: unknown) =>
    parseNullable(CalendarEventSchema, data, 'getGroupCalendarEvent'),
} as const;

const writeParsers = {
  createInstance: (data: unknown) => parseNullable(InstanceSchema, data, 'createInstance'),
  inviteMyselfTo: (data: unknown) => parseNullable(SentNotificationSchema, data, 'inviteMyselfTo'),
  inviteUser: (data: unknown) => parseNullable(SentNotificationSchema, data, 'inviteUser'),
  updateUser: (data: unknown) => parseNullable(CurrentUserSchema, data, 'updateUser'),
  createGroupCalendarEvent: (data: unknown) =>
    parseNullable(CalendarEventSchema, data, 'createGroupCalendarEvent'),
  updateGroupCalendarEvent: (data: unknown) =>
    parseNullable(CalendarEventSchema, data, 'updateGroupCalendarEvent'),
  deleteGroupCalendarEvent: (data: unknown) =>
    parseNullable(schemas.Success.partial(), data, 'deleteGroupCalendarEvent'),
  followGroupCalendarEvent: (data: unknown) =>
    parseNullable(CalendarEventSchema, data, 'followGroupCalendarEvent'),
  addFavorite: (data: unknown) => parseNullable(FavoriteSchema, data, 'addFavorite'),
  removeFavorite: (data: unknown) => parseNullable(schemas.Success.partial(), data, 'removeFavorite'),
  addGroupMemberRole: (data: unknown) => parseWithSchema(schemas.GroupRoleIDList, data, 'addGroupMemberRole'),
  removeGroupMemberRole: (data: unknown) =>
    parseWithSchema(schemas.GroupRoleIDList, data, 'removeGroupMemberRole'),
  createGroupRole: (data: unknown) => parseNullable(GroupRoleSchema, data, 'createGroupRole'),
  updateGroupRole: (data: unknown) => parseArrayWithSchema(GroupRoleSchema, data, 'updateGroupRole'),
  deleteGroupRole: (data: unknown) => parseArrayWithSchema(GroupRoleSchema, data, 'deleteGroupRole'),
} as const;

export type ReadOperationId = keyof typeof readParsers;
export type ReadOperationData<K extends ReadOperationId> = ReturnType<(typeof readParsers)[K]>;

export type WriteOperationId = keyof typeof writeParsers;
export type WriteOperationData<K extends WriteOperationId> = ReturnType<(typeof writeParsers)[K]>;

export async function callReadOperationParsed<K extends ReadOperationId>(
  operationId: K,
  params: Record<string, unknown> = {},
  options?: ReadToolOptions
): Promise<{
  data: ReadOperationData<K>;
  url?: string;
  page?: {
    pages: number;
    items: number;
    pageSize: number;
    offsetStart: number;
    truncated: boolean;
  };
}> {
  const result = await callReadOperation(operationId, params, options);
  return {
    ...result,
    data: readParsers[operationId](result.data) as ReadOperationData<K>,
  };
}

export async function callWriteOperationParsed<K extends WriteOperationId>(
  operationId: K,
  params?: Record<string, unknown>,
  body?: unknown
): Promise<{
  data: WriteOperationData<K>;
  url?: string;
  status?: number;
  headers?: Record<string, string>;
}> {
  const result = await callOperation({ operationId, params, body });
  return {
    ...result,
    data: writeParsers[operationId](result.data) as WriteOperationData<K>,
  };
}
