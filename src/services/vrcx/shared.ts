import { logger } from '../../infra/logger.js';
import { type VrcxDb } from './db.js';
import { resolveVrcxPaths, type VrcxResolvedPaths } from './paths.js';

export type ResolveMode = 'userId' | 'displayName' | 'none';

export type VrcxServiceError =
  | {
      ok: false;
      status: 'disabled';
      reason: string;
    }
  | {
      ok: false;
      status: 'not_available';
      reason: string;
      paths: VrcxResolvedPaths;
    }
  | {
      ok: false;
      status: 'invalid_input';
      reason: string;
    };

export function disabledError(): VrcxServiceError {
  return { ok: false, status: 'disabled', reason: 'VRCX integration is disabled.' };
}

export function notAvailableError(paths: VrcxResolvedPaths): VrcxServiceError {
  const hint = paths.db.path
    ? `VRCX database not found at "${paths.db.path}".`
    : 'VRCX database path could not be resolved.';
  return {
    ok: false,
    status: 'not_available',
    reason: hint,
    paths,
  };
}

export function asString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function asInt(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return null;
  return Math.trunc(parsed);
}

export function safeIso(value: unknown): string | null {
  const raw = asString(value);
  if (!raw) return null;
  const ms = Date.parse(raw);
  if (!Number.isFinite(ms)) return raw;
  return new Date(ms).toISOString();
}

export function computeJoinTime(leaveTimeIso: string | null, durationMs: number): string | null {
  if (!leaveTimeIso) return null;
  const leaveMs = Date.parse(leaveTimeIso);
  if (!Number.isFinite(leaveMs)) return null;
  const joinMs = leaveMs - Math.max(0, durationMs);
  if (!Number.isFinite(joinMs) || joinMs <= 0) return null;
  return new Date(joinMs).toISOString();
}

export function toUserPrefix(userId: string): string | null {
  const raw = userId.replace(/[-_]/g, '');
  if (!raw) return null;
  const prefixed = /^\d/.test(raw) ? `_${raw}` : raw;
  if (!/^[A-Za-z0-9_]+$/.test(prefixed)) return null;
  return prefixed;
}

function readConfigValue(db: VrcxDb, key: string): string | null {
  try {
    const row = db.prepare('SELECT value FROM configs WHERE key = ?').get(key) as
      | { value?: unknown }
      | undefined;
    return asString(row?.value);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.debug('VRCX configs query failed', { message, key });
    return null;
  }
}

export function getActiveUserId(db: VrcxDb): string | null {
  // Stored by VRCX ConfigRepository as config:lastuserloggedin
  return readConfigValue(db, 'config:lastuserloggedin');
}

export function getDatabaseVersion(db: VrcxDb): number | null {
  // Stored by VRCX under config:vrcx_databaseversion
  return asInt(readConfigValue(db, 'config:vrcx_databaseversion'));
}

export function resolveDbOrError(input: {
  enabled: boolean;
  databasePath?: string;
  worldDbPath?: string;
}): { ok: true; paths: VrcxResolvedPaths; dbPath: string } | VrcxServiceError {
  if (!input.enabled) return disabledError();
  const paths = resolveVrcxPaths({
    databasePath: input.databasePath,
    worldDbPath: input.worldDbPath,
  });
  if (!paths.db.exists || !paths.db.path) return notAvailableError(paths);
  return { ok: true, paths, dbPath: paths.db.path };
}

export function fetchLocationInfoMap(
  db: VrcxDb,
  locations: string[]
): Map<
  string,
  {
    worldId?: string;
    worldName?: string;
    groupName?: string | null;
  }
> {
  const map = new Map<
    string,
    { worldId?: string; worldName?: string; groupName?: string | null }
  >();
  const unique = Array.from(new Set(locations.filter(Boolean)));
  if (unique.length === 0) return map;

  try {
    const placeholders = unique.map(() => '?').join(',');
    const rows = db
      .prepare(
        `SELECT gl.location as location, gl.world_id as worldId, gl.world_name as worldName, gl.group_name as groupName
         FROM gamelog_location gl
         JOIN (
           SELECT location, MAX(created_at) as max_created_at
           FROM gamelog_location
           WHERE location IN (${placeholders})
           GROUP BY location
         ) latest
         ON latest.location = gl.location AND latest.max_created_at = gl.created_at`
      )
      .all(...unique) as {
      location?: unknown;
      worldId?: unknown;
      worldName?: unknown;
      groupName?: unknown;
    }[];

    for (const row of rows) {
      const location = asString(row.location);
      if (!location) continue;
      map.set(location, {
        worldId: asString(row.worldId) ?? undefined,
        worldName: asString(row.worldName) ?? undefined,
        groupName: asString(row.groupName) ?? null,
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.debug('VRCX gamelog_location lookup failed', { message });
  }

  return map;
}

export function resolveTarget(
  db: VrcxDb,
  input: { userId?: string; displayName?: string }
): {
  resolvedBy: ResolveMode;
  resolvedUserId: string | null;
  displayName: string | null;
  where: { kind: 'userId' | 'displayName' | 'none'; value?: string };
} {
  const userId = asString(input.userId);
  const displayName = asString(input.displayName);

  if (userId) {
    return {
      resolvedBy: 'userId',
      resolvedUserId: userId,
      displayName: null,
      where: { kind: 'userId', value: userId },
    };
  }

  if (displayName) {
    try {
      const row = db
        .prepare(
          "SELECT user_id as userId FROM gamelog_join_leave WHERE display_name = ? AND user_id != '' ORDER BY id DESC LIMIT 1"
        )
        .get(displayName) as { userId?: unknown } | undefined;
      const resolvedUserId = asString(row?.userId);
      if (resolvedUserId) {
        return {
          resolvedBy: 'displayName',
          resolvedUserId,
          displayName,
          where: { kind: 'userId', value: resolvedUserId },
        };
      }
    } catch {
      // ignore
    }

    return {
      resolvedBy: 'displayName',
      resolvedUserId: null,
      displayName,
      where: { kind: 'displayName', value: displayName },
    };
  }

  return {
    resolvedBy: 'none',
    resolvedUserId: null,
    displayName: null,
    where: { kind: 'none' },
  };
}
