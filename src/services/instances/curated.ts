import type {
  InstanceCreateInput,
  InstanceCreateRequest,
  InstanceLinkEventInput,
} from '../../models/instances.js';
import { checkGroupAllowed } from '../groups/allowlist.js';
import {
  callReadOperationParsed,
  callWriteOperationParsed,
  type WriteOperationData,
} from '../api/client.js';
import { cacheManager } from '../cache.js';

export type InstanceCreatePreparation =
  | { ok: true; request: InstanceCreateRequest }
  | { ok: false; reason: string };

type InstanceRecord = WriteOperationData<'createInstance'>;

type OwnerIdResolution = { ok: true; ownerId: string | null } | { ok: false; reason: string };

const instanceLinkLocks = new Map<string, Promise<unknown>>();

function withInstanceLinkLock<T>(location: string, run: () => Promise<T>): Promise<T> {
  const prior = instanceLinkLocks.get(location) ?? Promise.resolve();
  const result = prior.then(run, run);
  const settled = result.then(
    () => undefined,
    () => undefined
  );
  instanceLinkLocks.set(location, settled);
  void settled.then(() => {
    if (instanceLinkLocks.get(location) === settled) instanceLinkLocks.delete(location);
  });
  return result;
}

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
  if (input.calendarEntryId !== undefined) request.calendarEntryId = input.calendarEntryId;
  if (input.instancePersistenceEnabled !== undefined) {
    request.instancePersistenceEnabled = input.instancePersistenceEnabled;
  }
  if (input.playerPersistenceEnabled !== undefined) {
    request.playerPersistenceEnabled = input.playerPersistenceEnabled;
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

function invalidateInstanceLinkCaches(input: InstanceLinkEventInput): void {
  cacheManager.invalidateByTag(`instances:${input.worldId}`);
  cacheManager.invalidateByTag(`groups:${input.groupId}`);
}

async function applyInstanceCalendarLink(input: InstanceLinkEventInput) {
  const eventResult = await callReadOperationParsed('getGroupCalendarEvent', {
    groupId: input.groupId,
    calendarId: input.calendarId,
  });
  const event = eventResult.data;
  if (!event) throw new Error(`Calendar event ${input.calendarId} not found.`);
  if (event.ownerId !== input.groupId) {
    throw new Error(
      `Refusing to link calendar event ${input.calendarId}: it is not owned by group ${input.groupId}.`
    );
  }

  const instanceResult = await callReadOperationParsed('getInstance', {
    worldId: input.worldId,
    instanceId: input.instanceId,
  });
  const instance = instanceResult.data;
  if (!instance) throw new Error(`Instance ${input.worldId}:${input.instanceId} not found.`);
  if (instance.type !== 'group' || instance.ownerId !== input.groupId) {
    throw new Error(
      `Refusing to link instance ${input.worldId}:${input.instanceId}: it is not owned by group ${input.groupId}.`
    );
  }
  const resultDetails = {
    eventTitle: event.title,
    instanceName: instance.displayName ?? instance.name,
  };
  if (instance.calendarEntryId === input.calendarId) {
    invalidateInstanceLinkCaches(input);
    return { status: 'already_linked' as const, ...resultDetails };
  }
  if (instance.calendarEntryId) {
    invalidateInstanceLinkCaches(input);
    throw new Error(
      `Refusing to replace existing calendar link ${instance.calendarEntryId} on instance ${input.worldId}:${input.instanceId}.`
    );
  }

  try {
    await callWriteOperationParsed(
      'updateInstance',
      { worldId: input.worldId, instanceId: input.instanceId },
      { calendarEntryId: input.calendarId }
    );
  } finally {
    invalidateInstanceLinkCaches(input);
  }
  return { status: 'linked' as const, ...resultDetails };
}

export async function linkInstanceToCalendarEvent(input: InstanceLinkEventInput) {
  const allowed = checkGroupAllowed(input.groupId);
  if (!allowed.ok) throw new Error(allowed.reason);

  return withInstanceLinkLock(`${input.worldId}:${input.instanceId}`, () =>
    applyInstanceCalendarLink(input)
  );
}
