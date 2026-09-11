import { promises as fs } from 'node:fs';
import type { FileHandle } from 'node:fs/promises';
import path from 'node:path';
import { getConfig } from '../config/index.js';
import { logger } from '../infra/logger.js';
import { authManager } from './index.js';
import { decodeBase32Secret, generateTotp } from './totp.js';

// Opt-in headless re-login for accounts that hold their own TOTP secret. The attempt record is
// persisted next to the cookie file because hosts may spawn a fresh process per call, where an
// in-memory cooldown protects nothing.
const ATTEMPT_COOLDOWN_MS = 10 * 60_000;
const FAILURE_BACKOFF_MS = 60 * 60_000;
const LOCK_STALE_MS = 30_000;
// Only these performLogin messages are echoed; anything else is reported generically so an
// unexpected error can never carry a credential into a tool result or log line.
const SAFE_FAILURE_REASON =
  /^(Login failed: \d{3}|TOTP verify failed: \d{3}|2FA required \([\w, ]+\)\.|fetch failed)$/;

type Outcome = 'pending' | 'success' | 'failure';

interface AttemptRecord {
  attemptedAt: number;
  outcome: Outcome;
}

type Claim = { ok: true } | { ok: false; message: string };

export type AutoLoginResult = { ok: true } | { ok: false; message?: string };

let memoryRecord: AttemptRecord | null = null;
let inflight: Promise<AutoLoginResult> | null = null;

function readCredentials() {
  const username = process.env.VRCHAT_MCP_USERNAME?.trim();
  const password = process.env.VRCHAT_MCP_PASSWORD;
  const secret = process.env.VRCHAT_MCP_TOTP_SECRET;
  if (!username || !password?.trim() || !secret?.trim()) return null;
  return { username, password, secret: decodeBase32Secret(secret) };
}

/** The memory cookie store has no file to sit beside, so its guard is per-process only. */
function recordPath(): string | null {
  const { cookieStore, cookieFile } = getConfig().auth;
  return cookieStore === 'memory' ? null : `${path.resolve(cookieFile)}.autologin.json`;
}

function iso(ms: number): string {
  return new Date(ms).toISOString();
}

function errorCode(err: unknown): string {
  const code = (err as { code?: unknown } | null)?.code;
  return typeof code === 'string' ? code : 'unknown error';
}

function nextAttemptAt(record: AttemptRecord): number {
  // An attempt that never recorded an outcome (process killed mid-login) backs off like a failure.
  const wait = record.outcome === 'success' ? ATTEMPT_COOLDOWN_MS : FAILURE_BACKOFF_MS;
  return record.attemptedAt + wait;
}

async function readRecord(file: string | null): Promise<AttemptRecord | null> {
  if (!file) return memoryRecord;
  let text: string;
  try {
    text = await fs.readFile(file, 'utf8');
  } catch (err) {
    if (errorCode(err) === 'ENOENT') return null;
    throw err;
  }
  try {
    const parsed = JSON.parse(text) as { attemptedAt?: unknown; outcome?: unknown };
    const attemptedAt =
      typeof parsed.attemptedAt === 'string' ? Date.parse(parsed.attemptedAt) : NaN;
    const outcome = parsed.outcome;
    if (
      !Number.isNaN(attemptedAt) &&
      (outcome === 'pending' || outcome === 'success' || outcome === 'failure')
    ) {
      return { attemptedAt, outcome };
    }
  } catch {
    // Fall through. An unreadable record must not reopen the door to a login storm.
  }
  return { attemptedAt: (await fs.stat(file)).mtimeMs, outcome: 'failure' };
}

async function writeRecord(file: string | null, record: AttemptRecord): Promise<void> {
  if (!file) {
    memoryRecord = record;
    return;
  }
  const temp = `${file}.${process.pid}.tmp`;
  const body = JSON.stringify({ attemptedAt: iso(record.attemptedAt), outcome: record.outcome });
  await fs.writeFile(temp, body, { encoding: 'utf8', mode: 0o600 });
  await fs.rename(temp, file);
}

async function openExclusive(lockPath: string): Promise<FileHandle | null> {
  try {
    return await fs.open(lockPath, 'wx', 0o600);
  } catch (err) {
    if (errorCode(err) === 'EEXIST') return null;
    throw err;
  }
}

async function acquireLock(lockPath: string): Promise<FileHandle | null> {
  const handle = await openExclusive(lockPath);
  if (handle) return handle;
  const stat = await fs.stat(lockPath).catch(() => null);
  if (stat && Math.abs(Date.now() - stat.mtimeMs) < LOCK_STALE_MS) return null;
  // ponytail: two processes can clear the same stale lock at once. The pending record written
  // under the lock limits that race to one extra login, not a storm.
  await fs.rm(lockPath, { force: true });
  return await openExclusive(lockPath);
}

function cooldownMessage(last: AttemptRecord): string {
  const state = {
    success: 'succeeded',
    failure: 'failed',
    pending: 'is still running or did not finish',
  }[last.outcome];
  return `Automatic login is in cooldown: the last attempt at ${iso(last.attemptedAt)} ${state}. Next automatic attempt after ${iso(nextAttemptAt(last))}.`;
}

/** Check the guard and record a pending attempt in one step, under the lock file. */
async function claimAttempt(file: string | null, now: number): Promise<Claim> {
  const claim = async (): Promise<Claim> => {
    const last = await readRecord(file);
    if (last && now < nextAttemptAt(last)) return { ok: false, message: cooldownMessage(last) };
    await writeRecord(file, { attemptedAt: now, outcome: 'pending' });
    return { ok: true };
  };
  if (!file) return claim();

  await fs.mkdir(path.dirname(file), { recursive: true });
  const lockPath = `${file}.lock`;
  const lock = await acquireLock(lockPath);
  if (!lock) {
    return { ok: false, message: 'Another process is attempting automatic login. Retry shortly.' };
  }
  try {
    return await claim();
  } finally {
    await lock.close();
    await fs.rm(lockPath, { force: true });
  }
}

function failureMessage(err: unknown, now: number): string {
  const next = iso(now + FAILURE_BACKOFF_MS);
  if (err instanceof Error && (err as { kind?: unknown }).kind === 'emailOtp') {
    return `Automatic login only supports TOTP accounts, and VRChat asked for an email code. Log in with vrchat_auth_begin. Next automatic attempt after ${next}.`;
  }
  const message = err instanceof Error ? err.message : '';
  const reason = SAFE_FAILURE_REASON.test(message) ? message : 'unexpected error';
  return `Automatic login failed (${reason}). Next automatic attempt after ${next}. Check the VRCHAT_MCP_USERNAME, VRCHAT_MCP_PASSWORD, and VRCHAT_MCP_TOTP_SECRET values or log in with vrchat_auth_begin.`;
}

async function runAutoLogin(): Promise<AutoLoginResult> {
  const creds = readCredentials();
  if (!creds) return { ok: false };
  if (!creds.secret) {
    return {
      ok: false,
      message: 'Automatic login is disabled: VRCHAT_MCP_TOTP_SECRET is not valid base32.',
    };
  }

  const file = recordPath();
  if (!file) {
    logger.warn('Automatic login guard is per-process with the memory cookie store.');
  }
  const now = Date.now();
  let claim: Claim;
  try {
    claim = await claimAttempt(file, now);
  } catch (err) {
    // Fail closed. Without a durable record every process could log in.
    return {
      ok: false,
      message: `Automatic login skipped: could not record the attempt (${errorCode(err)}).`,
    };
  }
  if (!claim.ok) {
    logger.warn('Automatic login skipped', { reason: claim.message });
    return claim;
  }

  let outcome: Outcome = 'failure';
  try {
    await authManager.loginHeadless(creds.username, creds.password, generateTotp(creds.secret));
    outcome = 'success';
    logger.info('Automatic login succeeded.');
    return { ok: true };
  } catch (err) {
    const message = failureMessage(err, now);
    logger.warn('Automatic login failed', { reason: message });
    return { ok: false, message };
  } finally {
    await writeRecord(file, { attemptedAt: now, outcome }).catch((err: unknown) => {
      logger.warn('Failed to record automatic login outcome', { code: errorCode(err) });
    });
  }
}

/**
 * Called by the API client after a 401. Logs in once with the headless credentials when all three
 * are configured and the persisted guard allows it. Concurrent callers in one process share one
 * attempt. Never throws.
 */
export function tryAutoLogin(): Promise<AutoLoginResult> {
  inflight ??= runAutoLogin()
    .catch((): AutoLoginResult => ({ ok: false, message: 'Automatic login failed unexpectedly.' }))
    .finally(() => {
      inflight = null;
    });
  return inflight;
}
