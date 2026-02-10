import { withVrcxDb } from './db.js';
import { asString, resolveDbOrError, safeIso, type VrcxServiceError } from './shared.js';

export function getVrcxUserMemo(input: {
  enabled: boolean;
  databasePath?: string;
  worldDbPath?: string;
  userId: string;
}): Promise<
  { ok: true; userId: string; editedAt: string | null; memo: string | null } | VrcxServiceError
> {
  const resolved = resolveDbOrError(input);
  if (!resolved.ok) return Promise.resolve(resolved);

  return Promise.resolve(
    withVrcxDb(resolved.dbPath, (db) => {
      const row = db
        .prepare('SELECT edited_at as editedAt, memo as memo FROM memos WHERE user_id = ?')
        .get(input.userId) as { editedAt?: unknown; memo?: unknown } | undefined;

      return {
        ok: true,
        userId: input.userId,
        editedAt: safeIso(row?.editedAt),
        memo: asString(row?.memo),
      };
    })
  );
}

export function getVrcxWorldMemo(input: {
  enabled: boolean;
  databasePath?: string;
  worldDbPath?: string;
  worldId: string;
}): Promise<
  { ok: true; worldId: string; editedAt: string | null; memo: string | null } | VrcxServiceError
> {
  const resolved = resolveDbOrError(input);
  if (!resolved.ok) return Promise.resolve(resolved);

  return Promise.resolve(
    withVrcxDb(resolved.dbPath, (db) => {
      const row = db
        .prepare('SELECT edited_at as editedAt, memo as memo FROM world_memos WHERE world_id = ?')
        .get(input.worldId) as { editedAt?: unknown; memo?: unknown } | undefined;

      return {
        ok: true,
        worldId: input.worldId,
        editedAt: safeIso(row?.editedAt),
        memo: asString(row?.memo),
      };
    })
  );
}

export function getVrcxAvatarMemo(input: {
  enabled: boolean;
  databasePath?: string;
  worldDbPath?: string;
  avatarId: string;
}): Promise<
  { ok: true; avatarId: string; editedAt: string | null; memo: string | null } | VrcxServiceError
> {
  const resolved = resolveDbOrError(input);
  if (!resolved.ok) return Promise.resolve(resolved);

  return Promise.resolve(
    withVrcxDb(resolved.dbPath, (db) => {
      const row = db
        .prepare('SELECT edited_at as editedAt, memo as memo FROM avatar_memos WHERE avatar_id = ?')
        .get(input.avatarId) as { editedAt?: unknown; memo?: unknown } | undefined;

      return {
        ok: true,
        avatarId: input.avatarId,
        editedAt: safeIso(row?.editedAt),
        memo: asString(row?.memo),
      };
    })
  );
}
