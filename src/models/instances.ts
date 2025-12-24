import { z } from 'zod';
import { schemas } from '../generated/vrchat-schemas.js';

export const InstanceCreateSchema = z.object({
  worldId: schemas.WorldID,
  type: schemas.InstanceType,
  region: schemas.InstanceRegion,
  groupId: schemas.GroupID.optional(),
  ownerId: schemas.CreateInstanceRequest.shape.ownerId,
  groupAccessType: schemas.GroupAccessType.optional(),
  roleIds: z.array(schemas.GroupRoleID).optional(),
  displayName: schemas.CreateInstanceRequest.shape.displayName,
  inviteOnly: z.boolean().optional(),
  canRequestInvite: z.boolean().optional(),
  queueEnabled: z.boolean().optional(),
  ageGate: z.boolean().optional(),
  instancePersistenceEnabled:
    schemas.CreateInstanceRequest.shape.instancePersistenceEnabled,
  closedAt: schemas.CreateInstanceRequest.shape.closedAt,
  hardClose: z.boolean().optional(),
  contentSettings: schemas.InstanceContentSettings.optional(),
});

export const InstanceSummarySchema = schemas.Instance.pick({
  id: true,
  instanceId: true,
  location: true,
  worldId: true,
  userCount: true,
  n_users: true,
  capacity: true,
  recommendedCapacity: true,
  full: true,
  hasCapacityForYou: true,
  queueEnabled: true,
  queueSize: true,
  type: true,
  groupAccessType: true,
  region: true,
  photonRegion: true,
  canRequestInvite: true,
  tags: true,
  displayName: true,
  shortName: true,
  name: true,
})
  .partial()
  .extend({
    region: schemas.Region.optional(),
    photonRegion: schemas.Region.optional(),
  });

export const InstanceCreateOutputSchema = z.object({
  status: z.literal('created'),
  instance: InstanceSummarySchema.nullable().optional(),
});

export type InstanceCreateInput = z.infer<typeof InstanceCreateSchema>;
export type InstanceSummary = z.infer<typeof InstanceSummarySchema>;
export type InstanceCreateRequest = z.input<typeof schemas.CreateInstanceRequest>;
