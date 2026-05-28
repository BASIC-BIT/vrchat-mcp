import { toolName } from '../utils/toolNames.js';

const toToolName = (name: string) => toolName(name);

const CURATED_READ_TOOL_MAP = new Map<string, string>([
  ['getConfig', toToolName('vrchat.config.get')],
  ['getSystemTime', toToolName('vrchat.system.time')],
  ['getCurrentUser', toToolName('vrchat.me')],
  ['getFriends', toToolName('vrchat.friends.list')],
  ['getUser', toToolName('vrchat.user.profile')],
  ['getUserByName', toToolName('vrchat.user.profile')],
  ['getUserGroups', toToolName('vrchat.user.groups')],
  ['getWorld', toToolName('vrchat.world.profile')],
  ['searchWorlds', toToolName('vrchat.worlds.search')],
  ['getFavoritedWorlds', toToolName('vrchat.worlds.favorites')],
  ['getFavoritedAvatars', toToolName('vrchat.favorites')],
  ['getFavoriteGroup', toToolName('vrchat.favorites')],
  ['getFavoriteGroups', toToolName('vrchat.favorites')],
  ['getFavoriteLimits', toToolName('vrchat.favorites')],
  ['getFavorites', toToolName('vrchat.favorites')],
  ['getGroup', toToolName('vrchat.group.profile')],
  ['searchGroups', toToolName('vrchat.groups.search')],
  ['getGroupMembers', toToolName('vrchat.group.members')],
  ['getGroupRoles', toToolName('vrchat.group.roles')],
  ['getGroupRoleTemplates', toToolName('vrchat.group.roles')],
  ['getGroupPosts', toToolName('vrchat.group.posts_recent')],
  ['getGroupInstances', toToolName('vrchat.group.instances.overview')],
  ['getGroupCalendarEvents', toToolName('vrchat.group.events.list')],
  ['getGroupNextCalendarEvent', toToolName('vrchat.group.event.next')],
  ['getGroupCalendarEvent', toToolName('vrchat.group.event.get')],
  ['getNotifications', toToolName('vrchat.notifications.recent')],
  ['getCalendarEvents', toToolName('vrchat.events.upcoming')],
  ['discoverCalendarEvents', toToolName('vrchat.events.discover')],
  ['searchCalendarEvents', toToolName('vrchat.events.search')],
  ['getAvatar', toToolName('vrchat.avatar.profile')],
]);

const CURATED_WRITE_TOOL_MAP = new Map<string, string>([
  ['boop', toToolName('vrchat.boop')],
  ['createGroupInvite', toToolName('vrchat.group.invite')],
  ['createInstance', toToolName('vrchat.instance.create')],
  ['friend', toToolName('vrchat.friend.request')],
  ['inviteMyselfTo', toToolName('vrchat.invite.self')],
  ['inviteUser', toToolName('vrchat.invite.user')],
  ['createGroupCalendarEvent', toToolName('vrchat.event.create')],
  ['updateGroupCalendarEvent', toToolName('vrchat.event.update')],
  ['deleteGroupCalendarEvent', toToolName('vrchat.event.delete')],
  ['followGroupCalendarEvent', toToolName('vrchat.event.follow')],
  ['addFavorite', toToolName('vrchat.favorite.add')],
  ['removeFavorite', toToolName('vrchat.favorite.remove')],
  ['addGroupMemberRole', toToolName('vrchat.group.roles.manage')],
  ['removeGroupMemberRole', toToolName('vrchat.group.roles.manage')],
  ['createGroupRole', toToolName('vrchat.group.roles.manage')],
  ['updateGroupRole', toToolName('vrchat.group.roles.manage')],
  ['deleteGroupRole', toToolName('vrchat.group.roles.manage')],
  ['updateUser', toToolName('vrchat.profile.update')],
  ['logout', toToolName('vrchat.auth.logout')],
]);

export function getCuratedReadToolName(operationId: string): string | undefined {
  return CURATED_READ_TOOL_MAP.get(operationId);
}

export function getCuratedWriteToolName(operationId: string): string | undefined {
  return CURATED_WRITE_TOOL_MAP.get(operationId);
}
