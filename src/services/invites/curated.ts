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
import { callReadOperationParsed, callWriteOperationParsed } from '../api/client.js';
import { checkGroupAllowed, resolveGroupId } from '../groups/index.js';
import {
  collectRequiredUserTargets,
  collectTargetInputs,
  executeBulkUserWrites,
  executeResolvedUserWrites,
  getContinueOnError,
  getDryRun,
  normalizeRetryOptions,
  resolveUserTargets,
  summarizeBulk,
  type BulkTargetResult,
  type BulkWriteSummary,
  type SentNotification,
} from './bulk.js';
import { resolveInviteMessagePlan, type InviteMessagePlan } from './messages.js';

export interface InviteLocation {
  worldId: string;
  instanceId: string;
}

export interface InviteCurrentLocation extends InviteLocation {
  location: string;
}

interface CurrentInviteContext extends InviteCurrentLocation {
  userId?: string;
}

export type InviteUserPreparation =
  | { ok: true; userId: string; request: InviteRequest }
  | { ok: false; reason: string };

type InviteRequest = z.infer<typeof schemas.InviteRequest>;

interface UnifiedInviteDestination {
  kind: 'here' | 'location' | 'world_instance' | 'instance';
  location?: string;
  worldId?: string;
  instanceId?: string;
}

interface ResolvedInviteDestination {
  destination: UnifiedInviteDestination;
  currentUserId?: string;
}

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
  request: InviteRequest,
): Promise<SentNotification | null> {
  const result = await callWriteOperationParsed('inviteUser', { userId }, request);
  return result.data ?? null;
}

async function resolveCurrentInviteContext(): Promise<CurrentInviteContext> {
  const currentResult = await callReadOperationParsed('getCurrentUser', {});
  const currentUser = currentResult.data;
  const location = typeof currentUser?.location === 'string' ? currentUser.location : '';
  const userId = typeof currentUser?.id === 'string' ? currentUser.id : undefined;

  if (!location?.includes(':')) {
    throw new Error(
      'Could not determine your current joinable instance from location. Join an instance first or provide instanceId/location explicitly via vrchat_invite_user.',
    );
  }

  const parts = location.split(':');
  const worldId = parts[0];
  const instanceId = parts.slice(1).join(':');
  if (!worldId || !instanceId) {
    throw new Error(
      'Current location is malformed; unable to extract worldId/instanceId. Use vrchat_invite_user with explicit instanceId/location.',
    );
  }

  return { worldId, instanceId, location, userId };
}

export async function resolveCurrentInviteLocation(): Promise<InviteCurrentLocation> {
  const current = await resolveCurrentInviteContext();
  return {
    worldId: current.worldId,
    instanceId: current.instanceId,
    location: current.location,
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

async function resolveInviteDestination(input: UnifiedInviteInput): Promise<ResolvedInviteDestination> {
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
    return { destination: { kind: 'instance', instanceId: input.instanceId } };
  }
  if (hasWorldId && hasInstanceId) {
    return {
      destination: {
        kind: 'world_instance',
        worldId: input.worldId,
        instanceId: input.instanceId,
        location: `${input.worldId}:${input.instanceId}`,
      },
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
    return { destination: { kind: 'location', location, worldId, instanceId } };
  }

  const current = await resolveCurrentInviteContext();
  return {
    destination: {
      kind: 'here',
      location: current.location,
      worldId: current.worldId,
      instanceId: current.instanceId,
    },
    currentUserId: current.userId,
  };
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
  const destinationContext = await resolveInviteDestination(input);
  const { destination } = destinationContext;
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
        totalTargets: targetInputs.length,
        stoppedAfterFailure: resolution.stopped,
      }),
      destination,
    };
  }

  const messagePlan = await resolveInviteMessagePlan(input, dryRun, destinationContext.currentUserId);
  const request = inviteRequestForDestination(destination, messagePlan);
  const summary = await executeResolvedUserWrites({
    targets: resolution.targets,
    initialResults: resolution.results,
    totalTargets: targetInputs.length,
    stoppedAfterFailure: resolution.stopped,
    dryRun,
    continueOnError,
    retry,
    send: (target) => sendUserInvite(target.userId, request),
  });

  return { ...summary, destination, message: messagePlan };
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
          confirmOverrideBlock: input.confirmOverrideBlock === true,
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
