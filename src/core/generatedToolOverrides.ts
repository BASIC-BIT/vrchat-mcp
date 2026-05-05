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
]);

const CURATED_WRITE_TOOL_MAP = new Map<string, string>([
  ['createInstance', toToolName('vrchat.instance.create')],
  ['inviteMyselfTo', toToolName('vrchat.invite.self')],
  ['inviteUser', toToolName('vrchat.invite.user')],
  ['createGroupCalendarEvent', toToolName('vrchat.event.create')],
  ['updateGroupCalendarEvent', toToolName('vrchat.event.update')],
  ['deleteGroupCalendarEvent', toToolName('vrchat.event.delete')],
  ['followGroupCalendarEvent', toToolName('vrchat.event.follow')],
  ['updateUser', toToolName('vrchat.profile.update')],
]);

const GENERATED_READ_TOOL_DESCRIPTIONS = new Map<string, string>([
  ['getConfig', 'Get VRChat API config (includes the current client API key).'],
  ['getSystemTime', 'Get VRChat server time.'],
  ['getCurrentUser', 'Fetch the current user (raw API; large payload). Prefer vrchat_me.'],
  ['getFriends', 'List friends (raw API; prefers pagination).'],
  ['getUser', 'Fetch a user by userId (raw API). Prefer vrchat_user_profile.'],
  ['getUserByName', 'Fetch a user by name (raw API). Prefer vrchat_user_profile.'],
  ['getUserGroups', 'List groups for a user (raw API). Prefer vrchat_user_groups.'],
  ['getWorld', 'Fetch a world by worldId (raw API). Prefer vrchat_world_profile.'],
  ['searchWorlds', 'Search worlds (raw API). Prefer vrchat_worlds_search.'],
  ['getFavoritedWorlds', 'List favorited worlds (raw API). Prefer vrchat_worlds_favorites.'],
  ['getGroup', 'Fetch a group profile (raw API). Prefer vrchat_group_profile.'],
  ['searchGroups', 'Search groups (raw API). Prefer vrchat_groups_search.'],
  ['getGroupMembers', 'List group members (raw API). Prefer vrchat_group_members.'],
  ['getGroupPosts', 'List group posts (raw API). Prefer vrchat_group_posts_recent.'],
  ['getGroupInstances', 'List group instances (raw API). Prefer vrchat_group_instances_overview.'],
  [
    'getGroupCalendarEvents',
    'List group calendar events (raw API). Prefer vrchat_group_events_list.',
  ],
  ['getGroupCalendarEvent', 'Get a group calendar event (raw API). Prefer vrchat_group_event_get.'],
  ['getGroupNextCalendarEvent', 'Get the next group calendar event (raw API). Prefer vrchat_group_event_next.'],
  ['getNotifications', 'List recent notifications (raw API). Prefer vrchat_notifications_recent.'],
  ['getCalendarEvents', 'List upcoming calendar events (raw API). Prefer vrchat_events_upcoming.'],
  ['discoverCalendarEvents', 'Discover calendar events (raw API). Prefer vrchat_events_discover.'],
  ['searchCalendarEvents', 'Search calendar events (raw API). Prefer vrchat_events_search.'],
]);

const GENERATED_WRITE_TOOL_DESCRIPTIONS = new Map<string, string>([
  ['createInstance', 'Create a VRChat instance (raw API). Prefer vrchat_instance_create.'],
  [
    'inviteUser',
    'Invite a user to an instance (raw API). Prefer vrchat_invite_user or vrchat_invite_user_to_me when inviting to your current instance.',
  ],
  ['inviteMyselfTo', 'Invite yourself to an instance (raw API). Prefer vrchat_invite_self.'],
  [
    'createGroupCalendarEvent',
    'Create a group calendar event (raw API). Prefer vrchat_event_create.',
  ],
  [
    'updateGroupCalendarEvent',
    'Update a group calendar event (raw API). Prefer vrchat_event_update.',
  ],
  [
    'deleteGroupCalendarEvent',
    'Delete a group calendar event (raw API). Prefer vrchat_event_delete.',
  ],
  [
    'followGroupCalendarEvent',
    'Follow or unfollow a group calendar event (raw API). Prefer vrchat_event_follow.',
  ],
  [
    'updateUser',
    'Update the current user profile (raw API). Prefer vrchat_profile_update (or vrchat_status_set for status-only changes).',
  ],
]);

export function getCuratedReadToolName(operationId: string): string | undefined {
  return CURATED_READ_TOOL_MAP.get(operationId);
}

export function getCuratedWriteToolName(operationId: string): string | undefined {
  return CURATED_WRITE_TOOL_MAP.get(operationId);
}

export function getGeneratedReadToolDescription(operationId: string): string | undefined {
  return GENERATED_READ_TOOL_DESCRIPTIONS.get(operationId);
}

export function getGeneratedWriteToolDescription(operationId: string): string | undefined {
  return GENERATED_WRITE_TOOL_DESCRIPTIONS.get(operationId);
}
