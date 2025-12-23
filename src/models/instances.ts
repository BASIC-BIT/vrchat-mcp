import { z } from 'zod';
import { schemas } from '../generated/vrchat-schemas.js';

export const InstanceTypeSchema = z.enum(['friends', 'group', 'hidden', 'private', 'public']);
export const InstanceRegionSchema = z.enum(['eu', 'jp', 'unknown', 'us', 'use']);
export const GroupAccessTypeSchema = z.enum(['members', 'plus', 'public']);

export const InstanceCreateSchema = z.object({
  worldId: z.string(),
  type: InstanceTypeSchema,
  region: InstanceRegionSchema,
  groupId: z.string().optional(),
  ownerId: z.string().optional(),
  groupAccessType: GroupAccessTypeSchema.optional(),
  roleIds: z.array(z.string()).optional(),
  displayName: z.string().optional(),
  inviteOnly: z.boolean().optional(),
  canRequestInvite: z.boolean().optional(),
  queueEnabled: z.boolean().optional(),
  ageGate: z.boolean().optional(),
  instancePersistenceEnabled: z.boolean().optional(),
  closedAt: z.string().optional(),
  hardClose: z.boolean().optional(),
  contentSettings: z.record(z.string(), z.boolean()).optional(),
  confirmId: z.string().optional(),
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
}).partial();

export const InstanceCreateOutputSchema = z.object({
  status: z.enum(['confirm_required', 'created']),
  confirmId: z.string().optional(),
  expiresAt: z.string().optional(),
  instance: InstanceSummarySchema.nullable().optional(),
});

export type InstanceCreateInput = z.infer<typeof InstanceCreateSchema>;
export type InstanceSummary = z.infer<typeof InstanceSummarySchema>;
