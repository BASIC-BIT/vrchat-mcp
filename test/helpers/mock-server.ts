import OpenAPIBackend, {
  type Context,
  type OpenAPIBackend as OpenAPIBackendType,
  type Request as OpenApiRequest,
} from 'openapi-backend';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { readFile } from 'node:fs/promises';
import type { z } from 'zod';
import YAML from 'yaml';
import { schemas } from '../generated/mock-schemas.js';

interface MockConfig {
  clientApiKey: string;
}

interface MockSystemTime {
  time: string;
}

interface MockUser {
  id: string;
  displayName: string;
  username?: string;
}

interface MockFriend {
  id: string;
  displayName: string;
  location?: string;
  status?: string;
}

interface MockFriendStatus {
  status: string;
}

interface MockNotification {
  id: string;
  type: string;
  message?: string;
}

interface MockInviteMessage {
  id: string;
  userId: string;
  messageType: string;
  slot: number;
  message?: string;
}

interface MockWorld {
  id: string;
  name: string;
}

interface MockInstance {
  id: string;
  world?: MockWorld;
}

interface MockAvatar {
  id: string;
  name: string;
}

interface MockFavorite {
  id: string;
  type: string;
  favoriteId: string;
}

interface MockFavoriteGroup {
  id: string;
  name: string;
  type: string;
}

interface MockFavoriteLimits {
  maxFavorites: number;
  maxFavoriteGroups: number;
}

interface MockGroup {
  id: string;
  name: string;
}

interface MockGroupMember {
  userId: string;
  displayName: string;
  roleId?: string;
}

interface MockGroupRole {
  id: string;
  name: string;
}

interface MockGroupPermission {
  id: string;
  name: string;
}

interface MockGroupAnnouncement {
  id: string;
  title: string;
}

interface MockGroupPost {
  id: string;
  title: string;
}

interface MockGroupInstance {
  id: string;
  worldId: string;
  instanceId: string;
}

interface MockCalendarEvent {
  id: string;
  title: string;
  groupId?: string;
}

export interface MockData {
  config: MockConfig;
  systemTime: MockSystemTime;
  currentUser: MockUser;
  users: MockUser[];
  friends: MockFriend[];
  friendStatuses: Record<string, MockFriendStatus>;
  notifications: MockNotification[];
  inviteMessages: MockInviteMessage[];
  worlds: MockWorld[];
  avatars: MockAvatar[];
  favorites: MockFavorite[];
  favoriteGroups: MockFavoriteGroup[];
  favoriteLimits: MockFavoriteLimits;
  instances: Record<string, MockInstance>;
  instancesByShortName: Record<string, string>;
  recentLocations: string[];
  groups: MockGroup[];
  groupMembers: Record<string, MockGroupMember[]>;
  groupRoles: Record<string, MockGroupRole[]>;
  groupPermissions: Record<string, MockGroupPermission[]>;
  groupAnnouncements: Record<string, MockGroupAnnouncement[]>;
  groupPosts: Record<string, MockGroupPost[]>;
  groupInstances: Record<string, MockGroupInstance[]>;
  calendarEvents: MockCalendarEvent[];
  calendarFeatured: MockCalendarEvent[];
  calendarFollowed: MockCalendarEvent[];
  calendarGroupEvents: Record<string, MockCalendarEvent[]>;
}

export interface MockServer {
  baseUrl: string;
  data: MockData;
  close: () => Promise<void>;
}

type MockContext = Context<
  unknown,
  Record<string, string>,
  Record<string, string | string[]>,
  Record<string, string | string[]>,
  Record<string, string>
>;

type ZodSchema<T> = z.ZodType<T>;

const ConfigSchema = schemas.Config as ZodSchema<MockConfig>;
const SystemTimeSchema = schemas.SystemTime as ZodSchema<MockSystemTime>;
const UserSchema = schemas.User as ZodSchema<MockUser>;
const FriendSchema = schemas.Friend as ZodSchema<MockFriend>;
const FriendStatusSchema = schemas.FriendStatus as ZodSchema<MockFriendStatus>;
const NotificationSchema = schemas.Notification as ZodSchema<MockNotification>;
const InviteMessageSchema = schemas.InviteMessage as ZodSchema<MockInviteMessage>;
const WorldSchema = schemas.World as ZodSchema<MockWorld>;
const InstanceSchema = schemas.Instance as ZodSchema<MockInstance>;
const AvatarSchema = schemas.Avatar as ZodSchema<MockAvatar>;
const FavoriteSchema = schemas.Favorite as ZodSchema<MockFavorite>;
const FavoriteGroupSchema = schemas.FavoriteGroup as ZodSchema<MockFavoriteGroup>;
const FavoriteLimitsSchema = schemas.FavoriteLimits as ZodSchema<MockFavoriteLimits>;
const GroupSchema = schemas.Group as ZodSchema<MockGroup>;
const GroupMemberSchema = schemas.GroupMember as ZodSchema<MockGroupMember>;
const GroupRoleSchema = schemas.GroupRole as ZodSchema<MockGroupRole>;
const GroupPermissionSchema = schemas.GroupPermission as ZodSchema<MockGroupPermission>;
const GroupAnnouncementSchema = schemas.GroupAnnouncement as ZodSchema<MockGroupAnnouncement>;
const GroupPostSchema = schemas.GroupPost as ZodSchema<MockGroupPost>;
const GroupInstanceSchema = schemas.GroupInstance as ZodSchema<MockGroupInstance>;
const CalendarEventSchema = schemas.CalendarEvent as ZodSchema<MockCalendarEvent>;

const SPEC_URL = new URL('../fixtures/spec.yaml', import.meta.url);
const DATA_URL = new URL('../fixtures/mock-data.json', import.meta.url);

async function loadSpec(): Promise<unknown> {
  const text = await readFile(SPEC_URL, 'utf8');
  return YAML.parse(text);
}

function parseArray<T>(schema: ZodSchema<T>, value: unknown, label: string): T[] {
  try {
    return schema.array().parse(value ?? []);
  } catch (err) {
    throw new Error(`Invalid ${label} data: ${(err as Error).message}`);
  }
}

function parseRecordArray<T>(schema: ZodSchema<T>, value: unknown, label: string): Record<string, T[]> {
  if (!value || typeof value !== 'object') {
    throw new Error(`Invalid ${label} data: expected object.`);
  }
  const out: Record<string, T[]> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    out[key] = parseArray(schema, entry, `${label}.${key}`);
  }
  return out;
}

function parseMockData(raw: unknown): MockData {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Mock data is missing or invalid.');
  }
  const record = raw as Record<string, unknown>;

  const config = ConfigSchema.parse(record.config);
  const systemTime = SystemTimeSchema.parse(record.systemTime);
  const currentUser = UserSchema.parse(record.currentUser);
  const users = parseArray(UserSchema, record.users, 'users');
  const friends = parseArray(FriendSchema, record.friends, 'friends');
  const friendStatuses = (record.friendStatuses ?? {}) as Record<string, unknown>;
  const parsedFriendStatuses: Record<string, MockFriendStatus> = {};
  for (const [key, value] of Object.entries(friendStatuses)) {
    parsedFriendStatuses[key] = FriendStatusSchema.parse(value);
  }
  const notifications = parseArray(NotificationSchema, record.notifications, 'notifications');
  const inviteMessages = parseArray(InviteMessageSchema, record.inviteMessages, 'inviteMessages');
  const worlds = parseArray(WorldSchema, record.worlds, 'worlds');
  const avatars = parseArray(AvatarSchema, record.avatars, 'avatars');
  const favorites = parseArray(FavoriteSchema, record.favorites, 'favorites');
  const favoriteGroups = parseArray(FavoriteGroupSchema, record.favoriteGroups, 'favoriteGroups');
  const favoriteLimits = FavoriteLimitsSchema.parse(record.favoriteLimits);

  const instancesRaw = record.instances;
  if (!instancesRaw || typeof instancesRaw !== 'object') {
    throw new Error('Mock instances are missing or invalid.');
  }
  const instances: Record<string, MockInstance> = {};
  for (const [key, value] of Object.entries(instancesRaw as Record<string, unknown>)) {
    instances[key] = InstanceSchema.parse(value);
  }

  const instancesByShortName = (record.instancesByShortName ?? {}) as Record<string, string>;
  const recentLocations = (record.recentLocations ?? []) as string[];

  const groups = parseArray(GroupSchema, record.groups, 'groups');
  const groupMembers = parseRecordArray(GroupMemberSchema, record.groupMembers, 'groupMembers');
  const groupRoles = parseRecordArray(GroupRoleSchema, record.groupRoles, 'groupRoles');
  const groupPermissions = parseRecordArray(GroupPermissionSchema, record.groupPermissions, 'groupPermissions');
  const groupAnnouncements = parseRecordArray(
    GroupAnnouncementSchema,
    record.groupAnnouncements,
    'groupAnnouncements',
  );
  const groupPosts = parseRecordArray(GroupPostSchema, record.groupPosts, 'groupPosts');
  const groupInstances = parseRecordArray(GroupInstanceSchema, record.groupInstances, 'groupInstances');

  const calendarEvents = parseArray(CalendarEventSchema, record.calendarEvents, 'calendarEvents');
  const calendarFeatured = parseArray(
    CalendarEventSchema,
    record.calendarFeatured,
    'calendarFeatured',
  );
  const calendarFollowed = parseArray(
    CalendarEventSchema,
    record.calendarFollowed,
    'calendarFollowed',
  );
  const calendarGroupEvents = parseRecordArray(
    CalendarEventSchema,
    record.calendarGroupEvents,
    'calendarGroupEvents',
  );

  return {
    config,
    systemTime,
    currentUser,
    users,
    friends,
    friendStatuses: parsedFriendStatuses,
    notifications,
    inviteMessages,
    worlds,
    avatars,
    favorites,
    favoriteGroups,
    favoriteLimits,
    instances,
    instancesByShortName,
    recentLocations,
    groups,
    groupMembers,
    groupRoles,
    groupPermissions,
    groupAnnouncements,
    groupPosts,
    groupInstances,
    calendarEvents,
    calendarFeatured,
    calendarFollowed,
    calendarGroupEvents,
  };
}

async function loadMockData(): Promise<MockData> {
  const text = await readFile(DATA_URL, 'utf8');
  const raw = JSON.parse(text) as unknown;
  return parseMockData(raw);
}

function toContext(value: unknown): MockContext {
  return value as MockContext;
}

function toResponse(value: unknown): ServerResponse {
  return value as ServerResponse;
}

function readBody(req: IncomingMessage): Promise<unknown> {
  if (!req.method || ['GET', 'HEAD'].includes(req.method)) {
    return Promise.resolve(undefined);
  }
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => {
      const safeChunk = chunk as unknown;
      const buffer = Buffer.isBuffer(safeChunk)
        ? safeChunk
        : Buffer.from(typeof safeChunk === 'string' ? safeChunk : String(safeChunk));
      chunks.push(buffer);
    });
    req.on('end', () => {
      if (chunks.length === 0) {
        resolve(undefined);
        return;
      }
      const text = Buffer.concat(chunks).toString('utf8');
      const contentType = req.headers['content-type'] ?? '';
      if (contentType.includes('application/json')) {
        try {
          resolve(JSON.parse(text));
        } catch {
          resolve(text);
        }
        return;
      }
      resolve(text);
    });
    req.on('error', reject);
  });
}

function normalizeHeaders(headers: IncomingMessage['headers']): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined) result[key] = value;
  }
  return result;
}

function parseQuery(url: URL): Record<string, string | string[]> | undefined {
  const result: Record<string, string | string[]> = {};
  for (const key of url.searchParams.keys()) {
    const values = url.searchParams.getAll(key);
    if (values.length === 0) continue;
    result[key] = values.length === 1 ? values[0] : values;
  }
  return Object.keys(result).length ? result : undefined;
}

function firstValue(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
}

function parseNumber(value: unknown): number | undefined {
  const candidate = firstValue(value);
  if (candidate === undefined) return undefined;
  const parsed = Number(candidate);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.floor(parsed);
}

function parseBoolean(value: unknown): boolean | undefined {
  const candidate = firstValue(value);
  if (candidate === undefined) return undefined;
  const normalized = candidate.toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  return undefined;
}

function getQueryValue(query: unknown, key: string): unknown {
  if (!query || typeof query !== 'object') return undefined;
  return (query as Record<string, unknown>)[key];
}

function getParamValue(params: unknown, key: string): string | undefined {
  if (!params || typeof params !== 'object') return undefined;
  const value = (params as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : undefined;
}

function applyPagination<T>(items: T[], query: unknown): T[] {
  const offset = parseNumber(getQueryValue(query, 'offset')) ?? 0;
  const limit = parseNumber(getQueryValue(query, 'n')) ?? items.length;
  return items.slice(offset, offset + limit);
}

function applySearch<T>(items: T[], query: unknown, keys: (keyof T)[], param = 'search'): T[] {
  const term = firstValue(getQueryValue(query, param));
  if (!term) return items;
  const normalized = term.toLowerCase();
  return items.filter((item) =>
    keys.some((key) => {
      const value = item[key];
      if (typeof value !== 'string') return false;
      return value.toLowerCase().includes(normalized);
    }),
  );
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(payload));
}

export async function createMockServer(): Promise<MockServer> {
  const [spec, data] = await Promise.all([loadSpec(), loadMockData()]);
  let instanceCounter = Object.keys(data.instances).length;
  let notificationCounter = data.notifications.length;
  let calendarCounter = data.calendarEvents.length
    + data.calendarFeatured.length
    + data.calendarFollowed.length
    + Object.values(data.calendarGroupEvents).reduce(
        (sum, list) => sum + list.length,
        0,
      );

  const api = new OpenAPIBackend({
    definition: spec,
    strict: false,
    validate: false,
  }) as OpenAPIBackendType;

  api.register({
    getConfig: (_c, _req, res) => {
      sendJson(toResponse(res), 200, data.config);
    },
    getSystemTime: (_c, _req, res) => {
      sendJson(toResponse(res), 200, data.systemTime);
    },
    getCurrentUser: (_c, _req, res) => {
      sendJson(toResponse(res), 200, data.currentUser);
    },
    getUser: (c, _req, res) => {
      const context = toContext(c);
      const userId = getParamValue(context.request.params, 'userId');
      const user = data.users.find((entry) => entry.id === userId);
      if (!user) {
        sendJson(toResponse(res), 404, { error: 'User not found' });
        return;
      }
      sendJson(toResponse(res), 200, user);
    },
    getUserByName: (c, _req, res) => {
      const context = toContext(c);
      const username = getParamValue(context.request.params, 'username');
      const user = data.users.find((entry) => entry.username === username);
      if (!user) {
        sendJson(toResponse(res), 404, { error: 'User not found' });
        return;
      }
      sendJson(toResponse(res), 200, user);
    },
    searchUsers: (c, _req, res) => {
      const context = toContext(c);
      const query = context.request.query;
      const matches = applySearch(data.users, query, ['displayName', 'username']);
      sendJson(toResponse(res), 200, applyPagination(matches, query));
    },
    getUserGroups: (_c, _req, res) => {
      sendJson(toResponse(res), 200, data.groups);
    },
    getUserGroupRequests: (_c, _req, res) => {
      sendJson(toResponse(res), 200, data.groups.slice(0, 1));
    },
    getUserRepresentedGroup: (_c, _req, res) => {
      const group = data.groups[0];
      if (!group) {
        sendJson(toResponse(res), 404, { error: 'Group not found' });
        return;
      }
      sendJson(toResponse(res), 200, group);
    },
    getFriends: (c, _req, res) => {
      const context = toContext(c);
      const query = context.request.query;
      const includeOffline = parseBoolean(getQueryValue(query, 'offline')) ?? false;
      const filtered = includeOffline
        ? data.friends
        : data.friends.filter((friend) => friend.location !== 'offline');
      sendJson(toResponse(res), 200, applyPagination(filtered, query));
    },
    getFriendStatus: (c, _req, res) => {
      const context = toContext(c);
      const userId = getParamValue(context.request.params, 'userId');
      if (!userId) {
        sendJson(toResponse(res), 400, { error: 'Missing userId' });
        return;
      }
      const status = data.friendStatuses[userId] ?? { status: 'unknown' };
      sendJson(toResponse(res), 200, status);
    },
    getUserFriends: (_c, _req, res) => {
      sendJson(toResponse(res), 200, data.friends);
    },
    getNotifications: (c, _req, res) => {
      const context = toContext(c);
      const query = context.request.query;
      sendJson(toResponse(res), 200, applyPagination(data.notifications, query));
    },
    getNotification: (c, _req, res) => {
      const context = toContext(c);
      const notificationId = getParamValue(context.request.params, 'notificationId');
      const notification = data.notifications.find((entry) => entry.id === notificationId);
      if (!notification) {
        sendJson(toResponse(res), 404, { error: 'Notification not found' });
        return;
      }
      sendJson(toResponse(res), 200, notification);
    },
    getWorld: (c, _req, res) => {
      const context = toContext(c);
      const worldId = getParamValue(context.request.params, 'worldId');
      const world = data.worlds.find((entry) => entry.id === worldId);
      if (!world) {
        sendJson(toResponse(res), 404, { error: 'World not found' });
        return;
      }
      sendJson(toResponse(res), 200, world);
    },
    searchWorlds: (c, _req, res) => {
      const context = toContext(c);
      const query = context.request.query;
      const matches = applySearch(data.worlds, query, ['name']);
      sendJson(toResponse(res), 200, applyPagination(matches, query));
    },
    getActiveWorlds: (c, _req, res) => {
      const context = toContext(c);
      sendJson(toResponse(res), 200, applyPagination(data.worlds, context.request.query));
    },
    getRecentWorlds: (c, _req, res) => {
      const context = toContext(c);
      sendJson(toResponse(res), 200, applyPagination(data.worlds, context.request.query));
    },
    getFavoritedWorlds: (c, _req, res) => {
      const context = toContext(c);
      sendJson(toResponse(res), 200, applyPagination(data.worlds, context.request.query));
    },
    getInstance: (c, _req, res) => {
      const context = toContext(c);
      const worldId = getParamValue(context.request.params, 'worldId');
      const instanceId = getParamValue(context.request.params, 'instanceId');
      const key = worldId && instanceId ? `${worldId}:${instanceId}` : '';
      const instance = key ? data.instances[key] : undefined;
      if (!instance) {
        sendJson(toResponse(res), 404, { error: 'Instance not found' });
        return;
      }
      sendJson(toResponse(res), 200, instance);
    },
    getInstanceByShortName: (c, _req, res) => {
      const context = toContext(c);
      const shortName = getParamValue(context.request.params, 'shortName');
      const key = shortName ? data.instancesByShortName[shortName] : undefined;
      const instance = key ? data.instances[key] : undefined;
      if (!instance) {
        sendJson(toResponse(res), 404, { error: 'Instance not found' });
        return;
      }
      sendJson(toResponse(res), 200, instance);
    },
    getRecentLocations: (c, _req, res) => {
      const context = toContext(c);
      sendJson(
        toResponse(res),
        200,
        applyPagination(data.recentLocations, context.request.query),
      );
    },
    createInstance: (c, _req, res) => {
      const context = toContext(c);
      const body = context.request.body as Record<string, unknown> | undefined;
      const worldId = typeof body?.worldId === 'string' ? body.worldId : undefined;
      if (!worldId) {
        sendJson(toResponse(res), 400, { error: 'Missing worldId' });
        return;
      }
      instanceCounter += 1;
      const instanceId = `inst_mock_${instanceCounter}`;
      const location = `${worldId}:${instanceId}`;
      const world = data.worlds.find((entry) => entry.id === worldId);
      const instance = {
        id: location,
        instanceId,
        location,
        worldId,
        world: world ? { id: world.id, name: world.name } : undefined,
        ownerId: typeof body?.ownerId === 'string' ? body.ownerId : undefined,
        type: typeof body?.type === 'string' ? body.type : undefined,
        region: typeof body?.region === 'string' ? body.region : undefined,
        displayName: typeof body?.displayName === 'string' ? body.displayName : undefined,
      };
      data.instances[location] = instance;
      sendJson(toResponse(res), 200, instance);
    },
    inviteMyselfTo: (c, _req, res) => {
      const context = toContext(c);
      const worldId = getParamValue(context.request.params, 'worldId');
      const instanceId = getParamValue(context.request.params, 'instanceId');
      if (!worldId || !instanceId) {
        sendJson(toResponse(res), 400, { error: 'Missing worldId or instanceId' });
        return;
      }
      notificationCounter += 1;
      const notification = {
        id: `notif_mock_${notificationCounter}`,
        type: 'invite',
        message: `Invite myself to ${worldId}:${instanceId}`,
      };
      data.notifications.push(notification);
      sendJson(toResponse(res), 200, notification);
    },
    inviteUser: (c, _req, res) => {
      const context = toContext(c);
      const userId = getParamValue(context.request.params, 'userId');
      const body = context.request.body as Record<string, unknown> | undefined;
      const instanceId = typeof body?.instanceId === 'string' ? body.instanceId : undefined;
      if (!userId || !instanceId) {
        sendJson(toResponse(res), 400, { error: 'Missing userId or instanceId' });
        return;
      }
      notificationCounter += 1;
      const notification = {
        id: `notif_mock_${notificationCounter}`,
        type: 'invite',
        message: `Invite ${userId} to ${instanceId}`,
      };
      data.notifications.push(notification);
      sendJson(toResponse(res), 200, notification);
    },
    getAvatar: (c, _req, res) => {
      const context = toContext(c);
      const avatarId = getParamValue(context.request.params, 'avatarId');
      const avatar = data.avatars.find((entry) => entry.id === avatarId);
      if (!avatar) {
        sendJson(toResponse(res), 404, { error: 'Avatar not found' });
        return;
      }
      sendJson(toResponse(res), 200, avatar);
    },
    searchAvatars: (c, _req, res) => {
      const context = toContext(c);
      const query = context.request.query;
      const matches = applySearch(data.avatars, query, ['name']);
      sendJson(toResponse(res), 200, applyPagination(matches, query));
    },
    getFavoritedAvatars: (c, _req, res) => {
      const context = toContext(c);
      sendJson(toResponse(res), 200, applyPagination(data.avatars, context.request.query));
    },
    getFavorites: (c, _req, res) => {
      const context = toContext(c);
      const query = context.request.query;
      const typeValue = firstValue(getQueryValue(query, 'type'));
      const filtered = typeValue
        ? data.favorites.filter((entry) => entry.type === typeValue)
        : data.favorites;
      sendJson(toResponse(res), 200, applyPagination(filtered, query));
    },
    getFavoriteGroups: (c, _req, res) => {
      const context = toContext(c);
      sendJson(toResponse(res), 200, applyPagination(data.favoriteGroups, context.request.query));
    },
    getFavoriteLimits: (_c, _req, res) => {
      sendJson(toResponse(res), 200, data.favoriteLimits);
    },
    getGroup: (c, _req, res) => {
      const context = toContext(c);
      const groupId = getParamValue(context.request.params, 'groupId');
      const group = data.groups.find((entry) => entry.id === groupId);
      if (!group) {
        sendJson(toResponse(res), 404, { error: 'Group not found' });
        return;
      }
      sendJson(toResponse(res), 200, group);
    },
    getGroupMembers: (c, _req, res) => {
      const context = toContext(c);
      const groupId = getParamValue(context.request.params, 'groupId') ?? '';
      const members = data.groupMembers[groupId] ?? [];
      sendJson(toResponse(res), 200, applyPagination(members, context.request.query));
    },
    getGroupMember: (c, _req, res) => {
      const context = toContext(c);
      const groupId = getParamValue(context.request.params, 'groupId') ?? '';
      const userId = getParamValue(context.request.params, 'userId');
      const members = data.groupMembers[groupId] ?? [];
      const member = members.find((entry) => entry.userId === userId);
      if (!member) {
        sendJson(toResponse(res), 404, { error: 'Group member not found' });
        return;
      }
      sendJson(toResponse(res), 200, member);
    },
    getGroupRoles: (c, _req, res) => {
      const context = toContext(c);
      const groupId = getParamValue(context.request.params, 'groupId') ?? '';
      sendJson(toResponse(res), 200, data.groupRoles[groupId] ?? []);
    },
    getGroupPermissions: (c, _req, res) => {
      const context = toContext(c);
      const groupId = getParamValue(context.request.params, 'groupId') ?? '';
      sendJson(toResponse(res), 200, data.groupPermissions[groupId] ?? []);
    },
    getGroupAnnouncements: (c, _req, res) => {
      const context = toContext(c);
      const groupId = getParamValue(context.request.params, 'groupId') ?? '';
      sendJson(toResponse(res), 200, data.groupAnnouncements[groupId] ?? []);
    },
    getGroupPosts: (c, _req, res) => {
      const context = toContext(c);
      const groupId = getParamValue(context.request.params, 'groupId') ?? '';
      const posts = data.groupPosts[groupId] ?? [];
      sendJson(toResponse(res), 200, applyPagination(posts, context.request.query));
    },
    getGroupInstances: (c, _req, res) => {
      const context = toContext(c);
      const groupId = getParamValue(context.request.params, 'groupId') ?? '';
      sendJson(toResponse(res), 200, data.groupInstances[groupId] ?? []);
    },
    getCalendarEvents: (c, _req, res) => {
      const context = toContext(c);
      sendJson(toResponse(res), 200, applyPagination(data.calendarEvents, context.request.query));
    },
    getFeaturedCalendarEvents: (c, _req, res) => {
      const context = toContext(c);
      sendJson(
        toResponse(res),
        200,
        applyPagination(data.calendarFeatured, context.request.query),
      );
    },
    getFollowedCalendarEvents: (c, _req, res) => {
      const context = toContext(c);
      sendJson(
        toResponse(res),
        200,
        applyPagination(data.calendarFollowed, context.request.query),
      );
    },
    searchCalendarEvents: (c, _req, res) => {
      const context = toContext(c);
      const query = context.request.query;
      const matches = applySearch(data.calendarEvents, query, ['title'], 'searchTerm');
      sendJson(toResponse(res), 200, applyPagination(matches, query));
    },
    getGroupCalendarEvents: (c, _req, res) => {
      const context = toContext(c);
      const groupId = getParamValue(context.request.params, 'groupId') ?? '';
      const events = data.calendarGroupEvents[groupId] ?? [];
      sendJson(toResponse(res), 200, applyPagination(events, context.request.query));
    },
    getGroupCalendarEvent: (c, _req, res) => {
      const context = toContext(c);
      const groupId = getParamValue(context.request.params, 'groupId') ?? '';
      const calendarId = getParamValue(context.request.params, 'calendarId');
      const events = data.calendarGroupEvents[groupId] ?? [];
      const event = events.find((entry) => entry.id === calendarId);
      if (!event) {
        sendJson(toResponse(res), 404, { error: 'Calendar event not found' });
        return;
      }
      sendJson(toResponse(res), 200, event);
    },
    createGroupCalendarEvent: (c, _req, res) => {
      const context = toContext(c);
      const groupId = getParamValue(context.request.params, 'groupId') ?? '';
      const body = context.request.body as Record<string, unknown> | undefined;
      if (!groupId) {
        sendJson(toResponse(res), 400, { error: 'Missing groupId' });
        return;
      }
      calendarCounter += 1;
      const eventId = `cal_grp_mock_${calendarCounter}`;
      const startsAt = typeof body?.startsAt === 'string' ? body.startsAt : '2025-12-22T20:00:00Z';
      const endsAt = typeof body?.endsAt === 'string' ? body.endsAt : '2025-12-22T21:00:00Z';
      const event = {
        id: eventId,
        groupId,
        title: typeof body?.title === 'string' ? body.title : 'Mock Group Event',
        description: typeof body?.description === 'string' ? body.description : 'Mock event',
        category: typeof body?.category === 'string' ? body.category : 'meetup',
        startsAt,
        endsAt,
        accessType: typeof body?.accessType === 'string' ? body.accessType : 'group',
      };
      if (!data.calendarGroupEvents[groupId]) {
        data.calendarGroupEvents[groupId] = [];
      }
      data.calendarGroupEvents[groupId].push(event);
      sendJson(toResponse(res), 200, event);
    },
    updateGroupCalendarEvent: (c, _req, res) => {
      const context = toContext(c);
      const groupId = getParamValue(context.request.params, 'groupId') ?? '';
      const calendarId = getParamValue(context.request.params, 'calendarId') ?? '';
      const body = context.request.body as Record<string, unknown> | undefined;
      const events = data.calendarGroupEvents[groupId] ?? [];
      const event = events.find((entry) => entry.id === calendarId);
      if (!event) {
        sendJson(toResponse(res), 404, { error: 'Calendar event not found' });
        return;
      }
      if (typeof body?.title === 'string') event.title = body.title;
      if (typeof body?.description === 'string') event.description = body.description;
      if (typeof body?.category === 'string') event.category = body.category;
      if (typeof body?.startsAt === 'string') event.startsAt = body.startsAt;
      if (typeof body?.endsAt === 'string') event.endsAt = body.endsAt;
      sendJson(toResponse(res), 200, event);
    },
    deleteGroupCalendarEvent: (c, _req, res) => {
      const context = toContext(c);
      const groupId = getParamValue(context.request.params, 'groupId') ?? '';
      const calendarId = getParamValue(context.request.params, 'calendarId') ?? '';
      const events = data.calendarGroupEvents[groupId] ?? [];
      const index = events.findIndex((entry) => entry.id === calendarId);
      if (index === -1) {
        sendJson(toResponse(res), 404, { error: 'Calendar event not found' });
        return;
      }
      events.splice(index, 1);
      sendJson(toResponse(res), 200, { status: 'success' });
    },
    getInviteMessages: (c, _req, res) => {
      const context = toContext(c);
      const userId = getParamValue(context.request.params, 'userId');
      const messageType = getParamValue(context.request.params, 'messageType');
      const matches = data.inviteMessages.filter(
        (entry) => entry.userId === userId && entry.messageType === messageType,
      );
      sendJson(toResponse(res), 200, matches);
    },
    getInviteMessage: (c, _req, res) => {
      const context = toContext(c);
      const userId = getParamValue(context.request.params, 'userId');
      const messageType = getParamValue(context.request.params, 'messageType');
      const slotValue = getParamValue(context.request.params, 'slot');
      const slot = slotValue ? Number(slotValue) : NaN;
      const match = data.inviteMessages.find(
        (entry) =>
          entry.userId === userId &&
          entry.messageType === messageType &&
          entry.slot === slot,
      );
      if (!match) {
        sendJson(toResponse(res), 404, { error: 'Invite message not found' });
        return;
      }
      sendJson(toResponse(res), 200, match);
    },
    createThing: (_c, _req, res) => {
      sendJson(toResponse(res), 200, { ok: true });
    },
    notFound: (_c, _req, res) => {
      sendJson(toResponse(res), 404, { error: 'Not found' });
    },
    validationFail: (c, _req, res) => {
      const context = toContext(c);
      sendJson(toResponse(res), 400, {
        error: 'Validation failed',
        details: context.validation.errors,
      });
    },
  });

  await api.init();

  const server = createServer((req, res) => {
    void (async () => {
      try {
        const url = new URL(req.url ?? '/', `http://${req.headers.host ?? '127.0.0.1'}`);
        const body = await readBody(req);
        const request: OpenApiRequest = {
          method: req.method ?? 'GET',
          path: url.pathname,
          query: parseQuery(url),
          headers: normalizeHeaders(req.headers),
          body,
        };
        await api.handleRequest(request, req, res);
      } catch (err) {
        sendJson(toResponse(res), 500, {
          error: 'Mock server error',
          message: (err as Error).message,
        });
      }
    })();
  });

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });

  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  return {
    baseUrl,
    data,
    close: async () => {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    },
  };
}
