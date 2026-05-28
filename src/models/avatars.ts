import { z } from 'zod';
import { schemas } from '../generated/vrchat-schemas.js';
import { ApiObjectSchema } from './common.js';

export const AvatarShapeSchema = z.object({
  fields: z.array(z.string()).optional(),
  compact: z.boolean().optional(),
  maxArrayLength: z.number().int().positive().optional(),
});

export const AvatarProfileInputSchema = AvatarShapeSchema.extend({
  avatarId: schemas.AvatarID,
});

export const AvatarProfileOutputSchema = z.object({
  avatarId: schemas.AvatarID,
  stale: z.boolean(),
  avatar: ApiObjectSchema,
  vrcxMemo: z
    .object({
      editedAt: z.string().nullable(),
      memo: z.string().nullable(),
    })
    .optional(),
});

export type AvatarProfileInput = z.infer<typeof AvatarProfileInputSchema>;
export type AvatarProfileOutput = z.infer<typeof AvatarProfileOutputSchema>;
