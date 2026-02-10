import type { InstanceCreateInput, InstanceCreateRequest } from '../../models/instances.js';
import { checkGroupAllowed } from '../groups/allowlist.js';
import { callWriteOperationParsed, type WriteOperationData } from '../api/client.js';

export type InstanceCreatePreparation =
  | { ok: true; request: InstanceCreateRequest }
  | { ok: false; reason: string };

type InstanceRecord = WriteOperationData<'createInstance'>;

type OwnerIdResolution = { ok: true; ownerId: string | null } | { ok: false; reason: string };

function resolveOwnerId(input: InstanceCreateInput): OwnerIdResolution {
  if (input.type === 'group') {
    const groupId = input.groupId ?? input.ownerId ?? null;
    if (!groupId) {
      return { ok: false, reason: 'groupId (or ownerId) is required when type=group.' };
    }
    const allowed = checkGroupAllowed(groupId);
    if (!allowed.ok) {
      return { ok: false, reason: allowed.reason };
    }
    return { ok: true, ownerId: groupId };
  }

  if (input.groupId) {
    return { ok: false, reason: 'groupId is only valid when type=group.' };
  }
  return { ok: true, ownerId: input.ownerId ?? null };
}

function applyOptionalFields(request: InstanceCreateRequest, input: InstanceCreateInput): void {
  if (input.displayName) request.displayName = input.displayName;
  if (input.inviteOnly !== undefined) request.inviteOnly = input.inviteOnly;
  if (input.canRequestInvite !== undefined) request.canRequestInvite = input.canRequestInvite;
  if (input.queueEnabled !== undefined) request.queueEnabled = input.queueEnabled;
  if (input.ageGate !== undefined) request.ageGate = input.ageGate;
  if (input.instancePersistenceEnabled !== undefined) {
    request.instancePersistenceEnabled = input.instancePersistenceEnabled;
  }
  if (input.closedAt) request.closedAt = input.closedAt;
  if (input.hardClose !== undefined) request.hardClose = input.hardClose;
  if (input.contentSettings) request.contentSettings = input.contentSettings;
}

function applyGroupFields(
  request: InstanceCreateRequest,
  input: InstanceCreateInput
): InstanceCreatePreparation {
  if (input.type === 'group') {
    if (input.groupAccessType) request.groupAccessType = input.groupAccessType;
    if (input.roleIds) request.roleIds = input.roleIds;
    return { ok: true, request };
  }
  if (input.groupAccessType || input.roleIds) {
    return { ok: false, reason: 'groupAccessType and roleIds only apply to group instances.' };
  }
  return { ok: true, request };
}

export function prepareInstanceCreate(input: InstanceCreateInput): InstanceCreatePreparation {
  const ownerResult = resolveOwnerId(input);
  if (!ownerResult.ok) return ownerResult;

  const request: InstanceCreateRequest = {
    worldId: input.worldId,
    type: input.type,
    region: input.region,
  };

  if (ownerResult.ownerId) request.ownerId = ownerResult.ownerId;

  const groupFieldsResult = applyGroupFields(request, input);
  if (!groupFieldsResult.ok) return groupFieldsResult;

  applyOptionalFields(request, input);
  return { ok: true, request };
}

export async function createInstance(
  request: InstanceCreateRequest
): Promise<InstanceRecord | null> {
  const result = await callWriteOperationParsed('createInstance', undefined, request);
  return result.data ?? null;
}
