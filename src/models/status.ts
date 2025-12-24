import { z } from 'zod';
import { schemas } from '../generated/vrchat-schemas.js';

export const StatusSchema = schemas.UserStatus;
export const StatusColorSchema = z.enum(['blue', 'green', 'orange', 'red']);

export const StatusGetOutputSchema = z.object({
  userId: schemas.UserID.optional(),
  status: StatusSchema.optional(),
  statusDescription: z.string().optional(),
});

export const StatusSetInputSchema = z.object({
  status: StatusSchema.optional(),
  color: StatusColorSchema.optional(),
  description: z.string().optional(),
  userId: schemas.UserID.optional(),
});

export const StatusSetOutputSchema = z.object({
  userId: schemas.UserID,
  status: StatusSchema,
  statusDescription: z.string().optional(),
});

export type StatusValue = z.infer<typeof StatusSchema>;
export type StatusColor = z.infer<typeof StatusColorSchema>;
export type StatusGetOutput = z.infer<typeof StatusGetOutputSchema>;
export type StatusSetInput = z.infer<typeof StatusSetInputSchema>;
export type StatusSetOutput = z.infer<typeof StatusSetOutputSchema>;
