import { parseLocation } from '../friends/match.js';
import { withVrcxDb } from './db.js';
import {
  asInt,
  asString,
  computeJoinTime,
  fetchLocationInfoMap,
  resolveDbOrError,
  resolveTarget,
  safeIso,
  type ResolveMode,
  type VrcxServiceError,
} from './shared.js';

export function getUserRelationshipSummary(input: {
  enabled: boolean;
  databasePath?: string;
  worldDbPath?: string;
  userId?: string;
  displayName?: string;
}): Promise<
  | {
      ok: true;
      query: { userId?: string; displayName?: string };
      resolvedBy: ResolveMode;
      resolvedUserId: string | null;
      displayName: string | null;
      lastSeen: string | null;
      joinCount: number;
      timeSpentMs: number;
      timeSpentHours: number;
      hasData: boolean;
    }
  | VrcxServiceError
> {
  const resolved = resolveDbOrError(input);
  if (!resolved.ok) return Promise.resolve(resolved);

  return Promise.resolve(
    withVrcxDb(resolved.dbPath, (db) => {
      const target = resolveTarget(db, { userId: input.userId, displayName: input.displayName });
      if (target.where.kind === 'none') {
        return {
          ok: false,
          status: 'invalid_input',
          reason: 'Provide userId or displayName.',
        } satisfies VrcxServiceError;
      }

      const queryWhere =
        target.where.kind === 'userId'
          ? { sql: 'user_id = ?', value: target.where.value! }
          : { sql: 'display_name = ?', value: target.where.value! };

      const statsRow = db
        .prepare(
          `SELECT
           MAX(created_at) as lastSeen,
           SUM(CASE WHEN type = 'OnPlayerLeft' THEN COALESCE(time, 0) ELSE 0 END) as timeSpentMs,
           COUNT(DISTINCT location) as joinCount
         FROM gamelog_join_leave
         WHERE ${queryWhere.sql}
           AND location != ''
           AND location != 'traveling'`
        )
        .get(queryWhere.value) as
        | { lastSeen?: unknown; timeSpentMs?: unknown; joinCount?: unknown }
        | undefined;

      let lastDisplayName: string | null = null;
      if (target.resolvedUserId) {
        try {
          const nameRow = db
            .prepare(
              'SELECT display_name as displayName FROM gamelog_join_leave WHERE user_id = ? ORDER BY id DESC LIMIT 1'
            )
            .get(target.resolvedUserId) as { displayName?: unknown } | undefined;
          lastDisplayName = asString(nameRow?.displayName);
        } catch {
          // ignore
        }
      }

      const lastSeen = safeIso(statsRow?.lastSeen);
      const timeSpentMs = Math.max(0, asInt(statsRow?.timeSpentMs) ?? 0);
      const joinCount = Math.max(0, asInt(statsRow?.joinCount) ?? 0);
      const timeSpentHours = timeSpentMs / 1000 / 60 / 60;
      const hasData = Boolean(lastSeen) || timeSpentMs > 0 || joinCount > 0;

      return {
        ok: true,
        query: {
          userId: asString(input.userId) ?? undefined,
          displayName: asString(input.displayName) ?? undefined,
        },
        resolvedBy: target.resolvedBy,
        resolvedUserId: target.resolvedUserId,
        displayName: lastDisplayName ?? target.displayName,
        lastSeen,
        joinCount,
        timeSpentMs,
        timeSpentHours,
        hasData,
      };
    })
  );
}

export function listUserRelationshipSessions(input: {
  enabled: boolean;
  databasePath?: string;
  worldDbPath?: string;
  userId?: string;
  displayName?: string;
  limit?: number;
}): Promise<
  | {
      ok: true;
      query: { userId?: string; displayName?: string };
      resolvedBy: ResolveMode;
      resolvedUserId: string | null;
      total: number;
      limit: number;
      truncated: boolean;
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
        displayName?: string;
      }[];
    }
  | VrcxServiceError
> {
  const resolved = resolveDbOrError(input);
  if (!resolved.ok) return Promise.resolve(resolved);

  const limit = typeof input.limit === 'number' ? Math.floor(input.limit) : 50;

  return Promise.resolve(
    withVrcxDb(resolved.dbPath, (db) => {
      const target = resolveTarget(db, { userId: input.userId, displayName: input.displayName });
      if (target.where.kind === 'none') {
        return {
          ok: false,
          status: 'invalid_input',
          reason: 'Provide userId or displayName.',
        } satisfies VrcxServiceError;
      }

      const queryWhere =
        target.where.kind === 'userId'
          ? { sql: 'user_id = ?', value: target.where.value! }
          : { sql: 'display_name = ?', value: target.where.value! };

      const rows = db
        .prepare(
          `SELECT id as rowId, created_at as createdAt, display_name as displayName, location, time as durationMs
         FROM gamelog_join_leave
         WHERE type = 'OnPlayerLeft'
           AND ${queryWhere.sql}
           AND location != ''
           AND location != 'traveling'
         ORDER BY id DESC
         LIMIT ?`
        )
        .all(queryWhere.value, limit) as Record<string, unknown>[];

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
            displayName: asString(row.displayName) ?? undefined,
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

      return {
        ok: true,
        query: {
          userId: asString(input.userId) ?? undefined,
          displayName: asString(input.displayName) ?? undefined,
        },
        resolvedBy: target.resolvedBy,
        resolvedUserId: target.resolvedUserId,
        total: sessions.length,
        limit,
        truncated: sessions.length >= limit,
        sessions,
      };
    })
  );
}
