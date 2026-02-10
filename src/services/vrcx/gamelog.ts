import { parseLocation } from '../friends/match.js';
import { withVrcxDb } from './db.js';
import {
  asInt,
  asString,
  computeJoinTime,
  fetchLocationInfoMap,
  getActiveUserId,
  resolveDbOrError,
  safeIso,
  type VrcxServiceError,
} from './shared.js';

export function listRecentWorldVisits(input: {
  enabled: boolean;
  databasePath?: string;
  worldDbPath?: string;
  daysBack?: number;
  limit?: number;
}): Promise<
  | {
      ok: true;
      from: string;
      limit: number;
      total: number;
      truncated: boolean;
      visits: {
        rowId: number;
        createdAt: string;
        location: string;
        worldId?: string;
        worldName?: string;
        groupName?: string | null;
        groupId?: string;
        accessType?: string;
        region?: string;
        timeMs?: number;
      }[];
    }
  | VrcxServiceError
> {
  const resolved = resolveDbOrError(input);
  if (!resolved.ok) return Promise.resolve(resolved);

  const daysBack = typeof input.daysBack === 'number' ? Math.floor(input.daysBack) : 14;
  const limit = typeof input.limit === 'number' ? Math.floor(input.limit) : 100;
  const from = new Date(Date.now() - Math.max(1, daysBack) * 86400000).toISOString();

  return Promise.resolve(
    withVrcxDb(resolved.dbPath, (db) => {
      const rows = db
        .prepare(
          `SELECT id as rowId, created_at as createdAt, location, world_id as worldId, world_name as worldName, time as timeMs, group_name as groupName
         FROM gamelog_location
         WHERE created_at >= ?
           AND location != ''
           AND location != 'traveling'
         ORDER BY id DESC
         LIMIT ?`
        )
        .all(from, limit) as Record<string, unknown>[];

      const visits = rows
        .map((row) => {
          const location = asString(row.location);
          if (!location) return null;
          const createdAt = safeIso(row.createdAt) ?? asString(row.createdAt);
          if (!createdAt) return null;
          const parsed = parseLocation(location);
          const timeMs = asInt(row.timeMs);
          return {
            rowId: asInt(row.rowId) ?? 0,
            createdAt,
            location,
            worldId: asString(row.worldId) ?? parsed.worldId,
            worldName: asString(row.worldName) ?? undefined,
            groupName: asString(row.groupName) ?? null,
            groupId: parsed.groupId,
            accessType: parsed.accessType,
            region: parsed.region,
            timeMs: typeof timeMs === 'number' && timeMs >= 0 ? timeMs : undefined,
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

      return {
        ok: true,
        from,
        limit,
        total: visits.length,
        truncated: visits.length >= limit,
        visits,
      };
    })
  );
}

export function listRecentInstanceSessionsForActiveUser(input: {
  enabled: boolean;
  databasePath?: string;
  worldDbPath?: string;
  daysBack?: number;
  limit?: number;
}): Promise<
  | {
      ok: true;
      from: string;
      limit: number;
      total: number;
      truncated: boolean;
      activeUserId: string;
      sessions: {
        rowId: number;
        location: string;
        joinTime: string | null;
        leaveTime: string;
        durationMs: number;
        worldId?: string;
        worldName?: string;
        groupName?: string | null;
        groupId?: string;
        accessType?: string;
        region?: string;
      }[];
    }
  | VrcxServiceError
> {
  const resolved = resolveDbOrError(input);
  if (!resolved.ok) return Promise.resolve(resolved);

  const daysBack = typeof input.daysBack === 'number' ? Math.floor(input.daysBack) : 14;
  const limit = typeof input.limit === 'number' ? Math.floor(input.limit) : 50;
  const from = new Date(Date.now() - Math.max(1, daysBack) * 86400000).toISOString();

  return Promise.resolve(
    withVrcxDb(resolved.dbPath, (db) => {
      const activeUserId = getActiveUserId(db);
      if (!activeUserId) {
        return {
          ok: false,
          status: 'not_available',
          reason: 'VRCX active userId not found (config:lastuserloggedin missing).',
          paths: resolved.paths,
        } satisfies VrcxServiceError;
      }

      const rows = db
        .prepare(
          `SELECT id as rowId, created_at as createdAt, location, time as durationMs
         FROM gamelog_join_leave
         WHERE type = 'OnPlayerLeft'
           AND user_id = ?
           AND created_at >= ?
           AND location != ''
           AND location != 'traveling'
         ORDER BY id DESC
         LIMIT ?`
        )
        .all(activeUserId, from, limit) as Record<string, unknown>[];

      const locations = rows
        .map((row) => asString(row.location))
        .filter((v): v is string => Boolean(v));
      const locationInfo = fetchLocationInfoMap(db, locations);

      const sessions = rows
        .map((row) => {
          const location = asString(row.location);
          if (!location) return null;
          const leaveTime = safeIso(row.createdAt) ?? asString(row.createdAt);
          if (!leaveTime) return null;
          const durationMs = Math.max(0, asInt(row.durationMs) ?? 0);
          const joinTime = computeJoinTime(leaveTime, durationMs);
          const parsed = parseLocation(location);
          const meta = locationInfo.get(location);
          return {
            rowId: asInt(row.rowId) ?? 0,
            location,
            joinTime,
            leaveTime,
            durationMs,
            worldId: meta?.worldId ?? parsed.worldId,
            worldName: meta?.worldName,
            groupName: meta?.groupName ?? null,
            groupId: parsed.groupId,
            accessType: parsed.accessType,
            region: parsed.region,
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

      return {
        ok: true,
        from,
        limit,
        total: sessions.length,
        truncated: sessions.length >= limit,
        activeUserId,
        sessions,
      };
    })
  );
}
