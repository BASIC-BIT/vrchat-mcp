import { withVrcxDb } from './db.js';
import { resolveVrcxPaths, type VrcxResolvedPaths } from './paths.js';
import { getActiveUserId, getDatabaseVersion, toUserPrefix } from './shared.js';

export function getVrcxStatus(input: {
  enabled: boolean;
  databasePath?: string;
  worldDbPath?: string;
}): Promise<{
  enabled: boolean;
  available: boolean;
  paths: VrcxResolvedPaths;
  activeUserId: string | null;
  userPrefix: string | null;
  databaseVersion: number | null;
  warnings: string[];
}> {
  const paths = resolveVrcxPaths({
    databasePath: input.databasePath,
    worldDbPath: input.worldDbPath,
  });

  if (!input.enabled) {
    return Promise.resolve({
      enabled: false,
      available: false,
      paths,
      activeUserId: null,
      userPrefix: null,
      databaseVersion: null,
      warnings: ['VRCX integration disabled by config.'],
    });
  }

  if (!paths.db.exists || !paths.db.path) {
    const hint = paths.db.path
      ? `VRCX database not found at "${paths.db.path}".`
      : 'VRCX database path could not be resolved.';
    return Promise.resolve({
      enabled: true,
      available: false,
      paths,
      activeUserId: null,
      userPrefix: null,
      databaseVersion: null,
      warnings: [hint],
    });
  }

  const result = withVrcxDb(paths.db.path, (db) => {
    const activeUserId = getActiveUserId(db);
    const userPrefix = activeUserId ? toUserPrefix(activeUserId) : null;
    const databaseVersion = getDatabaseVersion(db);
    const warnings: string[] = [];
    if (activeUserId && !userPrefix) {
      warnings.push('Failed to derive userPrefix from activeUserId.');
    }
    return { activeUserId, userPrefix, databaseVersion, warnings };
  });

  return Promise.resolve({
    enabled: true,
    available: true,
    paths,
    activeUserId: result.activeUserId,
    userPrefix: result.userPrefix,
    databaseVersion: result.databaseVersion,
    warnings: result.warnings,
  });
}
