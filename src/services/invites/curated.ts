import type { z } from 'zod';
import type {
  InviteSelfInput,
  InviteUserInput,
  InviteUserToMeInput,
} from '../../models/invites.js';
import type { schemas } from '../../generated/vrchat-schemas.js';
import {
  callReadOperationParsed,
  callWriteOperationParsed,
  type WriteOperationData,
} from '../api/client.js';

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
