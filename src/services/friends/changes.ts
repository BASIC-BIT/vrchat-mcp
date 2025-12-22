import { getConfig } from '../../config/index.js';
import { cacheManager } from '../cache.js';
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
  content: unknown;
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

function extractUserId(content: Record<string, unknown>): string | undefined {
  const userId = content.userId ?? content.userid ?? content.userID;
  if (typeof userId === 'string' && userId.length > 0) return userId;
  const user = content.user;
  if (user && typeof user === 'object') {
    const id = (user as Record<string, unknown>).id;
    if (typeof id === 'string' && id.length > 0) return id;
  }
  return undefined;
}

function extractUser(content: Record<string, unknown>): Record<string, unknown> | undefined {
  const user = content.user;
  if (user && typeof user === 'object') return user as Record<string, unknown>;
  return undefined;
}

function extractLocation(content: Record<string, unknown>): string | undefined {
  const location = content.location ?? content.travelingToLocation;
  if (typeof location === 'string' && location.length > 0) return location;
  return undefined;
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
    user?: Record<string, unknown>;
    location?: string;
    platform?: string;
    canRequestInvite?: boolean;
  },
  type: FriendEventType,
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
    (base as Record<string, unknown>).platform = payload.platform;
  }
  if (payload.canRequestInvite !== undefined) {
    (base as Record<string, unknown>).canRequestInvite = payload.canRequestInvite;
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
    user?: Record<string, unknown>;
    location?: string;
    platform?: string;
    canRequestInvite?: boolean;
  },
  includeOffline: boolean,
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

  record(change: Omit<FriendChange, 'sequence' | 'receivedAt'> & { receivedAt?: string }): FriendChange {
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
    const changedIds = Array.from(
      new Set(limited.map((event) => event.userId).filter(Boolean)),
    );
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
  const content =
    event.content && typeof event.content === 'object'
      ? (event.content as Record<string, unknown>)
      : {};
  const userId = extractUserId(content);
  if (!userId) return null;
  const user = extractUser(content);
  const location = extractLocation(content);
  const displayName =
    typeof user?.displayName === 'string' ? user.displayName : undefined;
  const platform =
    typeof content.platform === 'string' ? content.platform : undefined;
  const canRequestInvite =
    typeof content.canRequestInvite === 'boolean' ? content.canRequestInvite : undefined;

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
  const content =
    event.content && typeof event.content === 'object'
      ? (event.content as Record<string, unknown>)
      : {};
  const userId = extractUserId(content);
  if (!userId) return 0;
  const payload = {
    userId,
    user: extractUser(content),
    location: extractLocation(content),
    platform: typeof content.platform === 'string' ? content.platform : undefined,
    canRequestInvite:
      typeof content.canRequestInvite === 'boolean' ? content.canRequestInvite : undefined,
  };

  const updateEntry =
    (includeOffline: boolean) => (value: FriendsFetchResult) => {
    if (!value || typeof value !== 'object') return undefined;
    if (!Array.isArray(value.friends)) return undefined;
    const result = applyFriendEventToList(value.friends, event.type as FriendEventType, payload, includeOffline);
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
