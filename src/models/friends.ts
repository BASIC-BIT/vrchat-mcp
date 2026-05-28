import { z } from 'zod';
import { schemas } from '../generated/vrchat-schemas.js';
import { ApiObjectSchema } from './common.js';
import { InstanceSummarySchema } from './instances.js';

export const FriendListDetailLevelSchema = z.enum(['summary', 'full']);

export const FriendListEntrySchema = z.object({
  userId: schemas.UserID.optional(),
  displayName: z.string().optional(),
  status: z.string().optional(),
  statusDescription: z.string().optional(),
  statusEmoji: z.string().optional(),
  location: z.string().optional(),
  userIcon: z.string().optional(),
  profilePicOverride: z.string().optional(),
  currentAvatarImageUrl: z.string().optional(),
  currentAvatarThumbnailImageUrl: z.string().optional(),
  last_login: z.string().optional(),
  last_platform: z.string().optional(),
});

export const FriendSearchInputSchema = z.object({
  query: z.string(),
  maxResults: z.number().int().min(1).optional(),
  includeOffline: z.boolean().optional(),
});

export const FriendSearchMatchSchema = z.object({
  userId: schemas.UserID,
  displayName: z.string(),
  location: z.string().optional(),
  status: z.string().optional(),
  matchScore: z.number().int().min(0),
  matchType: z.string(),
});

export const FriendSearchOutputSchema = z.object({
  query: z.string(),
  includeOffline: z.boolean(),
  totalFriends: z.number().int().min(0),
  matches: z.array(FriendSearchMatchSchema),
});

export const FriendsPageSchema = z.object({
  pages: z.number().int().min(0),
  items: z.number().int().min(0),
  pageSize: z.number().int().min(1),
  offsetStart: z.number().int().min(0),
  truncated: z.boolean(),
});

export const FriendsSegmentSchema = z.object({
  offline: z.boolean(),
  page: FriendsPageSchema.optional(),
});

export const FriendsListInputSchema = z.object({
  includeOffline: z.boolean().optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  maxPages: z.number().int().min(1).max(500).optional(),
  maxItems: z.number().int().min(1).optional(),
  detailLevel: FriendListDetailLevelSchema.optional(),
});

const FriendsListBaseSchema = z.object({
  includeOffline: z.boolean(),
  pageSize: z.number().int().min(1),
  maxPages: z.number().int().min(1),
  maxItems: z.number().int().min(1).optional(),
  totalFriends: z.number().int().min(0),
  truncated: z.boolean(),
  stale: z.boolean(),
  segments: z.array(FriendsSegmentSchema),
});

export const FriendsListOutputSchema = FriendsListBaseSchema.extend({
  detailLevel: FriendListDetailLevelSchema,
  friends: z.array(ApiObjectSchema),
});

const FriendStatusFilterSchema = z.union([
  z.string().min(1),
  z.array(z.string().min(1)).min(1),
]);

export const FriendLocationInfoSchema = z.object({
  raw: z.string().nullable(),
  type: z.string(),
  worldId: schemas.WorldID.optional(),
  instanceId: schemas.InstanceID.optional(),
  groupId: schemas.GroupID.optional(),
  accessType: z.string().optional(),
  region: z.string().optional(),
  worldName: z.string().optional(),
  groupName: z.string().optional(),
  groupShortCode: z.string().optional(),
});

export const FriendOverviewFriendSchema = z.object({
  userId: schemas.UserID.optional(),
  displayName: z.string().optional(),
  status: z.string().optional(),
});

export const FriendOverviewLocationSchema = FriendLocationInfoSchema.extend({   
  location: z.string(),
  instance: z.union([InstanceSummarySchema, ApiObjectSchema]).optional(),
  friendCount: z.number().int().min(0),
  friends: z.array(FriendOverviewFriendSchema),
});

export const FriendsOverviewInputSchema = z.object({
  includeOffline: z.boolean().optional(),
  status: FriendStatusFilterSchema.optional(),
  statusFilter: FriendStatusFilterSchema.optional(),
  minInstanceUserCount: z.number().int().min(0).optional(),
  instanceDetailLevel: z.enum(['summary', 'full']).optional(),
  maxLocations: z.number().int().min(1).max(200).optional(),
});

const FriendOverviewCountsSchema = z.object({
  totalFriends: z.number().int().min(0),
  onlineCount: z.number().int().min(0),
  offlineCount: z.number().int().min(0),
  statusCounts: z.record(z.string(), z.number().int().min(0)),
});

export const FriendOverviewTotalsSchema = z.object({
  all: FriendOverviewCountsSchema,
  filtered: FriendOverviewCountsSchema,
});

export const FriendsOverviewOutputSchema = z.object({
  includeOffline: z.boolean(),
  statusFilter: z.array(z.string()).optional(),
  minInstanceUserCount: z.number().int().min(0).optional(),
  instanceDetailLevel: z.enum(['summary', 'full']).optional(),
  totalFriends: z.number().int().min(0),
  onlineCount: z.number().int().min(0),
  offlineCount: z.number().int().min(0),
  statusCounts: z.record(z.string(), z.number().int().min(0)),
  maxLocations: z.number().int().min(1),
  totalLocations: z.number().int().min(0),
  returnedLocations: z.number().int().min(0),
  omittedLocations: z.number().int().min(0),
  locationsTruncated: z.boolean(),
  totals: FriendOverviewTotalsSchema,
  locations: z.array(FriendOverviewLocationSchema),
  truncated: z.boolean(),
  stale: z.boolean(),
  segments: z.array(FriendsSegmentSchema),
});

export const FriendDetailsInputSchema = z.object({
  name: z.string().optional(),
  userId: schemas.UserID.optional(),
  includeOffline: z.boolean().optional(),
});

export const FriendDetailsOutputSchema = z.object({
  friend: ApiObjectSchema,
  profile: ApiObjectSchema,
  location: FriendLocationInfoSchema,
  instance: InstanceSummarySchema.nullable(),
  world: ApiObjectSchema.nullable(),
  group: ApiObjectSchema.nullable(),
});

export type FriendSearchInput = z.infer<typeof FriendSearchInputSchema>;
export type FriendSearchOutput = z.infer<typeof FriendSearchOutputSchema>;
export type FriendsListInput = z.infer<typeof FriendsListInputSchema>;
export type FriendsOverviewInput = z.infer<typeof FriendsOverviewInputSchema>;
export type FriendDetailsInput = z.infer<typeof FriendDetailsInputSchema>;
