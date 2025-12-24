import type { z } from 'zod';
import type { InviteSelfInput, InviteUserInput } from '../../models/invites.js';
import type { schemas } from '../../generated/vrchat-schemas.js';
import { callWriteOperationParsed, type WriteOperationData } from '../api/client.js';

export interface InviteLocation {
  worldId: string;
  instanceId: string;
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
    instanceId = resolveInviteInstanceId({ instanceId: input.instanceId, location: input.location });
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
