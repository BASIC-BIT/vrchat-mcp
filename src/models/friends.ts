import { z } from 'zod';

export const FriendListShapeSchema = z.object({
  fields: z.array(z.string()).optional(),
  compact: z.boolean().optional(),
  maxArrayLength: z.number().int().positive().optional(),
});

export const FriendSearchInputSchema = z.object({
  query: z.string(),
  maxResults: z.number().int().min(1).optional(),
  includeOffline: z.boolean().optional(),
});

export const FriendSearchMatchSchema = z.object({
  userId: z.string(),
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

export const FriendsListAllInputSchema = FriendListShapeSchema.extend({
  includeOffline: z.boolean().optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  maxPages: z.number().int().min(1).max(500).optional(),
});

export const FriendsListOnlineInputSchema = FriendListShapeSchema.extend({
  pageSize: z.number().int().min(1).max(100).optional(),
  maxPages: z.number().int().min(1).max(500).optional(),
});

export const FriendsListAllOutputSchema = z.object({
  includeOffline: z.boolean(),
  pageSize: z.number().int().min(1),
  maxPages: z.number().int().min(1),
  totalFriends: z.number().int().min(0),
  truncated: z.boolean(),
  stale: z.boolean(),
  segments: z.array(FriendsSegmentSchema),
  friends: z.array(z.any()),
});

export const FriendsListOnlineOutputSchema = z.object({
  pageSize: z.number().int().min(1),
  maxPages: z.number().int().min(1),
  totalFriends: z.number().int().min(0),
  truncated: z.boolean(),
  stale: z.boolean(),
  segments: z.array(FriendsSegmentSchema),
  friends: z.array(z.any()),
});

export const FriendsOverviewInputSchema = z.object({
  includeOffline: z.boolean().optional(),
  maxOnline: z.number().int().min(1).max(200).optional(),
  maxLocations: z.number().int().min(1).max(200).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  maxPages: z.number().int().min(1).max(500).optional(),
});

export const FriendsOverviewOutputSchema = z.object({
  includeOffline: z.boolean(),
  totalFriends: z.number().int().min(0),
  onlineCount: z.number().int().min(0),
  offlineCount: z.number().int().min(0),
  statusCounts: z.record(z.string(), z.number().int().min(0)),
  topOnline: z.array(
    z.object({
      userId: z.string().optional(),
      displayName: z.string().optional(),
      status: z.string().optional(),
      location: z.string().optional(),
    }),
  ),
  locationsTop: z.array(
    z.object({
      location: z.string(),
      count: z.number().int().min(1),
    }),
  ),
  truncated: z.boolean(),
  stale: z.boolean(),
  segments: z.array(FriendsSegmentSchema),
});

export const FriendLocationDetailsInputSchema = z.object({
  name: z.string().optional(),
  userId: z.string().optional(),
  includeOffline: z.boolean().optional(),
});

export const FriendLocationDetailsOutputSchema = z.object({
  friend: z.any(),
  location: z.object({
    raw: z.string().nullable(),
    type: z.string(),
    worldId: z.string().optional(),
    instanceId: z.string().optional(),
  }),
  instance: z.any().nullable(),
  world: z.any().nullable(),
});

export type FriendSearchInput = z.infer<typeof FriendSearchInputSchema>;
export type FriendSearchOutput = z.infer<typeof FriendSearchOutputSchema>;
export type FriendsListAllInput = z.infer<typeof FriendsListAllInputSchema>;
export type FriendsListOnlineInput = z.infer<typeof FriendsListOnlineInputSchema>;
export type FriendsOverviewInput = z.infer<typeof FriendsOverviewInputSchema>;
export type FriendLocationDetailsInput = z.infer<typeof FriendLocationDetailsInputSchema>;
