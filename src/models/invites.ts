import { z } from 'zod';
import { schemas } from '../generated/vrchat-schemas.js';

export const InviteSelfSchema = z.object({
  worldId: z.string().optional(),
  instanceId: z.string().optional(),
  location: z.string().optional(),
});

export const InviteSelfOutputSchema = z.object({
  status: z.literal('sent'),
  notification: schemas.SentNotification.partial().optional(),
});

export const InviteUserSchema = z.object({
  userId: z.string(),
  instanceId: z.string().optional(),
  location: z.string().optional(),
  messageSlot: z.number().int().min(0).max(11).optional(),
});

export const InviteUserOutputSchema = z.object({
  status: z.literal('sent'),
  notification: schemas.SentNotification.partial().optional(),
});

export type InviteSelfInput = z.infer<typeof InviteSelfSchema>;
export type InviteUserInput = z.infer<typeof InviteUserSchema>;
