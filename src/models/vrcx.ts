import { z } from 'zod';
import { schemas } from '../generated/vrchat-schemas.js';

export const VrcxPathSourceSchema = z.enum(['config', 'vrcx_json', 'default', 'unknown']);

export const VrcxPathInfoSchema = z.object({
  path: z.string().nullable(),
  exists: z.boolean(),
  source: VrcxPathSourceSchema,
});

export const VrcxStatusInputSchema = z.object({});

export const VrcxStatusOutputSchema = z.object({
  enabled: z.boolean(),
  available: z.boolean(),
  db: VrcxPathInfoSchema,
  worldDb: VrcxPathInfoSchema,
  vrcxJson: z.object({
    path: z.string().nullable(),
    exists: z.boolean(),
  }),
  activeUserId: schemas.UserID.nullable(),
  userPrefix: z.string().nullable(),
  databaseVersion: z.number().int().nullable(),
  warnings: z.array(z.string()).optional(),
});

export const VrcxUserMemoInputSchema = z.object({
  userId: schemas.UserID,
});

export const VrcxUserMemoOutputSchema = z.object({
  userId: schemas.UserID,
  editedAt: z.string().nullable(),
  memo: z.string().nullable(),
});

export const VrcxWorldMemoInputSchema = z.object({
  worldId: schemas.WorldID,
});

export const VrcxWorldMemoOutputSchema = z.object({
  worldId: schemas.WorldID,
  editedAt: z.string().nullable(),
  memo: z.string().nullable(),
});

export const VrcxAvatarMemoInputSchema = z.object({
  avatarId: schemas.AvatarID,
});

export const VrcxAvatarMemoOutputSchema = z.object({
  avatarId: schemas.AvatarID,
  editedAt: z.string().nullable(),
  memo: z.string().nullable(),
});

export const VrcxRecentWorldVisitsInputSchema = z.object({
  daysBack: z.number().int().min(1).max(365).optional(),
  limit: z.number().int().min(1).max(1000).optional(),
});

export const VrcxWorldVisitSchema = z.object({
  rowId: z.number().int(),
  createdAt: z.string(),
  location: z.string(),
  worldId: schemas.WorldID.optional(),
  worldName: z.string().optional(),
  groupName: z.string().nullable().optional(),
  groupId: schemas.GroupID.optional(),
  accessType: z.string().optional(),
  region: z.string().optional(),
  timeMs: z.number().int().min(0).optional(),
});

export const VrcxRecentWorldVisitsOutputSchema = z.object({
  from: z.string(),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  truncated: z.boolean(),
  visits: z.array(VrcxWorldVisitSchema),
});

export const VrcxRecentInstanceSessionsInputSchema = z.object({
  daysBack: z.number().int().min(1).max(365).optional(),
  limit: z.number().int().min(1).max(1000).optional(),
});

export const VrcxInstanceSessionSchema = z.object({
  rowId: z.number().int(),
  location: z.string(),
  joinTime: z.string().nullable(),
  leaveTime: z.string(),
  durationMs: z.number().int().min(0),
  worldId: schemas.WorldID.optional(),
  worldName: z.string().optional(),
  groupName: z.string().nullable().optional(),
  groupId: schemas.GroupID.optional(),
  accessType: z.string().optional(),
  region: z.string().optional(),
});

export const VrcxRecentInstanceSessionsOutputSchema = z.object({
  from: z.string(),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  truncated: z.boolean(),
  activeUserId: schemas.UserID.optional(),
  sessions: z.array(VrcxInstanceSessionSchema),
});

export const VrcxUserRelationshipSummaryInputSchema = z.object({
  userId: schemas.UserID.optional(),
  displayName: z.string().min(1).optional(),
});

export const VrcxUserRelationshipSummaryOutputSchema = z.object({
  query: z.object({
    userId: schemas.UserID.optional(),
    displayName: z.string().optional(),
  }),
  resolvedBy: z.enum(['userId', 'displayName', 'none']),
  resolvedUserId: schemas.UserID.nullable(),
  displayName: z.string().nullable(),
  lastSeen: z.string().nullable(),
  joinCount: z.number().int().min(0),
  timeSpentMs: z.number().int().min(0),
  timeSpentHours: z.number().min(0),
  hasData: z.boolean(),
});

export const VrcxUserRelationshipSessionsInputSchema = z.object({
  userId: schemas.UserID.optional(),
  displayName: z.string().min(1).optional(),
  limit: z.number().int().min(1).max(500).optional(),
});

export const VrcxUserRelationshipSessionsOutputSchema = z.object({
  query: z.object({
    userId: schemas.UserID.optional(),
    displayName: z.string().optional(),
  }),
  resolvedBy: z.enum(['userId', 'displayName', 'none']),
  resolvedUserId: schemas.UserID.nullable(),
  total: z.number().int().min(0),
  limit: z.number().int().min(1),
  truncated: z.boolean(),
  sessions: z.array(
    z.object({
      rowId: z.number().int(),
      location: z.string(),
      joinTime: z.string().nullable(),
      leaveTime: z.string(),
      durationMs: z.number().int().min(0),
      worldId: schemas.WorldID.optional(),
      worldName: z.string().optional(),
      groupName: z.string().nullable().optional(),
      groupId: schemas.GroupID.optional(),
      accessType: z.string().optional(),
      region: z.string().optional(),
      displayName: z.string().optional(),
    })
  ),
});

export type VrcxStatusInput = z.infer<typeof VrcxStatusInputSchema>;
export type VrcxStatusOutput = z.infer<typeof VrcxStatusOutputSchema>;
export type VrcxUserMemoInput = z.infer<typeof VrcxUserMemoInputSchema>;
export type VrcxUserMemoOutput = z.infer<typeof VrcxUserMemoOutputSchema>;
export type VrcxWorldMemoInput = z.infer<typeof VrcxWorldMemoInputSchema>;
export type VrcxWorldMemoOutput = z.infer<typeof VrcxWorldMemoOutputSchema>;
export type VrcxAvatarMemoInput = z.infer<typeof VrcxAvatarMemoInputSchema>;
export type VrcxAvatarMemoOutput = z.infer<typeof VrcxAvatarMemoOutputSchema>;
export type VrcxRecentWorldVisitsInput = z.infer<typeof VrcxRecentWorldVisitsInputSchema>;
export type VrcxRecentWorldVisitsOutput = z.infer<typeof VrcxRecentWorldVisitsOutputSchema>;
export type VrcxRecentInstanceSessionsInput = z.infer<typeof VrcxRecentInstanceSessionsInputSchema>;
export type VrcxRecentInstanceSessionsOutput = z.infer<
  typeof VrcxRecentInstanceSessionsOutputSchema
>;
export type VrcxUserRelationshipSummaryInput = z.infer<
  typeof VrcxUserRelationshipSummaryInputSchema
>;
export type VrcxUserRelationshipSummaryOutput = z.infer<
  typeof VrcxUserRelationshipSummaryOutputSchema
>;
export type VrcxUserRelationshipSessionsInput = z.infer<
  typeof VrcxUserRelationshipSessionsInputSchema
>;
export type VrcxUserRelationshipSessionsOutput = z.infer<
  typeof VrcxUserRelationshipSessionsOutputSchema
>;
