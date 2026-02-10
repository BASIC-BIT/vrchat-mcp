import { getConfig } from '../../config/index.js';
import { cacheManager } from '../cache.js';
import { isJsonObject, type JsonObject, type JsonValue } from '../../utils/json.js';
import type { FriendRecord, FriendsFetchResult } from './fetch.js';

export type FriendEventType =
  | 'friend-add'
  | 'friend-delete'
  | 'friend-online'
  | 'friend-offline'
  | 'friend-update'
  | 'friend-location'
  | 'friend-active';

export interface FriendPipelineEvent {
  type: string;
  content: JsonValue;
  receivedAt: string;
}

export interface FriendChange {
  sequence: number;
  receivedAt: string;
  type: FriendEventType;
  userId: string;
  displayName?: string;
  location?: string;
  platform?: string;
  canRequestInvite?: boolean;
}

export interface FriendChangeSnapshot {
  after: number;
  nextAfter: number;
  truncated: boolean;
  changedIds: string[];
  events: FriendChange[];
}

const MAX_BUFFER = getConfig().pipeline.changeBuffer;
const FRIEND_STATUS_VALUES = new Set(['active', 'offline', 'ask me', 'busy', 'join me']);

function isFriendStatus(value: string): value is NonNullable<FriendRecord['status']> {
  return FRIEND_STATUS_VALUES.has(value);
}

function isFriendEventType(value: string): value is FriendEventType {
  return (
    value === 'friend-add' ||
    value === 'friend-delete' ||
    value === 'friend-online' ||
    value === 'friend-offline' ||
    value === 'friend-update' ||
    value === 'friend-location' ||
    value === 'friend-active'
  );
}

function getStringField(record: JsonObject, key: string): string | undefined {
  const value = record[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function getBooleanField(record: JsonObject, key: string): boolean | undefined {
  const value = record[key];
  return typeof value === 'boolean' ? value : undefined;
}

function getStringArrayField(record: JsonObject, key: string): string[] | undefined {
  const value = record[key];
  if (!Array.isArray(value)) return undefined;
  const items = value.filter((entry): entry is string => typeof entry === 'string');
  return items.length ? items : undefined;
}

function assignFriendStringField(
  payload: Partial<FriendRecord>,
  user: JsonObject,
  key: Extract<keyof FriendRecord, string>
): void {
  const value = getStringField(user, key);
  if (!value) return;
  (payload as Record<string, unknown>)[key] = value;
}

function assignFriendStringArrayField(
  payload: Partial<FriendRecord>,
  user: JsonObject,
  key: Extract<keyof FriendRecord, string>
): void {
  const value = getStringArrayField(user, key);
  if (!value) return;
  (payload as Record<string, unknown>)[key] = value;
}

function assignFriendBooleanField(
  payload: Partial<FriendRecord>,
  user: JsonObject,
  key: Extract<keyof FriendRecord, string>
): void {
  const value = getBooleanField(user, key);
  if (value === undefined) return;
  (payload as Record<string, unknown>)[key] = value;
}

function extractUserId(content: JsonObject): string | undefined {
  const userId =
    getStringField(content, 'userId') ??
    getStringField(content, 'userid') ??
    getStringField(content, 'userID');
  if (userId) return userId;
  const user = content.user;
  if (isJsonObject(user)) {
    const id = getStringField(user, 'id');
    if (id) return id;
  }
  return undefined;
}

function extractUser(content: JsonObject): Partial<FriendRecord> | undefined {
  const user = content.user;
  if (!isJsonObject(user)) return undefined;
  const payload: Partial<FriendRecord> = {};

  assignFriendStringField(payload, user, 'id');
  assignFriendStringField(payload, user, 'displayName');
  const status = getStringField(user, 'status');
  if (status && isFriendStatus(status)) payload.status = status;

  assignFriendStringField(payload, user, 'statusDescription');
  assignFriendStringField(payload, user, 'statusEmoji');
  assignFriendStringField(payload, user, 'location');
  assignFriendStringField(payload, user, 'platform');
  assignFriendStringField(payload, user, 'userIcon');
  assignFriendStringField(payload, user, 'profilePicOverride');
  assignFriendStringField(payload, user, 'currentAvatarImageUrl');
  assignFriendStringField(payload, user, 'currentAvatarThumbnailImageUrl');
  assignFriendStringField(payload, user, 'last_login');
  assignFriendStringField(payload, user, 'last_platform');
  assignFriendStringField(payload, user, 'bio');
  assignFriendStringArrayField(payload, user, 'bioLinks');
  assignFriendStringArrayField(payload, user, 'tags');
  assignFriendStringField(payload, user, 'friendKey');
  assignFriendStringField(payload, user, 'imageUrl');
  assignFriendBooleanField(payload, user, 'isFriend');

  return Object.keys(payload).length > 0 ? payload : undefined;
}

function extractLocation(content: JsonObject): string | undefined {
  const location =
    getStringField(content, 'location') ?? getStringField(content, 'travelingToLocation');
  return location;
}

function isOfflineFriend(record: FriendRecord): boolean {
  const status = typeof record.status === 'string' ? record.status : undefined;
  const location = typeof record.location === 'string' ? record.location : undefined;
  return status === 'offline' || location === 'offline';
}

function buildFriendRecord(
  existing: FriendRecord | undefined,
  userId: string,
  payload: {
    user?: Partial<FriendRecord>;
    location?: string;
    platform?: string;
    canRequestInvite?: boolean;
  },
  type: FriendEventType
): FriendRecord {
  const base: FriendRecord = {
    ...(existing ?? {}),
    id: existing?.id ?? userId,
  };
  if (payload.user) {
    Object.assign(base, payload.user);
  }
  if (payload.location) {
    base.location = payload.location;
  }
  if (payload.platform) {
    base.platform = payload.platform;
  }
  if (payload.canRequestInvite !== undefined) {
    base.canRequestInvite = payload.canRequestInvite;
  }
  if (type === 'friend-offline') {
    base.location = 'offline';
    base.status = 'offline';
  }
  return base;
}

function applyFriendEventToList(
  friends: FriendRecord[],
  type: FriendEventType,
  payload: {
    userId: string;
    user?: Partial<FriendRecord>;
    location?: string;
    platform?: string;
    canRequestInvite?: boolean;
  },
  includeOffline: boolean
): { friends: FriendRecord[]; changed: boolean } {
  const userId = payload.userId;
  const index = friends.findIndex((friend) => String(friend.id ?? '') === userId);
  if (type === 'friend-delete') {
    if (index === -1) return { friends, changed: false };
    const next = friends.slice();
    next.splice(index, 1);
    return { friends: next, changed: true };
  }

  if (type === 'friend-offline' && !includeOffline) {
    if (index === -1) return { friends, changed: false };
    const next = friends.slice();
    next.splice(index, 1);
    return { friends: next, changed: true };
  }

  const existing = index >= 0 ? friends[index] : undefined;
  const updated = buildFriendRecord(existing, userId, payload, type);
  const isOffline = isOfflineFriend(updated);
  if (!includeOffline && isOffline) {
    if (index === -1) return { friends, changed: false };
    const next = friends.slice();
    next.splice(index, 1);
    return { friends: next, changed: true };
  }

  if (index === -1) {
    return { friends: [...friends, updated], changed: true };
  }

  const next = friends.slice();
  next[index] = updated;
  return { friends: next, changed: true };
}

export class FriendsChangeStore {
  private events: FriendChange[] = [];
  private sequence = 0;

  record(
    change: Omit<FriendChange, 'sequence' | 'receivedAt'> & { receivedAt?: string }
  ): FriendChange {
    const next: FriendChange = {
      ...change,
      sequence: (this.sequence += 1),
      receivedAt: change.receivedAt ?? new Date().toISOString(),
    };
    this.events.push(next);
    if (this.events.length > MAX_BUFFER) {
      this.events.splice(0, this.events.length - MAX_BUFFER);
    }
    return next;
  }

  snapshot(after = 0, limit = MAX_BUFFER): FriendChangeSnapshot {
    const filtered = this.events.filter((event) => event.sequence > after);
    const limited = filtered.slice(0, Math.max(1, limit));
    const changedIds = Array.from(new Set(limited.map((event) => event.userId).filter(Boolean)));
    const nextAfter = limited.length ? limited[limited.length - 1].sequence : after;
    return {
      after,
      nextAfter,
      truncated: filtered.length > limited.length,
      changedIds,
      events: limited,
    };
  }
}

export const friendsChangeStore = new FriendsChangeStore();

export function recordFriendChange(event: FriendPipelineEvent): FriendChange | null {
  if (!isFriendEventType(event.type)) return null;
  const content: JsonObject = isJsonObject(event.content) ? event.content : {};
  const userId = extractUserId(content);
  if (!userId) return null;
  const user = extractUser(content);
  const location = extractLocation(content);
  const displayName = typeof user?.displayName === 'string' ? user.displayName : undefined;
  const platform = getStringField(content, 'platform');
  const canRequestInvite = getBooleanField(content, 'canRequestInvite');

  return friendsChangeStore.record({
    type: event.type,
    userId,
    displayName,
    location,
    platform,
    canRequestInvite,
    receivedAt: event.receivedAt,
  });
}

export function applyFriendEventToCache(event: FriendPipelineEvent): number {
  if (!isFriendEventType(event.type)) return 0;
  const content: JsonObject = isJsonObject(event.content) ? event.content : {};
  const userId = extractUserId(content);
  if (!userId) return 0;
  const payload = {
    userId,
    user: extractUser(content),
    location: extractLocation(content),
    platform: getStringField(content, 'platform'),
    canRequestInvite: getBooleanField(content, 'canRequestInvite'),
  };

  const updateEntry = (includeOffline: boolean) => (value: FriendsFetchResult) => {
    if (!value || typeof value !== 'object') return undefined;
    if (!Array.isArray(value.friends)) return undefined;
    const result = applyFriendEventToList(
      value.friends,
      event.type as FriendEventType,
      payload,
      includeOffline
    );
    if (!result.changed) return undefined;
    return {
      ...value,
      friends: result.friends,
      meta: {
        ...value.meta,
        total: result.friends.length,
      },
    };
  };

  const updatedOffline = cacheManager.updateByTag('friends:offline', updateEntry(true));
  const updatedOnline = cacheManager.updateByTag('friends:online', updateEntry(false));
  return updatedOffline + updatedOnline;
}
