import { z } from 'zod';

const Config = z.object({ clientApiKey: z.string() }).passthrough();
const SystemTime = z.object({ time: z.string() }).passthrough();
const User = z
  .object({ id: z.string(), displayName: z.string(), username: z.string().optional() })
  .passthrough();
const Group = z.object({ id: z.string(), name: z.string() }).passthrough();
const Friend = z
  .object({
    id: z.string(),
    displayName: z.string(),
    location: z.string().optional(),
    status: z.string().optional(),
  })
  .passthrough();
const FriendStatus = z.object({ status: z.string() }).passthrough();
const Notification = z
  .object({ id: z.string(), type: z.string(), message: z.string().optional() })
  .passthrough();
const World = z.object({ id: z.string(), name: z.string() }).passthrough();
const Instance = z.object({ id: z.string(), world: World.optional() }).passthrough();
const Avatar = z.object({ id: z.string(), name: z.string() }).passthrough();
const Favorite = z
  .object({ id: z.string(), type: z.string(), favoriteId: z.string() })
  .passthrough();
const FavoriteGroup = z
  .object({ id: z.string(), name: z.string(), type: z.string() })
  .passthrough();
const FavoriteLimits = z
  .object({ maxFavorites: z.number().int(), maxFavoriteGroups: z.number().int() })
  .passthrough();
const GroupMember = z
  .object({ userId: z.string(), displayName: z.string(), roleId: z.string().optional() })
  .passthrough();
const GroupRole = z.object({ id: z.string(), name: z.string() }).passthrough();
const GroupPermission = z.object({ id: z.string(), name: z.string() }).passthrough();
const GroupAnnouncement = z.object({ id: z.string(), title: z.string() }).passthrough();
const GroupPost = z.object({ id: z.string(), title: z.string() }).passthrough();
const GroupInstance = z
  .object({ id: z.string(), worldId: z.string(), instanceId: z.string() })
  .passthrough();
const CalendarEvent = z
  .object({ id: z.string(), title: z.string(), groupId: z.string().optional() })
  .passthrough();
const InviteMessage = z
  .object({
    id: z.string(),
    userId: z.string(),
    messageType: z.string(),
    slot: z.number().int(),
    message: z.string().optional(),
  })
  .passthrough();

export const schemas = {
  Config,
  SystemTime,
  User,
  Group,
  Friend,
  FriendStatus,
  Notification,
  World,
  Instance,
  Avatar,
  Favorite,
  FavoriteGroup,
  FavoriteLimits,
  GroupMember,
  GroupRole,
  GroupPermission,
  GroupAnnouncement,
  GroupPost,
  GroupInstance,
  CalendarEvent,
  InviteMessage,
};
