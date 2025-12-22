import { callOperation } from '../../core/client.js';
import type { StatusColor, StatusGetOutput, StatusSetInput, StatusValue } from '../../models/status.js';
import { resolveUserId } from '../users/index.js';

const STATUS_FROM_COLOR: Record<StatusColor, StatusValue> = {
  blue: 'active',
  green: 'join me',
  orange: 'ask me',
  red: 'busy',
};

function resolveStatus(input: { status?: StatusValue; color?: StatusColor }): StatusValue | null {
  if (input.status) return input.status;
  if (input.color) return STATUS_FROM_COLOR[input.color];
  return null;
}

export async function getCurrentStatus(): Promise<StatusGetOutput> {
  const result = await callOperation({ operationId: 'getCurrentUser' });
  const user = result.data as Record<string, unknown> | undefined;
  return {
    userId: typeof user?.id === 'string' ? user.id : undefined,
    status: typeof user?.status === 'string' ? (user.status as StatusValue) : undefined,
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

  const body: Record<string, unknown> = { status };
  if (typeof input.description === 'string') {
    body.statusDescription = input.description;
  }

  const result = await callOperation({
    operationId: 'updateUser',
    params: { userId: resolved.userId },
    body,
  });
  const user = result.data as Record<string, unknown> | undefined;
  return {
    userId: typeof user?.id === 'string' ? user.id : resolved.userId,
    status: typeof user?.status === 'string' ? (user.status as StatusValue) : status,
    statusDescription:
      typeof user?.statusDescription === 'string'
        ? user.statusDescription
        : typeof body.statusDescription === 'string'
          ? body.statusDescription
          : undefined,
  };
}
