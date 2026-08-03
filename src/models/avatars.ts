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

/** VRChat's content-gating tags. Deliberately no default: callers state intent explicitly. */
export const AVATAR_CONTENT_TAGS = [
  'content_sex',
  'content_adult',
  'content_violence',
  'content_gore',
  'content_horror',
] as const;

export const AvatarUpdateInputSchema = z
  .object({
    // Matches the `user` convention on vrchat_boop / vrchat_friend_request: a human-readable
    // name is first-class, the ID is there for precision and for disambiguation.
    avatar: z
      .string()
      .min(1)
      .describe('Avatar to edit: an avtr_ ID, or the exact name of one of your own avatars.'),
    name: z.string().min(1).optional().describe('New name for the avatar.'),
    description: z.string().optional(),
    releaseStatus: schemas.ReleaseStatus.optional(),
    // Merge semantics, never a blind replace: `updateAvatar` overwrites the whole tags array, so
    // a raw set would silently drop author tags the caller never intended to touch.
    addTags: z.array(z.enum(AVATAR_CONTENT_TAGS)).min(1).optional(),
    removeTags: z.array(z.enum(AVATAR_CONTENT_TAGS)).min(1).optional(),
    // Strips every `content_*` tag, including ones newer than AVATAR_CONTENT_TAGS, so clearing
    // still works when VRChat adds a tag this build doesn't know about.
    clearContentTags: z.boolean().optional(),
    dryRun: z.boolean().optional(),
  })
  .superRefine((input, ctx) => {
    const hasEdit =
      input.name !== undefined ||
      input.description !== undefined ||
      input.releaseStatus !== undefined ||
      input.addTags !== undefined ||
      input.removeTags !== undefined ||
      input.clearContentTags === true;
    if (!hasEdit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Provide at least one of name, description, releaseStatus, addTags, removeTags, clearContentTags.',
        path: ['name'],
      });
    }
    if (input.clearContentTags && input.removeTags) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'clearContentTags already removes every content tag; drop removeTags.',
        path: ['removeTags'],
      });
    }
    const overlap = (input.addTags ?? []).filter((tag) => (input.removeTags ?? []).includes(tag));
    if (overlap.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Tags cannot be both added and removed: ${overlap.join(', ')}`,
        path: ['removeTags'],
      });
    }
  });

export const AvatarUpdateOutputSchema = z.object({
  avatarId: z.string(),
  dryRun: z.boolean(),
  status: z.enum(['updated', 'unchanged']),
  changes: z.record(z.string(), z.unknown()).optional(),
  tags: z.array(z.string()),
});

export type AvatarUpdateInput = z.infer<typeof AvatarUpdateInputSchema>;
export type AvatarUpdateOutput = z.infer<typeof AvatarUpdateOutputSchema>;
