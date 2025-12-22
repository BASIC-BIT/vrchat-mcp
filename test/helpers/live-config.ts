import { existsSync, readFileSync } from 'node:fs';
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

export function loadLiveConfig(): LiveConfig | null {
  const filePath = fileURLToPath(LIVE_CONFIG_PATH);
  if (!existsSync(filePath)) return null;
  const raw = JSON.parse(readFileSync(filePath, 'utf8')) as unknown;
  return LiveConfigSchema.parse(raw);
}
