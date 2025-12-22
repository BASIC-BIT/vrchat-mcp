import type { Client } from '@modelcontextprotocol/sdk/client';
import { createInterface } from 'node:readline';
import type { LiveConfig } from './live-config.js';

function isLoggedIn(result: unknown): boolean {
  if (!result || typeof result !== 'object') return false;
  const record = result as { structuredContent?: unknown };
  const structured = record.structuredContent as { loggedIn?: unknown } | undefined;
  return structured?.loggedIn === true;
}

async function waitForEnter(timeoutMs?: number): Promise<boolean> {
  if (!process.stdin.isTTY) return false;
  return await new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stderr });
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (timeoutMs && timeoutMs > 0) {
      timer = setTimeout(() => {
        rl.close();
        resolve(false);
      }, timeoutMs);
    }
    rl.question('Press ENTER after you finish logging in...\n', () => {
      if (timer) clearTimeout(timer);
      rl.close();
      resolve(true);
    });
  });
}

export async function ensureLoggedIn(
  client: Client,
  liveConfig?: LiveConfig | null,
): Promise<void> {
  const status = await client.callTool({ name: 'vrchat_auth_status', arguments: {} });
  if (isLoggedIn(status)) return;

  const begin = await client.callTool({ name: 'vrchat_auth_begin', arguments: {} });
  const structured = begin.structuredContent as { url?: string } | undefined;
  const url = structured?.url;
  if (url) {
    console.error(`Open in browser: ${url}`);
  }

  if (!process.stdin.isTTY) {
    throw new Error(
      'Not logged in and stdin is not a TTY. Run in an interactive shell or provide a valid cookie file.',
    );
  }

  const timeoutMs = liveConfig?.loginTimeoutSec
    ? liveConfig.loginTimeoutSec * 1000
    : undefined;
  const waited = await waitForEnter(timeoutMs);
  if (!waited) {
    throw new Error('Login prompt timed out.');
  }

  const statusAfter = await client.callTool({ name: 'vrchat_auth_status', arguments: {} });
  if (!isLoggedIn(statusAfter)) {
    throw new Error('Login did not complete.');
  }
}
