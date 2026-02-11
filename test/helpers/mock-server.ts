import OpenAPIBackend, {
  type Context,
  type OpenAPIBackend as OpenAPIBackendType,
  type Request as OpenApiRequest,
} from 'openapi-backend';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { pathToFileURL } from 'node:url';
import { readFile } from 'node:fs/promises';
import { z, type ZodType } from 'zod';
import YAML from 'yaml';
import addFormats from 'ajv-formats';
import type Ajv from 'ajv';
import { schemas } from '../../src/generated/vrchat-schemas.js';
import { mockData } from '../fixtures/mock-data/index.js';
import { mockSchema } from '../fixtures/mock-data/builders.js';
import type * as MockTypes from './mock-types.js';

export type { MockServer } from './mock-types.js';

type MockContext = Context<
  unknown,
  Record<string, string>,
  Record<string, string | string[]>,
  Record<string, string | string[]>,
  Record<string, string>
>;

type ZodSchema<T> = ZodType<T>;

const ConfigSchema = schemas.APIConfig as ZodSchema<MockTypes.MockConfig>;
const SystemTimeSchema = z.string() as ZodSchema<MockTypes.MockSystemTime>;
const UserSchema = schemas.User as ZodSchema<MockTypes.MockUser>;
const CurrentUserSchema = schemas.CurrentUser as ZodSchema<MockTypes.MockCurrentUser>;
const FriendSchema = schemas.LimitedUserFriend as ZodSchema<MockTypes.MockFriend>;
const FriendStatusSchema = schemas.FriendStatus as ZodSchema<MockTypes.MockFriendStatus>;
const NotificationSchema = schemas.Notification as ZodSchema<MockTypes.MockNotification>;
const InviteMessageSchema = schemas.InviteMessage as ZodSchema<MockTypes.MockInviteMessage>;
const WorldSchema = schemas.World as ZodSchema<MockTypes.MockWorld>;
const FavoritedWorldSchema = schemas.FavoritedWorld as ZodSchema<MockTypes.MockFavoritedWorld>;
const InstanceSchema = schemas.Instance as ZodSchema<MockTypes.MockInstance>;
const AvatarSchema = schemas.Avatar as ZodSchema<MockTypes.MockAvatar>;
const FavoriteSchema = schemas.Favorite as ZodSchema<MockTypes.MockFavorite>;
const FavoriteGroupSchema = schemas.FavoriteGroup as ZodSchema<MockTypes.MockFavoriteGroup>;
const FavoriteLimitsSchema = schemas.FavoriteLimits as ZodSchema<MockTypes.MockFavoriteLimits>;
const GroupSchema = schemas.Group as ZodSchema<MockTypes.MockGroup>;
const GroupMemberSchema = schemas.GroupMember as ZodSchema<MockTypes.MockGroupMember>;
const GroupRoleSchema = schemas.GroupRole as ZodSchema<MockTypes.MockGroupRole>;
const GroupPermissionSchema = schemas.GroupPermission as ZodSchema<MockTypes.MockGroupPermission>;
const GroupAnnouncementSchema =
  schemas.GroupAnnouncement as ZodSchema<MockTypes.MockGroupAnnouncement>;
const GroupPostSchema = schemas.GroupPost as ZodSchema<MockTypes.MockGroupPost>;
const GroupInstanceSchema = schemas.GroupInstance as ZodSchema<MockTypes.MockGroupInstance>;
const CalendarEventSchema = schemas.CalendarEvent as ZodSchema<MockTypes.MockCalendarEvent>;

const DEFAULT_SPEC_URL = new URL('../../specs/vrchat-openapi.yaml', import.meta.url);
const FALLBACK_SPEC_URL = new URL('../fixtures/spec.yaml', import.meta.url);

type ResponseCarrier = ServerResponse & {
  __mockPayload?: unknown;
  __mockStatus?: number;
};

async function loadSpec(specPath?: string | URL): Promise<unknown> {
  const target =
    specPath === undefined
      ? DEFAULT_SPEC_URL
      : typeof specPath === 'string'
        ? pathToFileURL(specPath)
        : specPath;

  let text: string;
  try {
    text = await readFile(target, 'utf8');
  } catch (err) {
    if (specPath === undefined && (err as { code?: string }).code === 'ENOENT') {
      text = await readFile(FALLBACK_SPEC_URL, 'utf8');
    } else {
      throw err;
    }
  }

  return YAML.parse(text);
}

function parseArray<T>(schema: ZodSchema<T>, value: unknown, label: string): T[] {
  try {
    return schema.array().parse(value ?? []);
  } catch (err) {
    throw new Error(`Invalid ${label} data: ${(err as Error).message}`);
  }
}

function parseRecordArray<T>(
  schema: ZodSchema<T>,
  value: unknown,
  label: string
): Record<string, T[]> {
  if (!value || typeof value !== 'object') {
    throw new Error(`Invalid ${label} data: expected object.`);
  }
  const out: Record<string, T[]> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    out[key] = parseArray(schema, entry, `${label}.${key}`);
  }
  return out;
}

function parseMockData(raw: unknown): MockTypes.MockData {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Mock data is missing or invalid.');
  }
  const record = raw as Record<string, unknown>;

  const config = ConfigSchema.parse(record.config);
  const systemTime = SystemTimeSchema.parse(record.systemTime);
  const currentUser = CurrentUserSchema.parse(record.currentUser);
  const users = parseArray(UserSchema, record.users, 'users');
  const friends = parseArray(FriendSchema, record.friends, 'friends');
  const friendStatuses = (record.friendStatuses ?? {}) as Record<string, unknown>;
  const parsedFriendStatuses: Record<string, MockTypes.MockFriendStatus> = {};
  for (const [key, value] of Object.entries(friendStatuses)) {
    parsedFriendStatuses[key] = FriendStatusSchema.parse(value);
  }
  const notifications = parseArray(NotificationSchema, record.notifications, 'notifications');
  const inviteMessages = parseArray(InviteMessageSchema, record.inviteMessages, 'inviteMessages');
  const worlds = parseArray(WorldSchema, record.worlds, 'worlds');
  const favoritedWorlds = parseArray(
    FavoritedWorldSchema,
    record.favoritedWorlds,
    'favoritedWorlds'
  );
  const avatars = parseArray(AvatarSchema, record.avatars, 'avatars');
  const favorites = parseArray(FavoriteSchema, record.favorites, 'favorites');
  const favoriteGroups = parseArray(FavoriteGroupSchema, record.favoriteGroups, 'favoriteGroups');
  const favoriteLimits = FavoriteLimitsSchema.parse(record.favoriteLimits);

  const instancesRaw = record.instances;
  if (!instancesRaw || typeof instancesRaw !== 'object') {
    throw new Error('Mock instances are missing or invalid.');
  }
  const instances: Record<string, MockTypes.MockInstance> = {};
  for (const [key, value] of Object.entries(instancesRaw as Record<string, unknown>)) {
    instances[key] = InstanceSchema.parse(value);
  }

  const instancesByShortName = (record.instancesByShortName ?? {}) as Record<string, string>;
  const recentLocations = (record.recentLocations ?? []) as string[];

  const groups = parseArray(GroupSchema, record.groups, 'groups');
  const groupMembers = parseRecordArray(GroupMemberSchema, record.groupMembers, 'groupMembers');
  const groupRoles = parseRecordArray(GroupRoleSchema, record.groupRoles, 'groupRoles');
  const groupPermissions = parseRecordArray(
    GroupPermissionSchema,
    record.groupPermissions,
    'groupPermissions'
  );
  const groupAnnouncements = parseRecordArray(
    GroupAnnouncementSchema,
    record.groupAnnouncements,
    'groupAnnouncements'
  );
  const groupPosts = parseRecordArray(GroupPostSchema, record.groupPosts, 'groupPosts');
  const groupInstances = parseRecordArray(
    GroupInstanceSchema,
    record.groupInstances,
    'groupInstances'
  );

  const calendarEvents = parseArray(CalendarEventSchema, record.calendarEvents, 'calendarEvents');
  const calendarFeatured = parseArray(
    CalendarEventSchema,
    record.calendarFeatured,
    'calendarFeatured'
  );
  const calendarFollowed = parseArray(
    CalendarEventSchema,
    record.calendarFollowed,
    'calendarFollowed'
  );
  const calendarGroupEvents = parseRecordArray(
    CalendarEventSchema,
    record.calendarGroupEvents,
    'calendarGroupEvents'
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
    favoritedWorlds,
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

function firstValue(value: unknown): unknown {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseNumber(value: unknown): number | undefined {
  const candidate = firstValue(value);
  if (typeof candidate === 'number' && Number.isFinite(candidate)) {
    return Math.floor(candidate);
  }
  if (candidate === undefined || candidate === null) return undefined;
  if (typeof candidate !== 'string') return undefined;
  const parsed = Number(candidate);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.floor(parsed);
}

function parseBoolean(value: unknown): boolean | undefined {
  const candidate = firstValue(value);
  if (typeof candidate === 'boolean') return candidate;
  if (candidate === undefined || candidate === null) return undefined;
  if (typeof candidate !== 'string') return undefined;
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
  const limit =
    parseNumber(getQueryValue(query, 'n')) ??
    parseNumber(getQueryValue(query, 'number')) ??
    items.length;
  return items.slice(offset, offset + limit);
}

function applyPaginatedList<T>(
  items: T[],
  query: unknown
): { results: T[]; totalCount: number; hasNext: boolean } {
  const offset = parseNumber(getQueryValue(query, 'offset')) ?? 0;
  const limit =
    parseNumber(getQueryValue(query, 'n')) ??
    parseNumber(getQueryValue(query, 'number')) ??
    items.length;
  const results = items.slice(offset, offset + limit);
  return {
    results,
    totalCount: items.length,
    hasNext: offset + limit < items.length,
  };
}

function applySearch<T>(items: T[], query: unknown, keys: (keyof T)[], param = 'search'): T[] {
  const term = firstValue(getQueryValue(query, param));
  if (typeof term !== 'string' || !term) return items;
  const normalized = term.toLowerCase();
  return items.filter((item) =>
    keys.some((key) => {
      const value = item[key];
      if (typeof value !== 'string') return false;
      return value.toLowerCase().includes(normalized);
    })
  );
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  const carrier = res as ResponseCarrier;
  carrier.__mockPayload = payload;
  carrier.__mockStatus = status;
  res.statusCode = status;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(payload));
}

function buildError(status: number, message: string) {
  return { error: { message, status_code: status } };
}

function sendError(res: ServerResponse, status: number, message: string, details?: unknown) {
  const base = buildError(status, message);
  const payload = details === undefined ? base : { ...base, details };
  sendJson(res, status, payload);
}

export interface MockServerOptions {
  specPath?: string | URL;
}

export async function createMockServer(
  options: MockServerOptions = {}
): Promise<MockTypes.MockServer> {
  const spec = await loadSpec(options.specPath);
  const data = parseMockData(mockData);
  let instanceCounter = Object.keys(data.instances).length;
  let notificationCounter = data.notifications.length;
  let calendarCounter =
    data.calendarEvents.length +
    data.calendarFeatured.length +
    data.calendarFollowed.length +
    Object.values(data.calendarGroupEvents).reduce((sum, list) => sum + list.length, 0);

  const api = new OpenAPIBackend({
    definition: spec,
    strict: false,
    validate: true,
    // Skip OpenAPI definition validation; VRChat spec fails schema validation.
    quick: true,
    coerceTypes: true,
    customizeAjv: (ajv: Ajv): Ajv => {
      addFormats(ajv);
      return ajv;
    },
  }) as OpenAPIBackendType;

  api.registerSecurityHandler('authCookie', () => true);
  api.registerSecurityHandler('authHeader', () => true);
  api.registerSecurityHandler('twoFactorAuthCookie', () => true);

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
        sendError(toResponse(res), 404, 'User not found');
        return;
      }
      sendJson(toResponse(res), 200, user);
    },
    getUserByName: (c, _req, res) => {
      const context = toContext(c);
      const username = getParamValue(context.request.params, 'username');
      const user = data.users.find((entry) => entry.username === username);
      if (!user) {
        sendError(toResponse(res), 404, 'User not found');
        return;
      }
      sendJson(toResponse(res), 200, user);
    },
    updateUser: (c, _req, res) => {
      const context = toContext(c);
      const userId = getParamValue(context.request.params, 'userId');
      const body = context.request.body as Record<string, unknown> | undefined;
      if (!userId) {
        sendError(toResponse(res), 400, 'Missing userId');
        return;
      }
      if (!body || typeof body !== 'object') {
        sendError(toResponse(res), 400, 'Missing body');
        return;
      }
      if (data.currentUser.id !== userId) {
        sendError(toResponse(res), 403, 'Forbidden');
        return;
      }
      Object.assign(data.currentUser, body);
      const userIndex = data.users.findIndex((entry) => entry.id === userId);
      if (userIndex >= 0) {
        Object.assign(data.users[userIndex], body);
      }
      sendJson(toResponse(res), 200, data.currentUser);
    },
    searchUsers: (c, _req, res) => {
      const context = toContext(c);
      const query = context.request.query;
      const matches = applySearch(data.users, query, ['displayName', 'username']);
      sendJson(toResponse(res), 200, applyPagination(matches, query));
    },
    searchGroups: (c, _req, res) => {
      const context = toContext(c);
      const query = context.request.query;
      const matches = applySearch(data.groups, query, ['name'], 'query');
      sendJson(toResponse(res), 200, applyPagination(matches, query));
    },
    getUserGroups: (_c, _req, res) => {
      const groups = data.groups.map((group) => ({
        groupId: group.id,
        name: group.name,
        shortCode: group.shortCode,
      }));
      sendJson(toResponse(res), 200, groups);
    },
    getUserGroupRequests: (_c, _req, res) => {
      sendJson(toResponse(res), 200, data.groups.slice(0, 1));
    },
    getUserRepresentedGroup: (_c, _req, res) => {
      const group = data.groups[0];
      if (!group) {
        sendError(toResponse(res), 404, 'Group not found');
        return;
      }
      sendJson(toResponse(res), 200, group);
    },
    getFriends: (c, _req, res) => {
      const context = toContext(c);
      const query = context.request.query;
      const offlineOnly = parseBoolean(getQueryValue(query, 'offline')) ?? false;
      const filtered = offlineOnly
        ? data.friends.filter((friend) => {
            const location = typeof friend.location === 'string' ? friend.location : '';
            const status = typeof friend.status === 'string' ? friend.status : '';
            return location === 'offline' || status === 'offline';
          })
        : data.friends.filter((friend) => {
            const location = typeof friend.location === 'string' ? friend.location : '';
            const status = typeof friend.status === 'string' ? friend.status : '';
            return location !== 'offline' && status !== 'offline';
          });
      sendJson(toResponse(res), 200, applyPagination(filtered, query));
    },
    getFriendStatus: (c, _req, res) => {
      const context = toContext(c);
      const userId = getParamValue(context.request.params, 'userId');
      if (!userId) {
        sendError(toResponse(res), 400, 'Missing userId');
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
        sendError(toResponse(res), 404, 'Notification not found');
        return;
      }
      sendJson(toResponse(res), 200, notification);
    },
    getWorld: (c, _req, res) => {
      const context = toContext(c);
      const worldId = getParamValue(context.request.params, 'worldId');
      const world = data.worlds.find((entry) => entry.id === worldId);
      if (!world) {
        sendError(toResponse(res), 404, 'World not found');
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
      sendJson(toResponse(res), 200, applyPagination(data.favoritedWorlds, context.request.query));
    },
    getInstance: (c, _req, res) => {
      const context = toContext(c);
      const worldId = getParamValue(context.request.params, 'worldId');
      const instanceId = getParamValue(context.request.params, 'instanceId');
      const key = worldId && instanceId ? `${worldId}:${instanceId}` : '';
      const instance = key ? data.instances[key] : undefined;
      if (!instance) {
        sendError(toResponse(res), 404, 'Instance not found');
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
        sendError(toResponse(res), 404, 'Instance not found');
        return;
      }
      sendJson(toResponse(res), 200, instance);
    },
    getRecentLocations: (c, _req, res) => {
      const context = toContext(c);
      sendJson(toResponse(res), 200, applyPagination(data.recentLocations, context.request.query));
    },
    createInstance: (c, _req, res) => {
      const context = toContext(c);
      const body = context.request.body as Record<string, unknown> | undefined;
      const worldId = typeof body?.worldId === 'string' ? body.worldId : undefined;
      if (!worldId) {
        sendError(toResponse(res), 400, 'Missing worldId');
        return;
      }
      instanceCounter += 1;
      const instanceId = `inst_mock_${instanceCounter}`;
      const location = `${worldId}:${instanceId}`;
      const world = data.worlds.find((entry) => entry.id === worldId);
      const instance = mockSchema<MockTypes.MockInstance>('Instance', {
        id: location,
        instanceId,
        location,
        worldId,
        world: world ? { id: world.id, name: world.name } : undefined,
        ownerId: typeof body?.ownerId === 'string' ? body.ownerId : undefined,
        type: typeof body?.type === 'string' ? body.type : undefined,
        region: typeof body?.region === 'string' ? body.region : undefined,
        displayName: typeof body?.displayName === 'string' ? body.displayName : undefined,
      });
      data.instances[location] = instance;
      sendJson(toResponse(res), 200, instance);
    },
    inviteMyselfTo: (c, _req, res) => {
      const context = toContext(c);
      const worldId = getParamValue(context.request.params, 'worldId');
      const instanceId = getParamValue(context.request.params, 'instanceId');
      if (!worldId || !instanceId) {
        sendError(toResponse(res), 400, 'Missing worldId or instanceId');
        return;
      }
      notificationCounter += 1;
      const id = `not_${notificationCounter.toString().padStart(4, '0')}`;
      const message = `Invite myself to ${worldId}:${instanceId}`;
      const storedNotification = mockSchema<MockTypes.MockNotification>('Notification', {
        id,
        type: 'invite',
        message,
      });
      const sentNotification = mockSchema<MockTypes.MockSentNotification>('SentNotification', {
        id,
        type: 'invite',
        message,
        details: {},
      });
      data.notifications.push(storedNotification);
      sendJson(toResponse(res), 200, sentNotification);
    },
    inviteUser: (c, _req, res) => {
      const context = toContext(c);
      const userId = getParamValue(context.request.params, 'userId');
      const body = context.request.body as Record<string, unknown> | undefined;
      const instanceId = typeof body?.instanceId === 'string' ? body.instanceId : undefined;
      if (!userId || !instanceId) {
        sendError(toResponse(res), 400, 'Missing userId or instanceId');
        return;
      }
      notificationCounter += 1;
      const id = `not_${notificationCounter.toString().padStart(4, '0')}`;
      const message = `Invite ${userId} to ${instanceId}`;
      const storedNotification = mockSchema<MockTypes.MockNotification>('Notification', {
        id,
        type: 'invite',
        message,
      });
      const sentNotification = mockSchema<MockTypes.MockSentNotification>('SentNotification', {
        id,
        type: 'invite',
        message,
        details: {},
      });
      data.notifications.push(storedNotification);
      sendJson(toResponse(res), 200, sentNotification);
    },
    getAvatar: (c, _req, res) => {
      const context = toContext(c);
      const avatarId = getParamValue(context.request.params, 'avatarId');
      const avatar = data.avatars.find((entry) => entry.id === avatarId);
      if (!avatar) {
        sendError(toResponse(res), 404, 'Avatar not found');
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
        sendError(toResponse(res), 404, 'Group not found');
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
        sendError(toResponse(res), 404, 'Group member not found');
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
      const announcements = data.groupAnnouncements[groupId] ?? [];
      sendJson(toResponse(res), 200, applyPagination(announcements, context.request.query));
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
      sendJson(toResponse(res), 200, applyPagination(data.calendarFeatured, context.request.query));
    },
    getFollowedCalendarEvents: (c, _req, res) => {
      const context = toContext(c);
      sendJson(toResponse(res), 200, applyPagination(data.calendarFollowed, context.request.query));
    },
    searchCalendarEvents: (c, _req, res) => {
      const context = toContext(c);
      const query = context.request.query;
      const matches = applySearch(data.calendarEvents, query, ['title'], 'searchTerm');
      sendJson(toResponse(res), 200, applyPaginatedList(matches, query));
    },
    getGroupCalendarEvents: (c, _req, res) => {
      const context = toContext(c);
      const groupId = getParamValue(context.request.params, 'groupId') ?? '';
      const events = data.calendarGroupEvents[groupId] ?? [];
      sendJson(toResponse(res), 200, applyPaginatedList(events, context.request.query));
    },
    getGroupCalendarEvent: (c, _req, res) => {
      const context = toContext(c);
      const groupId = getParamValue(context.request.params, 'groupId') ?? '';
      const calendarId = getParamValue(context.request.params, 'calendarId');
      const events = data.calendarGroupEvents[groupId] ?? [];
      const event = events.find((entry) => entry.id === calendarId);
      if (!event) {
        sendError(toResponse(res), 404, 'Calendar event not found');
        return;
      }
      sendJson(toResponse(res), 200, event);
    },
    createGroupCalendarEvent: (c, _req, res) => {
      const context = toContext(c);
      const groupId = getParamValue(context.request.params, 'groupId') ?? '';
      const body = context.request.body as Record<string, unknown> | undefined;
      if (!groupId) {
        sendError(toResponse(res), 400, 'Missing groupId');
        return;
      }
      calendarCounter += 1;
      const eventId = `cal_grp_mock_${calendarCounter}`;
      const startsAt = typeof body?.startsAt === 'string' ? body.startsAt : '2025-12-22T20:00:00Z';
      const endsAt = typeof body?.endsAt === 'string' ? body.endsAt : '2025-12-22T21:00:00Z';
      const event = mockSchema<MockTypes.MockCalendarEvent>('CalendarEvent', {
        id: eventId,
        groupId,
        title: typeof body?.title === 'string' ? body.title : 'Mock Group Event',
        description: typeof body?.description === 'string' ? body.description : 'Mock event',
        category: typeof body?.category === 'string' ? body.category : 'meetup',
        startsAt,
        endsAt,
        accessType: typeof body?.accessType === 'string' ? body.accessType : 'group',
      });
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
        sendError(toResponse(res), 404, 'Calendar event not found');
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
        sendError(toResponse(res), 404, 'Calendar event not found');
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
        (entry) => entry.userId === userId && entry.messageType === messageType
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
          entry.userId === userId && entry.messageType === messageType && entry.slot === slot
      );
      if (!match) {
        sendError(toResponse(res), 404, 'Invite message not found');
        return;
      }
      sendJson(toResponse(res), 200, match);
    },
    createThing: (_c, _req, res) => {
      sendJson(toResponse(res), 200, { ok: true });
    },
    notFound: (_c, _req, res) => {
      sendError(toResponse(res), 404, 'Not found');
    },
    validationFail: (c, _req, res) => {
      const context = toContext(c);
      sendError(toResponse(res), 400, 'Validation failed', context.validation.errors);
    },
    postResponseHandler: (c, _req, res: ServerResponse) => {
      const response = res as ResponseCarrier;
      const payload: unknown = response.__mockPayload ?? (c.response as unknown);
      const statusCode = response.__mockStatus ?? response.statusCode;
      if (payload !== undefined && c.operation) {
        const validation = c.api.validateResponse(payload, c.operation, statusCode);
        if (validation.errors?.length) {
          console.warn(
            `[mock] Response validation failed for ${c.operation.operationId} (${statusCode})`,
            validation.errors
          );
        }
      }
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
