import { existsSync, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const LiveConfigSchema = z.object({
  cookieFile: z.string().optional(),
  expectFriend: z.string().optional(),
  bogusQuery: z.string().optional(),
  loginTimeoutSec: z.number().int().min(1).optional(),
  debug: z.boolean().optional(),
  writeTests: z
    .object({
      enabled: z.boolean().optional(),
      worldId: z.string().optional(),
      region: z.string().optional(),
      type: z.string().optional(),
      inviteUserId: z.string().optional(),
    })
    .optional(),
});

export type LiveConfig = z.infer<typeof LiveConfigSchema>;

const LIVE_CONFIG_PATH = new URL('../fixtures/e2e.live.json', import.meta.url);
const LIVE_CONFIG_FILE_ENV = 'VRCHAT_MCP_LIVE_CONFIG_FILE';

function resolveConfigPath(): string {
  const override = process.env[LIVE_CONFIG_FILE_ENV]?.trim();
  if (!override) return fileURLToPath(LIVE_CONFIG_PATH);
  return path.isAbsolute(override) ? override : path.resolve(process.cwd(), override);
}

function getUserConfigDir(): string {
  if (process.platform === 'win32') {
    return path.join(process.env.APPDATA ?? path.join(os.homedir(), 'AppData', 'Roaming'), 'vrchat-mcp');
  }
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', 'vrchat-mcp');
  }
  return path.join(process.env.XDG_CONFIG_HOME ?? path.join(os.homedir(), '.config'), 'vrchat-mcp');
}

export function getDefaultLiveCookieFile(): string {
  return path.join(getUserConfigDir(), 'cookies.json');
}

export function loadLiveConfig(): LiveConfig | null {
  const filePath = resolveConfigPath();
  if (!existsSync(filePath)) return null;
  const raw = JSON.parse(readFileSync(filePath, 'utf8')) as unknown;
  return LiveConfigSchema.parse(raw);
}
