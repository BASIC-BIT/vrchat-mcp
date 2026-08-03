import { z } from 'zod';
import { schemas } from '../generated/vrchat-schemas.js';
import { ApiObjectSchema } from './common.js';

export const InviteSelfSchema = z.object({
  worldId: schemas.WorldID.optional(),
  instanceId: schemas.InstanceID.optional(),
  location: z.string().optional(),
});

export const InviteSelfOutputSchema = z.object({
  status: z.literal('sent'),
  notification: ApiObjectSchema.optional(),
});

export const InviteUserSchema = z.object({
  userId: schemas.UserID,
  worldId: schemas.WorldID.optional().describe(
    'World of the target instance. Pair with instanceId.'
  ),
  instanceId: schemas.InstanceID.optional().describe(
    'Instance to invite into. Pair with worldId, or pass the full "wrld_:instance" string here. VRChat rejects a bare instance ID on its own.'
  ),
  location: z
    .string()
    .optional()
    .describe('Full location string like "wrld_:instance". Simplest option when you have it.'),
  messageSlot: z.number().int().min(0).max(11).optional(),
}).superRefine((input, ctx) => {
  // Silently preferring location over an explicit pair would invite people to a different
  // instance than the caller named, so make the forms mutually exclusive.
  if (input.location && (input.worldId || input.instanceId)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Provide either location, or worldId + instanceId — not both.',
      path: ['location'],
    });
  }
  if (input.worldId && !input.instanceId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'worldId requires instanceId.',
      path: ['instanceId'],
    });
  }
});

export const InviteUserOutputSchema = z.object({
  status: z.literal('sent'),
  notification: ApiObjectSchema.optional(),
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
  notification: ApiObjectSchema.optional(),
});

export const BulkRetryInputSchema = z.object({
  maxAttempts: z.number().int().min(1).max(8).optional(),
  baseDelayMs: z.number().int().min(0).max(60_000).optional(),
  maxDelayMs: z.number().int().min(0).max(120_000).optional(),
});

export const BulkUserTargetsSchema = z.object({
  user: z.string().min(1).optional(),
  users: z.array(z.string().min(1)).min(1).max(50).optional(),
});

export const BulkWriteOptionsSchema = z.object({
  dryRun: z.boolean().optional(),
  continueOnError: z.boolean().optional(),
  retry: BulkRetryInputSchema.optional(),
});

export const UnifiedInviteSchema = BulkUserTargetsSchema.merge(BulkWriteOptionsSchema).extend({
  here: z.boolean().optional(),
  location: z.string().min(1).optional(),
  worldId: schemas.WorldID.optional(),
  instanceId: schemas.InstanceID.optional(),
  self: z.boolean().optional(),
  message: z.string().min(1).optional(),
  overwriteMessageSlot: z.number().int().min(0).max(11).optional(),
});

export const BulkTargetResultSchema = z.object({
  target: z.string(),
  userId: schemas.UserID.optional(),
  displayName: z.string().optional(),
  status: z.enum(['sent', 'failed', 'skipped', 'would_send']),
  attempts: z.number().int().min(0).optional(),
  notification: ApiObjectSchema.optional(),
  data: z.any().optional(),
  error: z.string().optional(),
});

export const BulkWriteSummarySchema = z.object({
  status: z.enum(['completed', 'dry_run']),
  dryRun: z.boolean(),
  continueOnError: z.boolean(),
  totalTargets: z.number().int().min(0),
  sent: z.number().int().min(0),
  failed: z.number().int().min(0),
  skipped: z.number().int().min(0),
  stoppedAfterFailure: z.boolean().optional(),
  results: z.array(BulkTargetResultSchema),
});

export const UnifiedInviteOutputSchema = BulkWriteSummarySchema.extend({
  destination: z.object({
    kind: z.enum(['here', 'location', 'world_instance', 'instance']),
    location: z.string().optional(),
    worldId: schemas.WorldID.optional(),
    instanceId: schemas.InstanceID.optional(),
  }),
  message: z
    .object({
      requested: z.string().optional(),
      slot: z.number().int().min(0).max(11).optional(),
      matchedExisting: z.boolean().optional(),
      overwrittenSlot: z.number().int().min(0).max(11).optional(),
      wouldOverwriteSlot: z.number().int().min(0).max(11).optional(),
    })
    .optional(),
});

export const GroupInviteSchema = BulkUserTargetsSchema.merge(BulkWriteOptionsSchema).extend({
  groupId: schemas.GroupID.optional(),
  shortCode: z.string().optional(),
  confirmOverrideBlock: z.boolean().default(false).optional(),
});

export const GroupInviteOutputSchema = BulkWriteSummarySchema.extend({
  groupId: schemas.GroupID,
});

export const FriendRequestSchema = BulkUserTargetsSchema.merge(BulkWriteOptionsSchema);
export const FriendRequestOutputSchema = BulkWriteSummarySchema;

export const BoopSchema = BulkUserTargetsSchema.merge(BulkWriteOptionsSchema).extend({
  emojiId: schemas.EmojiID.optional(),
  emojiVersion: z.number().int().optional(),
  inventoryItemId: schemas.InventoryItemID.optional(),
});

export const BoopOutputSchema = BulkWriteSummarySchema;

export type InviteSelfInput = z.infer<typeof InviteSelfSchema>;
export type InviteUserInput = z.infer<typeof InviteUserSchema>;
export type InviteUserToMeInput = z.infer<typeof InviteUserToMeSchema>;
export type UnifiedInviteInput = z.infer<typeof UnifiedInviteSchema>;
export type GroupInviteInput = z.infer<typeof GroupInviteSchema>;
export type FriendRequestInput = z.infer<typeof FriendRequestSchema>;
export type BoopInput = z.infer<typeof BoopSchema>;
