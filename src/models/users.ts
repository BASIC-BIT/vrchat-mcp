import { z } from 'zod';
import { schemas } from '../generated/vrchat-schemas.js';
import { GroupPageSchema, GroupSummarySchema } from './groups.js';

export const UserShapeSchema = z.object({
  fields: z.array(z.string()).optional(),
  compact: z.boolean().optional(),
  maxArrayLength: z.number().int().positive().optional(),
});

export const SelfProfileViewSchema = z.enum(['summary', 'presence', 'profile']);

export const CurrentUserProfileInputSchema = UserShapeSchema.extend({
  view: SelfProfileViewSchema.optional(),
  includeGroups: z.boolean().optional(),
  groupPageSize: z.number().int().min(1).max(100).optional(),
  groupMaxPages: z.number().int().min(1).max(50).optional(),
  groupOffset: z.number().int().min(0).optional(),
});

export const DEFAULT_SELF_FIELDS = [
  'id',
  'displayName',
  'username',
  'status',
  'statusDescription',
  'statusEmoji',
  'location',
  'last_login',
  'last_platform',
  'userIcon',
  'profilePicOverride',
  'currentAvatarImageUrl',
  'currentAvatarThumbnailImageUrl',
  'bio',
  'bioLinks',
  'tags',
  'developerType',
  'state',
  'twoFactorAuthEnabled',
] as const;

export const SUMMARY_SELF_FIELDS = [
  'id',
  'displayName',
  'username',
  'status',
  'statusDescription',
  'location',
  'last_login',
  'last_platform',
  'userIcon',
  'currentAvatarThumbnailImageUrl',
] as const;

export const PRESENCE_SELF_FIELDS = [
  'id',
  'displayName',
  'status',
  'statusDescription',
  'statusEmoji',
  'location',
  'last_login',
  'last_platform',
] as const;

export const UserGroupsOutputSchema = z.object({
  userId: schemas.UserID,
  pageSize: z.number().int().min(1),
  maxPages: z.number().int().min(1),
  totalGroups: z.number().int().min(0),
  truncated: z.boolean(),
  stale: z.boolean(),
  page: GroupPageSchema,
  groups: z.array(GroupSummarySchema),
});

export const UserProfileInputSchema = UserShapeSchema.extend({
  userId: schemas.UserID.optional(),
  username: z.string().optional(),
  includeGroups: z.boolean().optional(),
  groupPageSize: z.number().int().min(1).max(100).optional(),
  groupMaxPages: z.number().int().min(1).max(50).optional(),
  groupOffset: z.number().int().min(0).optional(),
});

export const VrcxMemoSchema = z.object({
  editedAt: z.string().nullable(),
  memo: z.string().nullable(),
});

export const UserProfileOutputSchema = z.object({
  userId: schemas.UserID,
  user: schemas.User.partial(),
  groups: UserGroupsOutputSchema.optional(),
  vrcxMemo: VrcxMemoSchema.optional(),
});

export const ProfileUpdateInputSchema = schemas.UpdateUserRequest.pick({
  bio: true,
  bioLinks: true,
  pronouns: true,
  userIcon: true,
  isBoopingEnabled: true,
  contentFilters: true,
}).strict();

export const PROFILE_UPDATE_FIELDS = [
  ...DEFAULT_SELF_FIELDS,
  'pronouns',
  'isBoopingEnabled',
  'contentFilters',
] as const;

export const ProfileUpdateOutputSchema = z.object({
  userId: schemas.UserID,
  user: schemas.CurrentUser.partial(),
});

export const UserGroupsInputSchema = z.object({
  userId: schemas.UserID.optional(),
  username: z.string().optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  maxPages: z.number().int().min(1).max(50).optional(),
  offset: z.number().int().min(0).optional(),
});

export type UserGroupsOutput = z.infer<typeof UserGroupsOutputSchema>;
export type CurrentUserProfileInput = z.infer<typeof CurrentUserProfileInputSchema>;
export type SelfProfileView = z.infer<typeof SelfProfileViewSchema>;
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateInputSchema>;
export type ProfileUpdateOutput = z.infer<typeof ProfileUpdateOutputSchema>;
