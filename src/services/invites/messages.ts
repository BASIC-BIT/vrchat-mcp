import { callOperation } from '../../core/client.js';
import type { UnifiedInviteInput } from '../../models/invites.js';
import { asRecord } from './bulk.js';

export interface InviteMessagePlan {
  requested?: string;
  slot?: number;
  matchedExisting?: boolean;
  overwrittenSlot?: number;
  wouldOverwriteSlot?: number;
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

export async function resolveInviteMessagePlan(
  input: UnifiedInviteInput,
  dryRun: boolean,
  currentUserId?: string,
): Promise<InviteMessagePlan | undefined> {
  const message = typeof input.message === 'string' ? input.message.trim() : '';
  if (!message) return undefined;
  if (input.self) {
    throw new Error('Self-invite cannot use invite messages because VRChat self-invite has no message slot body.');
  }

  const userId = currentUserId ?? await getCurrentUserId();
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
