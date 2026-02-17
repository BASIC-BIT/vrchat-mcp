import { z } from 'zod';
import { schemas } from '../generated/vrchat-schemas.js';

export const InviteSelfSchema = z.object({
  worldId: schemas.WorldID.optional(),
  instanceId: schemas.InstanceID.optional(),
  location: z.string().optional(),
});

export const InviteSelfOutputSchema = z.object({
  status: z.literal('sent'),
  notification: schemas.SentNotification.partial().optional(),
});

export const InviteUserSchema = z.object({
  userId: schemas.UserID,
  instanceId: schemas.InstanceID.optional(),
  location: z.string().optional(),
  messageSlot: z.number().int().min(0).max(11).optional(),
});

export const InviteUserOutputSchema = z.object({
  status: z.literal('sent'),
  notification: schemas.SentNotification.partial().optional(),
});

export const InviteUserToMeSchema = z.object({
  userId: schemas.UserID,
  messageSlot: z.number().int().min(0).max(11).optional(),
});

export const InviteUserToMeOutputSchema = z.object({
  status: z.literal('sent'),
  userId: schemas.UserID,
  worldId: schemas.WorldID,
  instanceId: schemas.InstanceID,
  location: z.string(),
  notification: schemas.SentNotification.partial().optional(),
});

export type InviteSelfInput = z.infer<typeof InviteSelfSchema>;
export type InviteUserInput = z.infer<typeof InviteUserSchema>;
export type InviteUserToMeInput = z.infer<typeof InviteUserToMeSchema>;
