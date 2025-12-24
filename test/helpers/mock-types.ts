import type { z } from 'zod';
import type { schemas } from '../../src/generated/vrchat-schemas.js';

export type MockConfig = z.infer<typeof schemas.APIConfig>;
export type MockSystemTime = string;
export type MockUser = z.infer<typeof schemas.User>;
export type MockCurrentUser = z.infer<typeof schemas.CurrentUser>;
export type MockFriend = z.infer<typeof schemas.LimitedUserFriend>;
export type MockFriendStatus = z.infer<typeof schemas.FriendStatus>;
export type MockNotification = z.infer<typeof schemas.Notification>;
export type MockSentNotification = z.infer<typeof schemas.SentNotification>;
export type MockInviteMessage = z.infer<typeof schemas.InviteMessage>;
export type MockWorld = z.infer<typeof schemas.World>;
export type MockFavoritedWorld = z.infer<typeof schemas.FavoritedWorld>;
export type MockInstance = z.infer<typeof schemas.Instance>;
export type MockAvatar = z.infer<typeof schemas.Avatar>;
export type MockFavorite = z.infer<typeof schemas.Favorite>;
export type MockFavoriteGroup = z.infer<typeof schemas.FavoriteGroup>;
export type MockFavoriteLimits = z.infer<typeof schemas.FavoriteLimits>;
export type MockGroup = z.infer<typeof schemas.Group>;
export type MockGroupMember = z.infer<typeof schemas.GroupMember>;
export type MockGroupRole = z.infer<typeof schemas.GroupRole>;
export type MockGroupPermission = z.infer<typeof schemas.GroupPermission>;
export type MockGroupAnnouncement = z.infer<typeof schemas.GroupAnnouncement>;
export type MockGroupPost = z.infer<typeof schemas.GroupPost>;
export type MockGroupInstance = z.infer<typeof schemas.GroupInstance>;
export type MockCalendarEvent = z.infer<typeof schemas.CalendarEvent>;

export interface MockData {
  config: MockConfig;
  systemTime: MockSystemTime;
  currentUser: MockCurrentUser;
  users: MockUser[];
  friends: MockFriend[];
  friendStatuses: Record<string, MockFriendStatus>;
  notifications: MockNotification[];
  inviteMessages: MockInviteMessage[];
  worlds: MockWorld[];
  favoritedWorlds: MockFavoritedWorld[];
  avatars: MockAvatar[];
  favorites: MockFavorite[];
  favoriteGroups: MockFavoriteGroup[];
  favoriteLimits: MockFavoriteLimits;
  instances: Record<string, MockInstance>;
  instancesByShortName: Record<string, string>;
  recentLocations: string[];
  groups: MockGroup[];
  groupMembers: Record<string, MockGroupMember[]>;
  groupRoles: Record<string, MockGroupRole[]>;
  groupPermissions: Record<string, MockGroupPermission[]>;
  groupAnnouncements: Record<string, MockGroupAnnouncement[]>;
  groupPosts: Record<string, MockGroupPost[]>;
  groupInstances: Record<string, MockGroupInstance[]>;
  calendarEvents: MockCalendarEvent[];
  calendarFeatured: MockCalendarEvent[];
  calendarFollowed: MockCalendarEvent[];
  calendarGroupEvents: Record<string, MockCalendarEvent[]>;
}

export interface MockServer {
  baseUrl: string;
  data: MockData;
  close: () => Promise<void>;
}
