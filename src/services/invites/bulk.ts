import { callOperation } from '../../core/client.js';
import type { WriteOperationData } from '../api/client.js';
import { fetchFriends, type FriendRecord } from '../friends/fetch.js';
import { normalizeName } from '../friends/match.js';

export type SentNotification = WriteOperationData<'inviteUser'>;

export type BulkStatus = 'completed' | 'dry_run';
export type TargetStatus = 'sent' | 'failed' | 'skipped' | 'would_send';

export interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export interface ResolvedUserTarget {
  target: string;
  userId: string;
  displayName?: string;
}

export interface BulkTargetResult {
  target: string;
  userId?: string;
  displayName?: string;
  status: TargetStatus;
  attempts?: number;
  notification?: SentNotification | null;
  data?: unknown;
  error?: string;
}

export interface BulkWriteSummary {
  status: BulkStatus;
  dryRun: boolean;
  continueOnError: boolean;
  totalTargets: number;
  sent: number;
  failed: number;
  skipped: number;
  stoppedAfterFailure?: boolean;
  results: BulkTargetResult[];
}

type SendOperation = (target: ResolvedUserTarget) => Promise<unknown>;

const DEFAULT_RETRY: RetryOptions = {
  maxAttempts: 4,
  baseDelayMs: 1_000,
  maxDelayMs: 30_000,
};

export const DEFAULT_BULK_WRITE_DELAY_MS = 500;

const RETRYABLE_STATUS_MIN = 500;

export function normalizeRetryOptions(input: { retry?: Partial<RetryOptions> }): RetryOptions {
  return {
    maxAttempts: input.retry?.maxAttempts ?? DEFAULT_RETRY.maxAttempts,
    baseDelayMs: input.retry?.baseDelayMs ?? DEFAULT_RETRY.baseDelayMs,
    maxDelayMs: input.retry?.maxDelayMs ?? DEFAULT_RETRY.maxDelayMs,
  };
}

export function getContinueOnError(input: { continueOnError?: boolean }): boolean {
  return input.continueOnError !== false;
}

export function getDryRun(input: { dryRun?: boolean }): boolean {
  return input.dryRun === true;
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function errorRetryAfter(err: unknown): string | undefined {
  if (!err || typeof err !== 'object') return undefined;
  const retryAfter = (err as { retryAfter?: unknown }).retryAfter;
  return typeof retryAfter === 'string' ? retryAfter : undefined;
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Unknown error';
}

function errorStatus(err: unknown): number | undefined {
  if (!err || typeof err !== 'object') return undefined;
  const direct = (err as { status?: unknown }).status;
  if (typeof direct === 'number') return direct;
  const payload = asRecord((err as { payload?: unknown }).payload);
  const status = payload?.status;
  return typeof status === 'number' ? status : undefined;
}

function retryAfterMs(err: unknown): number | undefined {
  const header = errorRetryAfter(err);
  if (!header) return undefined;
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1_000;
  const date = Date.parse(header);
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
  return undefined;
}

function isRetryable(err: unknown): boolean {
  const status = errorStatus(err);
  return status === 429 || (typeof status === 'number' && status >= RETRYABLE_STATUS_MIN);
}

function shouldStopAfterError(err: unknown): boolean {
  return errorStatus(err) === 401;
}

async function sleep(ms: number): Promise<void> {
  if (ms <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function retryDelayMs(attempt: number, retry: RetryOptions, err: unknown): number {
  const retryAfter = retryAfterMs(err);
  if (retryAfter !== undefined) return Math.min(retryAfter, retry.maxDelayMs);
  const exponential = retry.baseDelayMs * 2 ** Math.max(0, attempt - 1);
  const jitter = retry.baseDelayMs > 0 ? Math.floor(Math.random() * retry.baseDelayMs) : 0;
  return Math.min(exponential + jitter, retry.maxDelayMs);
}

async function callWithRetry<T>(operation: () => Promise<T>, retry: RetryOptions): Promise<{
  data: T;
  attempts: number;
}> {
  let attempt = 1;
  for (;;) {
    try {
      return { data: await operation(), attempts: attempt };
    } catch (err) {
      if (attempt >= retry.maxAttempts || !isRetryable(err)) throw err;
      await sleep(retryDelayMs(attempt, retry, err));
      attempt += 1;
    }
  }
}

export function collectTargetInputs(input: {
  user?: string;
  users?: string[];
  self?: boolean;
}): string[] {
  if (input.user && input.users) {
    throw new Error('Provide either user or users, not both. Each entry may be a usr_ id or exact display name.');
  }
  if (input.self && (input.user || input.users)) {
    throw new Error('self=true cannot be combined with user or users.');
  }
  if (input.self) return [];
  if (input.user) return [input.user];
  if (input.users) return input.users;
  throw new Error('Provide self=true, user, or users.');
}

export function collectRequiredUserTargets(input: { user?: string; users?: string[] }): string[] {
  if (input.user && input.users) {
    throw new Error('Provide either user or users, not both. Each entry may be a usr_ id or exact display name.');
  }
  if (input.user) return [input.user];
  if (input.users) return input.users;
  throw new Error('Provide user or users. Each entry may be a usr_ id or exact display name.');
}

function looksLikeUserId(target: string): boolean {
  return target.startsWith('usr_');
}

function toResolvedUserFromRecord(target: string, record: Record<string, unknown>): ResolvedUserTarget | null {
  const userId = typeof record.id === 'string' ? record.id : undefined;
  if (!userId) return null;
  const displayName = typeof record.displayName === 'string' ? record.displayName : undefined;
  return { target, userId, displayName };
}

function recordDisplayName(record: { displayName?: unknown }): string {
  return typeof record.displayName === 'string' ? record.displayName : '';
}

class UserTargetResolver {
  private friends: FriendRecord[] | null = null;

  async resolve(target: string): Promise<ResolvedUserTarget> {
    const trimmed = target.trim();
    if (!trimmed) throw new Error('Target user entries must be non-empty strings.');
    if (looksLikeUserId(trimmed)) return { target, userId: trimmed };

    const friendMatch = await this.resolveFriend(trimmed);
    if (friendMatch) return friendMatch;

    return this.resolveSearchUser(trimmed);
  }

  private async resolveFriend(target: string): Promise<ResolvedUserTarget | null> {
    this.friends ??= await fetchFriends({ includeOffline: true, pageSize: 100, maxPages: 200 });
    const normalized = normalizeName(target);
    const matches = this.friends.filter(
      (friend) => normalizeName(recordDisplayName(friend)) === normalized,
    );

    if (matches.length > 1) {
      throw new Error(`Display name "${target}" matched multiple friends. Pass a usr_ userId instead.`);
    }
    if (matches.length === 0) return null;

    const match = matches[0];
    const userId = typeof match.id === 'string' ? match.id : undefined;
    if (!userId) throw new Error(`Friend "${target}" did not include a userId.`);
    return {
      target,
      userId,
      displayName: typeof match.displayName === 'string' ? match.displayName : undefined,
    };
  }

  private async resolveSearchUser(target: string): Promise<ResolvedUserTarget> {
    const result = await callOperation({
      operationId: 'searchUsers',
      params: { search: target, n: 25 },
    });
    const users = Array.isArray(result.data) ? result.data : [];
    const normalized = normalizeName(target);
    const matches = users
      .map((entry) => asRecord(entry))
      .filter((entry): entry is Record<string, unknown> => Boolean(entry))
      .filter((entry) => normalizeName(recordDisplayName(entry)) === normalized);

    if (matches.length === 0) {
      throw new Error(`No user found with exact display name "${target}". Try vrchat_friends_search or pass a usr_ userId.`);
    }
    if (matches.length > 1) {
      throw new Error(`Display name "${target}" matched multiple users. Pass a usr_ userId instead.`);
    }

    const resolved = toResolvedUserFromRecord(target, matches[0]);
    if (!resolved) throw new Error(`User "${target}" did not include a userId.`);
    return resolved;
  }
}

export async function resolveUserTargets(
  targets: string[],
  continueOnError: boolean,
): Promise<{ targets: ResolvedUserTarget[]; results: BulkTargetResult[]; stopped: boolean }> {
  const resolver = new UserTargetResolver();
  const resolvedTargets: ResolvedUserTarget[] = [];
  const results: BulkTargetResult[] = [];
  const seen = new Set<string>();
  let stopped = false;

  for (const target of targets) {
    try {
      const resolved = await resolver.resolve(target);
      if (seen.has(resolved.userId)) {
        results.push({
          target,
          userId: resolved.userId,
          displayName: resolved.displayName,
          status: 'skipped',
          error: 'Duplicate target user.',
        });
        continue;
      }
      seen.add(resolved.userId);
      resolvedTargets.push(resolved);
    } catch (err) {
      results.push({ target, status: 'failed', error: errorMessage(err) });
      if (!continueOnError) {
        stopped = true;
        break;
      }
    }
  }

  return { targets: resolvedTargets, results, stopped };
}

export function summarizeBulk(input: {
  dryRun: boolean;
  continueOnError: boolean;
  results: BulkTargetResult[];
  totalTargets?: number;
  stoppedAfterFailure?: boolean;
}): BulkWriteSummary {
  const sent = input.results.filter((result) => result.status === 'sent').length;
  const failed = input.results.filter((result) => result.status === 'failed').length;
  const skipped = input.results.filter((result) => result.status === 'skipped').length;
  const payload: BulkWriteSummary = {
    status: input.dryRun ? 'dry_run' : 'completed',
    dryRun: input.dryRun,
    continueOnError: input.continueOnError,
    totalTargets: input.totalTargets ?? input.results.length,
    sent,
    failed,
    skipped,
    results: input.results,
  };
  if (input.stoppedAfterFailure) payload.stoppedAfterFailure = true;
  return payload;
}

export async function executeResolvedUserWrites(input: {
  targets: ResolvedUserTarget[];
  initialResults?: BulkTargetResult[];
  totalTargets?: number;
  stoppedAfterFailure?: boolean;
  interRequestDelayMs?: number;
  dryRun: boolean;
  continueOnError: boolean;
  retry: RetryOptions;
  send: SendOperation;
  dryRunStatus?: TargetStatus;
}): Promise<BulkWriteSummary> {
  const results = [...(input.initialResults ?? [])];
  let stoppedAfterFailure = input.stoppedAfterFailure === true;
  const dryRunStatus = input.dryRunStatus ?? 'would_send';
  const interRequestDelayMs = input.interRequestDelayMs ?? DEFAULT_BULK_WRITE_DELAY_MS;
  let writesAttempted = 0;

  for (const target of input.targets) {
    if (input.dryRun) {
      results.push({
        target: target.target,
        userId: target.userId,
        displayName: target.displayName,
        status: dryRunStatus,
        attempts: 0,
      });
      continue;
    }

    if (writesAttempted > 0) {
      await sleep(interRequestDelayMs);
    }
    writesAttempted += 1;

    try {
      const { data, attempts } = await callWithRetry(() => input.send(target), input.retry);
      const result: BulkTargetResult = {
        target: target.target,
        userId: target.userId,
        displayName: target.displayName,
        status: 'sent',
        attempts,
        data,
      };
      const notification = asRecord(data);
      if (notification) result.notification = notification as SentNotification;
      results.push(result);
    } catch (err) {
      results.push({
        target: target.target,
        userId: target.userId,
        displayName: target.displayName,
        status: 'failed',
        error: errorMessage(err),
      });
      if (!input.continueOnError || shouldStopAfterError(err)) {
        stoppedAfterFailure = true;
        break;
      }
    }
  }

  return summarizeBulk({
    dryRun: input.dryRun,
    continueOnError: input.continueOnError,
    results,
    totalTargets: input.totalTargets,
    stoppedAfterFailure,
  });
}

export async function executeBulkUserWrites(input: {
  targets: string[];
  dryRun: boolean;
  continueOnError: boolean;
  retry: RetryOptions;
  send: SendOperation;
  dryRunStatus?: TargetStatus;
  interRequestDelayMs?: number;
}): Promise<BulkWriteSummary> {
  const resolution = await resolveUserTargets(input.targets, input.continueOnError);
  return executeResolvedUserWrites({
    targets: resolution.targets,
    initialResults: resolution.results,
    totalTargets: input.targets.length,
    stoppedAfterFailure: resolution.stopped,
    dryRun: input.dryRun,
    continueOnError: input.continueOnError,
    retry: input.retry,
    send: input.send,
    dryRunStatus: input.dryRunStatus,
    interRequestDelayMs: input.interRequestDelayMs,
  });
}
