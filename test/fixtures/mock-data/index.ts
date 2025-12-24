import type { MockData } from '../../helpers/mock-types.js';
import { config, systemTime } from './config.js';
import { currentUser, users } from './users.js';
import { friends, friendStatuses } from './friends.js';
import { notifications, inviteMessages } from './notifications.js';
import {
  worlds,
  favoritedWorlds,
  instances,
  instancesByShortName,
  recentLocations,
} from './worlds.js';
import { avatars } from './avatars.js';
import { favorites, favoriteGroups, favoriteLimits } from './favorites.js';
import {
  groups,
  groupMembers,
  groupRoles,
  groupPermissions,
  groupAnnouncements,
  groupPosts,
  groupInstances,
} from './groups.js';
import { calendarEvents, calendarFeatured, calendarFollowed, calendarGroupEvents } from './calendar.js';

export const mockData: MockData = {
  config,
  systemTime,
  currentUser,
  users,
  friends,
  friendStatuses,
  notifications,
  inviteMessages,
  worlds,
  favoritedWorlds,
  avatars,
  favorites,
  favoriteGroups,
  favoriteLimits,
  instances,
  instancesByShortName,
  recentLocations,
  groups,
  groupMembers,
  groupRoles,
  groupPermissions,
  groupAnnouncements,
  groupPosts,
  groupInstances,
  calendarEvents,
  calendarFeatured,
  calendarFollowed,
  calendarGroupEvents,
};
