import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { logger } from '../../infra/logger.js';

export type VrcxPathSource = 'config' | 'vrcx_json' | 'default' | 'unknown';

export interface VrcxPathInfo {
  path: string | null;
  exists: boolean;
  source: VrcxPathSource;
}

export interface VrcxResolvedPaths {
  db: VrcxPathInfo;
  worldDb: VrcxPathInfo;
  vrcxJson: { path: string | null; exists: boolean };
}

function fileExists(filePath: string | null | undefined): boolean {
  if (!filePath) return false;
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function toMaybeFilePath(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  return trimmed ? trimmed : null;
}

function readVrcxJsonDatabaseLocation(vrcxJsonPath: string): string | null {
  try {
    const content = fs.readFileSync(vrcxJsonPath, 'utf8');
    const parsed: unknown = JSON.parse(content);
    if (!parsed || typeof parsed !== 'object') return null;
    const record = parsed as Record<string, unknown>;
    const loc = toMaybeFilePath(record.VRCX_DatabaseLocation);
    return loc;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.debug('Failed to read VRCX.json', { vrcxJsonPath, message });
    return null;
  }
}

function normalizeOverridePath(
  overridePath: string,
  baseDir: string | null,
  fileNameForDir: string
): string {
  const raw = overridePath.trim();
  if (!raw) return raw;

  // If a directory was supplied (common user expectation), try the expected filename inside it.
  try {
    if (fs.existsSync(raw) && fs.statSync(raw).isDirectory()) {
      return path.join(raw, fileNameForDir);
    }
  } catch {
    // ignore
  }

  if (!path.isAbsolute(raw) && baseDir) {
    return path.resolve(baseDir, raw);
  }
  return raw;
}

function getDefaultVrcxDirCandidates(): string[] {
  const home = os.homedir();

  if (process.platform === 'win32') {
    const appData = toMaybeFilePath(process.env.APPDATA);
    if (appData) return [path.join(appData, 'VRCX')];
    return [];
  }

  if (process.platform === 'darwin') {
    return [path.join(home, 'Library', 'Application Support', 'VRCX')];
  }

  // Linux (native Electron builds) typically live under ~/.config
  return [path.join(home, '.config', 'VRCX'), path.join(home, '.local', 'share', 'VRCX')];
}

function pickFirstExistingDir(candidates: string[]): string | null {
  for (const dir of candidates) {
    try {
      if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) return dir;
    } catch {
      // ignore
    }
  }
  return candidates.length > 0 ? candidates[0] : null;
}

export function resolveVrcxPaths(input?: {
  databasePath?: string;
  worldDbPath?: string;
}): VrcxResolvedPaths {
  const databasePathOverride = toMaybeFilePath(input?.databasePath);
  const worldDbPathOverride = toMaybeFilePath(input?.worldDbPath);

  const defaultDir = pickFirstExistingDir(getDefaultVrcxDirCandidates());
  const vrcxJsonPath = defaultDir ? path.join(defaultDir, 'VRCX.json') : null;
  const vrcxJsonExists = fileExists(vrcxJsonPath);

  let dbPath: string | null = null;
  let dbSource: VrcxPathSource = 'unknown';

  if (databasePathOverride) {
    dbPath = normalizeOverridePath(databasePathOverride, defaultDir, 'VRCX.sqlite3');
    dbSource = 'config';
  } else if (vrcxJsonPath && vrcxJsonExists) {
    const loc = readVrcxJsonDatabaseLocation(vrcxJsonPath);
    if (loc) {
      dbPath = normalizeOverridePath(loc, defaultDir, 'VRCX.sqlite3');
      dbSource = 'vrcx_json';
    }
  }

  if (!dbPath && defaultDir) {
    dbPath = path.join(defaultDir, 'VRCX.sqlite3');
    dbSource = 'default';
  }

  const dbExists = fileExists(dbPath);

  let worldDbPath: string | null = null;
  let worldDbSource: VrcxPathSource = 'unknown';
  if (worldDbPathOverride) {
    worldDbPath = normalizeOverridePath(worldDbPathOverride, defaultDir, 'VRCX-WorldData.db');
    worldDbSource = 'config';
  } else if (defaultDir) {
    worldDbPath = path.join(defaultDir, 'VRCX-WorldData.db');
    worldDbSource = 'default';
  }

  const worldDbExists = fileExists(worldDbPath);

  return {
    db: {
      path: dbPath,
      exists: dbExists,
      source: dbSource,
    },
    worldDb: {
      path: worldDbPath,
      exists: worldDbExists,
      source: worldDbSource,
    },
    vrcxJson: {
      path: vrcxJsonPath,
      exists: vrcxJsonExists,
    },
  };
}
