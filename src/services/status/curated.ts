import { callReadOperationParsed, callWriteOperationParsed } from '../api/client.js';
import { STATUS_FROM_COLOR, StatusSchema } from '../../models/status.js';
import type {
  StatusColor,
  StatusGetOutput,
  StatusSetInput,
  StatusValue,
} from '../../models/status.js';
import { resolveUserId } from '../users/index.js';

const STATUS_VALUES = new Set<StatusValue>(StatusSchema.options);

function isStatusValue(value: string): value is StatusValue {
  return STATUS_VALUES.has(value as StatusValue);
}

function resolveStatus(input: { status?: StatusValue; color?: StatusColor }): StatusValue | null {
  if (input.status) return input.status;
  if (input.color) return STATUS_FROM_COLOR[input.color];
  return null;
}

export async function getCurrentStatus(): Promise<StatusGetOutput> {
  const result = await callReadOperationParsed('getCurrentUser', {});
  const user = result.data;
  return {
    userId: typeof user?.id === 'string' ? user.id : undefined,
    status:
      typeof user?.status === 'string' && isStatusValue(user.status) ? user.status : undefined,
    statusDescription:
      typeof user?.statusDescription === 'string' ? user.statusDescription : undefined,
  };
}

export async function updateStatus(input: StatusSetInput): Promise<{
  userId: string;
  status: StatusValue;
  statusDescription?: string;
}> {
  const status = resolveStatus(input);
  if (!status) {
    throw new Error('Provide status or color.');
  }
  const resolved = await resolveUserId({ userId: input.userId });
  if (!resolved.ok) {
    throw new Error(resolved.reason);
  }

  const body: { status: StatusValue; statusDescription?: string } = { status };
  if (typeof input.description === 'string') {
    body.statusDescription = input.description;
  }

  const result = await callWriteOperationParsed('updateUser', { userId: resolved.userId }, body);
  const user = result.data;
  const responseStatus =
    typeof user?.status === 'string' && isStatusValue(user.status) ? user.status : undefined;
  const finalStatus =
    responseStatus && (responseStatus !== 'offline' || status === 'offline')
      ? responseStatus
      : status;
  return {
    userId: typeof user?.id === 'string' ? user.id : resolved.userId,
    status: finalStatus,
    statusDescription:
      typeof user?.statusDescription === 'string'
        ? user.statusDescription
        : typeof body.statusDescription === 'string'
          ? body.statusDescription
          : undefined,
  };
}
