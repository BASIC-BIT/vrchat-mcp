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
  ['getGroup', toToolName('vrchat.group.profile')],
  ['searchGroups', toToolName('vrchat.groups.search')],
  ['getGroupMembers', toToolName('vrchat.group.members')],
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
  ['updateUser', toToolName('vrchat.profile.update')],
  ['logout', toToolName('vrchat.auth.logout')],
]);

export function getCuratedReadToolName(operationId: string): string | undefined {
  return CURATED_READ_TOOL_MAP.get(operationId);
}

export function getCuratedWriteToolName(operationId: string): string | undefined {
  return CURATED_WRITE_TOOL_MAP.get(operationId);
}
