import type { z } from 'zod';
import type {
  BoopInput,
  FriendRequestInput,
  GroupInviteInput,
  InviteSelfInput,
  UnifiedInviteInput,
  InviteUserInput,
  InviteUserToMeInput,
} from '../../models/invites.js';
import type { schemas } from '../../generated/vrchat-schemas.js';
import { callOperation } from '../../core/client.js';
import {
  callReadOperationParsed,
  callWriteOperationParsed,
  type WriteOperationData,
} from '../api/client.js';
import { fetchFriends, type FriendRecord } from '../friends/fetch.js';
import { normalizeName } from '../friends/match.js';
import { checkGroupAllowed, resolveGroupId } from '../groups/index.js';

export interface InviteLocation {
  worldId: string;
  instanceId: string;
}

export interface InviteCurrentLocation extends InviteLocation {
  location: string;
}

export type InviteUserPreparation =
  | { ok: true; userId: string; request: InviteRequest }
  | { ok: false; reason: string };

type InviteRequest = z.infer<typeof schemas.InviteRequest>;
type SentNotification = WriteOperationData<'inviteUser'>;

type BulkStatus = 'completed' | 'dry_run';
type TargetStatus = 'sent' | 'failed' | 'skipped' | 'would_send';

interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

interface ResolvedUserTarget {
  target: string;
  userId: string;
  displayName?: string;
}

interface BulkTargetResult {
  target: string;
  userId?: string;
  displayName?: string;
  status: TargetStatus;
  attempts?: number;
  notification?: SentNotification | null;
  data?: unknown;
  error?: string;
}

interface BulkWriteSummary {
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

interface UnifiedInviteDestination {
  kind: 'here' | 'location' | 'world_instance' | 'instance';
  location?: string;
  worldId?: string;
  instanceId?: string;
}

interface InviteMessagePlan {
  requested?: string;
  slot?: number;
  matchedExisting?: boolean;
  overwrittenSlot?: number;
  wouldOverwriteSlot?: number;
}

type SendOperation = (target: ResolvedUserTarget) => Promise<unknown>;

const DEFAULT_RETRY: RetryOptions = {
  maxAttempts: 4,
  baseDelayMs: 1_000,
  maxDelayMs: 30_000,
};

const RETRYABLE_STATUS_MIN = 500;

export function resolveInviteLocation(args: InviteSelfInput): InviteLocation {
  if (args.location) {
    const parts = args.location.split(':');
    if (parts.length >= 2) {
      return { worldId: parts[0], instanceId: parts.slice(1).join(':') };
    }
  }
  if (args.worldId && args.instanceId) {
    return { worldId: args.worldId, instanceId: args.instanceId };
  }
  throw new Error('Provide location or worldId + instanceId.');
}

export function resolveInviteInstanceId(args: { instanceId?: string; location?: string }): string {
  if (args.instanceId) return args.instanceId;
  if (args.location) {
    const parts = args.location.split(':');
    if (parts.length >= 2) {
      return parts.slice(1).join(':');
    }
    return args.location;
  }
  throw new Error('Provide instanceId or location.');
}

export function prepareInviteUser(input: InviteUserInput): InviteUserPreparation {
  let instanceId: string;
  try {
    instanceId = resolveInviteInstanceId({
      instanceId: input.instanceId,
      location: input.location,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Provide instanceId or location.';
    return { ok: false, reason: message };
  }

  const request: InviteRequest = { instanceId };
  if (typeof input.messageSlot === 'number') {
    request.messageSlot = input.messageSlot;
  }
  return { ok: true, userId: input.userId, request };
}

export async function sendSelfInvite(location: InviteLocation): Promise<SentNotification | null> {
  const result = await callWriteOperationParsed('inviteMyselfTo', {
    worldId: location.worldId,
    instanceId: location.instanceId,
  });
  return result.data ?? null;
}

export async function sendUserInvite(
  userId: string,
  request: InviteRequest
): Promise<SentNotification | null> {
  const result = await callWriteOperationParsed('inviteUser', { userId }, request);
  return result.data ?? null;
}

export async function resolveCurrentInviteLocation(): Promise<InviteCurrentLocation> {
  const currentResult = await callReadOperationParsed('getCurrentUser', {});
  const currentUser = currentResult.data;
  const location = typeof currentUser?.location === 'string' ? currentUser.location : '';

  if (!location?.includes(':')) {
    throw new Error(
      'Could not determine your current joinable instance from location. Join an instance first or provide instanceId/location explicitly via vrchat_invite_user.'
    );
  }

  const parts = location.split(':');
  const worldId = parts[0];
  const instanceId = parts.slice(1).join(':');
  if (!worldId || !instanceId) {
    throw new Error(
      'Current location is malformed; unable to extract worldId/instanceId. Use vrchat_invite_user with explicit instanceId/location.'
    );
  }

  return {
    worldId,
    instanceId,
    location,
  };
}

export async function inviteUserToCurrentInstance(input: InviteUserToMeInput): Promise<{
  status: 'sent';
  userId: string;
  worldId: string;
  instanceId: string;
  location: string;
  notification: SentNotification | null;
}> {
  const current = await resolveCurrentInviteLocation();
  const request: InviteRequest = { instanceId: current.instanceId };
  if (typeof input.messageSlot === 'number') {
    request.messageSlot = input.messageSlot;
  }

  const notification = await sendUserInvite(input.userId, request);
  return {
    status: 'sent',
    userId: input.userId,
    worldId: current.worldId,
    instanceId: current.instanceId,
    location: current.location,
    notification,
  };
}

function normalizeRetryOptions(input: { retry?: Partial<RetryOptions> }): RetryOptions {
  return {
    maxAttempts: input.retry?.maxAttempts ?? DEFAULT_RETRY.maxAttempts,
    baseDelayMs: input.retry?.baseDelayMs ?? DEFAULT_RETRY.baseDelayMs,
    maxDelayMs: input.retry?.maxDelayMs ?? DEFAULT_RETRY.maxDelayMs,
  };
}

function getContinueOnError(input: { continueOnError?: boolean }): boolean {
  return input.continueOnError !== false;
}

function getDryRun(input: { dryRun?: boolean }): boolean {
  return input.dryRun === true;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
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

function errorHeaders(err: unknown): Record<string, string> | undefined {
  if (!err || typeof err !== 'object') return undefined;
  const payload = asRecord((err as { payload?: unknown }).payload);
  const headers = asRecord(payload?.headers);
  if (!headers) return undefined;
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === 'string') result[key.toLowerCase()] = value;
  }
  return result;
}

function retryAfterMs(err: unknown): number | undefined {
  const header = errorHeaders(err)?.['retry-after'];
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

function collectTargetInputs(input: { user?: string; users?: string[]; self?: boolean }): string[] {
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

function collectRequiredUserTargets(input: { user?: string; users?: string[] }): string[] {
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
      throw new Error(
        `Display name "${target}" matched multiple friends. Pass a usr_ userId instead.`,
      );
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

async function resolveUserTargets(
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

function summarizeBulk(input: {
  dryRun: boolean;
  continueOnError: boolean;
  results: BulkTargetResult[];
  stoppedAfterFailure?: boolean;
}): BulkWriteSummary {
  const sent = input.results.filter((result) => result.status === 'sent').length;
  const failed = input.results.filter((result) => result.status === 'failed').length;
  const skipped = input.results.filter((result) => result.status === 'skipped').length;
  const payload: BulkWriteSummary = {
    status: input.dryRun ? 'dry_run' : 'completed',
    dryRun: input.dryRun,
    continueOnError: input.continueOnError,
    totalTargets: input.results.length,
    sent,
    failed,
    skipped,
    results: input.results,
  };
  if (input.stoppedAfterFailure) payload.stoppedAfterFailure = true;
  return payload;
}

async function executeBulkUserWrites(input: {
  targets: string[];
  dryRun: boolean;
  continueOnError: boolean;
  retry: RetryOptions;
  send: SendOperation;
  dryRunStatus?: TargetStatus;
}): Promise<BulkWriteSummary> {
  const resolution = await resolveUserTargets(input.targets, input.continueOnError);
  const results = [...resolution.results];
  let stoppedAfterFailure = resolution.stopped;
  const dryRunStatus = input.dryRunStatus ?? 'would_send';

  for (const target of resolution.targets) {
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
    stoppedAfterFailure,
  });
}

async function resolveInviteDestination(input: UnifiedInviteInput): Promise<UnifiedInviteDestination> {
  const hasHere = input.here === true;
  const hasLocation = typeof input.location === 'string' && input.location.trim().length > 0;
  const hasWorldId = typeof input.worldId === 'string' && input.worldId.trim().length > 0;
  const hasInstanceId = typeof input.instanceId === 'string' && input.instanceId.trim().length > 0;
  const styles = [hasHere, hasLocation, hasWorldId || hasInstanceId].filter(Boolean).length;

  if (styles !== 1) {
    throw new Error('Provide exactly one destination: here=true, location="wrld_:instance", worldId + instanceId, or bare instanceId for user invites.');
  }
  if (hasWorldId && !hasInstanceId) {
    throw new Error('worldId requires instanceId.');
  }
  if (!hasWorldId && hasInstanceId) {
    if (input.self) {
      throw new Error('Self-invite requires a full destination because VRChat needs worldId and instanceId. Use here=true, location="wrld_:instance", or worldId + instanceId. Bare instanceId is only valid when inviting other users.');
    }
    return { kind: 'instance', instanceId: input.instanceId };
  }
  if (hasWorldId && hasInstanceId) {
    return {
      kind: 'world_instance',
      worldId: input.worldId,
      instanceId: input.instanceId,
      location: `${input.worldId}:${input.instanceId}`,
    };
  }
  if (hasLocation) {
    const location = input.location?.trim() ?? '';
    if (!location.includes(':')) {
      throw new Error('location must be a full VRChat location string like "wrld_:instance". Use instanceId for bare instance IDs.');
    }
    const parts = location.split(':');
    const worldId = parts[0];
    const instanceId = parts.slice(1).join(':');
    if (!worldId || !instanceId) {
      throw new Error('location must include both worldId and instanceId, like "wrld_:instance".');
    }
    return { kind: 'location', location, worldId, instanceId };
  }

  const current = await resolveCurrentInviteLocation();
  return {
    kind: 'here',
    location: current.location,
    worldId: current.worldId,
    instanceId: current.instanceId,
  };
}

async function getCurrentUserId(): Promise<string> {
  const result = await callOperation({ operationId: 'getCurrentUser', params: {} });
  const user = asRecord(result.data);
  const userId = typeof user?.id === 'string' ? user.id : '';
  if (!userId) throw new Error('Unable to resolve current user id.');
  return userId;
}

function inviteMessageRecords(data: unknown): Record<string, unknown>[] {
  return Array.isArray(data)
    ? data.map((entry) => asRecord(entry)).filter((entry): entry is Record<string, unknown> => Boolean(entry))
    : [];
}

async function fetchInviteMessages(userId: string): Promise<Record<string, unknown>[]> {
  const result = await callOperation({
    operationId: 'getInviteMessages',
    params: { userId, messageType: 'message' },
  });
  return inviteMessageRecords(result.data);
}

function findInviteMessageSlot(messages: Record<string, unknown>[], message: string): number | null {
  const match = messages.find((entry) => entry.message === message && typeof entry.slot === 'number');
  return typeof match?.slot === 'number' ? Math.floor(match.slot) : null;
}

function getMessageSlotRecord(
  messages: Record<string, unknown>[],
  slot: number,
): Record<string, unknown> | null {
  return messages.find((entry) => entry.slot === slot) ?? null;
}

async function resolveInviteMessagePlan(
  input: UnifiedInviteInput,
  dryRun: boolean,
): Promise<InviteMessagePlan | undefined> {
  const message = typeof input.message === 'string' ? input.message.trim() : '';
  if (!message) return undefined;
  if (input.self) {
    throw new Error('Self-invite cannot use invite messages because VRChat self-invite has no message slot body.');
  }

  const userId = await getCurrentUserId();
  const messages = await fetchInviteMessages(userId);
  const existingSlot = findInviteMessageSlot(messages, message);
  if (existingSlot !== null) {
    return { requested: message, slot: existingSlot, matchedExisting: true };
  }

  const overwriteSlot = input.overwriteMessageSlot;
  if (typeof overwriteSlot !== 'number') {
    throw new Error('No saved invite message exactly matches message. Provide overwriteMessageSlot (0-11) to update a saved invite message slot, then send using it. Updating a slot may be rate-limited by VRChat.');
  }

  const slotRecord = getMessageSlotRecord(messages, overwriteSlot);
  const canBeUpdated = slotRecord?.canBeUpdated !== false;
  const cooldown = typeof slotRecord?.remainingCooldownMinutes === 'number'
    ? Math.floor(slotRecord.remainingCooldownMinutes)
    : 0;
  if (!canBeUpdated || cooldown > 0) {
    throw new Error(`Invite message slot ${overwriteSlot} cannot be updated right now. Remaining cooldown: ${cooldown} minute(s).`);
  }

  if (dryRun) {
    return { requested: message, slot: overwriteSlot, wouldOverwriteSlot: overwriteSlot };
  }

  await callOperation({
    operationId: 'updateInviteMessage',
    params: { userId, messageType: 'message', slot: overwriteSlot },
    body: { message },
  });

  return { requested: message, slot: overwriteSlot, overwrittenSlot: overwriteSlot };
}

function inviteRequestForDestination(
  destination: UnifiedInviteDestination,
  messagePlan: InviteMessagePlan | undefined,
): InviteRequest {
  if (!destination.instanceId) {
    throw new Error('Unable to resolve invite instanceId.');
  }
  const request: InviteRequest = { instanceId: destination.instanceId };
  if (typeof messagePlan?.slot === 'number') request.messageSlot = messagePlan.slot;
  return request;
}

function assertSelfInviteDestination(destination: UnifiedInviteDestination): asserts destination is UnifiedInviteDestination & {
  worldId: string;
  instanceId: string;
} {
  if (!destination.worldId || !destination.instanceId) {
    throw new Error('Self-invite requires here=true, location="wrld_:instance", or worldId + instanceId.');
  }
}

export async function inviteUsers(input: UnifiedInviteInput): Promise<BulkWriteSummary & {
  destination: UnifiedInviteDestination;
  message?: InviteMessagePlan;
}> {
  const dryRun = getDryRun(input);
  const continueOnError = getContinueOnError(input);
  const retry = normalizeRetryOptions(input);
  const destination = await resolveInviteDestination(input);
  const targetInputs = collectTargetInputs(input);

  if (input.self) {
    if (input.message || typeof input.overwriteMessageSlot === 'number') {
      throw new Error('Self-invite cannot use message or overwriteMessageSlot.');
    }
    assertSelfInviteDestination(destination);
    const result: BulkTargetResult = {
      target: 'self',
      status: dryRun ? 'would_send' : 'sent',
      attempts: dryRun ? 0 : 1,
    };
    if (!dryRun) {
      const notification = await sendSelfInvite({
        worldId: destination.worldId,
        instanceId: destination.instanceId,
      });
      if (notification) result.notification = notification;
    }
    return {
      ...summarizeBulk({ dryRun, continueOnError, results: [result] }),
      destination,
    };
  }

  const resolution = await resolveUserTargets(targetInputs, continueOnError);
  if (resolution.targets.length === 0) {
    return {
      ...summarizeBulk({
        dryRun,
        continueOnError,
        results: resolution.results,
        stoppedAfterFailure: resolution.stopped,
      }),
      destination,
    };
  }

  const messagePlan = await resolveInviteMessagePlan(input, dryRun);
  const request = inviteRequestForDestination(destination, messagePlan);
  const summary = await executeBulkUserWrites({
    targets: resolution.targets.map((target) => target.userId),
    dryRun,
    continueOnError,
    retry,
    send: (target) => sendUserInvite(target.userId, request),
  });
  const resolvedById = new Map(resolution.targets.map((target) => [target.userId, target]));
  const results = [
    ...resolution.results,
    ...summary.results.map((result) => {
      const target = result.userId ? resolvedById.get(result.userId) : undefined;
      return target
        ? { ...result, target: target.target, displayName: target.displayName }
        : result;
    }),
  ];

  return {
    ...summarizeBulk({
      dryRun,
      continueOnError,
      results,
      stoppedAfterFailure: resolution.stopped || summary.stoppedAfterFailure,
    }),
    destination,
    message: messagePlan,
  };
}

export async function inviteUsersToGroup(input: GroupInviteInput): Promise<BulkWriteSummary & {
  groupId: string;
}> {
  const resolved = await resolveGroupId({ groupId: input.groupId, shortCode: input.shortCode });
  if (!resolved.ok) throw new Error(resolved.reason);
  const allowed = checkGroupAllowed(resolved.groupId);
  if (!allowed.ok) throw new Error(allowed.reason);

  const dryRun = getDryRun(input);
  const continueOnError = getContinueOnError(input);
  const summary = await executeBulkUserWrites({
    targets: collectRequiredUserTargets(input),
    dryRun,
    continueOnError,
    retry: normalizeRetryOptions(input),
    send: async (target) => {
      const result = await callOperation({
        operationId: 'createGroupInvite',
        params: { groupId: resolved.groupId },
        body: {
          userId: target.userId,
          confirmOverrideBlock: input.confirmOverrideBlock ?? true,
        },
      });
      return result.data ?? null;
    },
  });
  return { ...summary, groupId: resolved.groupId };
}

export async function sendFriendRequests(input: FriendRequestInput): Promise<BulkWriteSummary> {
  return executeBulkUserWrites({
    targets: collectRequiredUserTargets(input),
    dryRun: getDryRun(input),
    continueOnError: getContinueOnError(input),
    retry: normalizeRetryOptions(input),
    send: async (target) => {
      const result = await callOperation({
        operationId: 'friend',
        params: { userId: target.userId },
      });
      return result.data ?? null;
    },
  });
}

export async function sendBoops(input: BoopInput): Promise<BulkWriteSummary> {
  return executeBulkUserWrites({
    targets: collectRequiredUserTargets(input),
    dryRun: getDryRun(input),
    continueOnError: getContinueOnError(input),
    retry: normalizeRetryOptions(input),
    send: async (target) => {
      const body: Record<string, unknown> = {};
      if (input.emojiId) body.emojiId = input.emojiId;
      if (typeof input.emojiVersion === 'number') body.emojiVersion = input.emojiVersion;
      if (input.inventoryItemId) body.inventoryItemId = input.inventoryItemId;
      const result = await callOperation({
        operationId: 'boop',
        params: { userId: target.userId },
        body,
      });
      return result.data ?? null;
    },
  });
}
