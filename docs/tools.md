# Tool Master List

This document is the canonical list of tools exposed by this MCP server. Tool names are shown in their client-facing underscore form.

## High-level curated tools
- `vrchat_friend_location_details` - resolve a friend by display name or userId and return their current location + instance details (read-only).
- `vrchat_friends_search` - search friends by display name (read-only).
- `vrchat_friends_all` - fetch all friends (cache-backed, optional offline) (read-only).
- `vrchat_friends_online` - fetch online friends only (cache-backed) (read-only).
- `vrchat_friends_overview` - location-centric social overview with per-instance friend lists + instance details (auto-unrolled, cache-backed, optional status filter + minInstanceUserCount + instanceDetailLevel) (read-only).
- `vrchat_user_profile` - fetch a user profile and optionally include their groups (read-only).
- `vrchat_user_groups` - list a user's groups (id + name only, cache-backed) (read-only).
- `vrchat_groups_search` - search groups by name or shortCode (read-only).
- `vrchat_group_profile` - get a group profile by groupId or shortCode (read-only).
- `vrchat_group_members` - list group members (userId + displayName) (read-only).
- `vrchat_group_announcement` - get the current group announcement (read-only).
- `vrchat_group_posts_recent` - list recent group posts (read-only).
- `vrchat_group_events_list` - list group calendar events (read-only).
- `vrchat_group_event_get` - get a single group calendar event (read-only).
- `vrchat_group_events_upcoming` - list upcoming group events (read-only).
- `vrchat_group_instances_overview` - summarize active group instances (read-only).
- `vrchat_worlds_search` - search worlds by name and return compact results (read-only).
- `vrchat_worlds_favorites` - list favorited worlds with compact results (read-only).
- `vrchat_world_profile` - get a world profile by worldId or name (read-only).
- `vrchat_world_instances_overview` - summarize world instances by access + region (read-only).
- `vrchat_notifications_recent` - list recent notifications (read-only).
- `vrchat_instance_create` - create a new instance (medium-risk write; confirmation required).
- `vrchat_invite_self` - invite yourself to an instance (low-risk write).
- `vrchat_invite_user` - invite a user to an instance (medium-risk write; confirmation required).
- `vrchat_status_get` - get your current status + description (read-only).
- `vrchat_status_set` - set your status + description (low-risk write).
- `vrchat_events_upcoming` - list calendar events in the next window (default 7 days, read-only).
- `vrchat_events_search` - search calendar events (read-only).
- `vrchat_event_create` - create a group calendar event (medium-risk write; confirmation required).
- `vrchat_event_update` - update a group calendar event (medium-risk write; confirmation required).
- `vrchat_event_delete` - delete a group calendar event (medium-risk write; confirmation required).

## Cache tools
- `vrchat_cache_invalidate` - invalidate cached data (read-only, MCP-local).

## MCP resources
- `vrchat://friends/changes{?after,limit}` - delta feed of friend changes (pipeline-backed). Subscribe to `vrchat://friends/changes` for update notifications.
- `vrchat://friends/snapshot{?includeOffline,pageSize,maxPages}` - snapshot of friends list (cache-backed). Subscribe to `vrchat://friends/snapshot` for update notifications.

## Low-level curated tools

Core + auth
- `vrchat_call` - raw OpenAPI operation call by `operationId` (read-only unless writes enabled).
- `vrchat_me`
- `vrchat_auth_begin`
- `vrchat_auth_status`
- `vrchat_auth_logout`
- `vrchat_config_get`
- `vrchat_system_time`

Users + friends
- `vrchat_friends_list`
- `vrchat_friends_status`
- `vrchat_users_get`
- `vrchat_users_getByName`
- `vrchat_users_search`

Notifications
- `vrchat_notifications_list`
- `vrchat_notifications_get`

Worlds + instances
- `vrchat_worlds_get`
- `vrchat_worlds_active`
- `vrchat_worlds_recent`
- `vrchat_instances_get`
- `vrchat_instances_getByShortName`
- `vrchat_instances_recent`

Avatars + favorites
- `vrchat_avatars_get`
- `vrchat_avatars_search`
- `vrchat_avatars_favorites`
- `vrchat_favorites_list`
- `vrchat_favorite_groups_list`
- `vrchat_favorites_limits`

Groups
- `vrchat_groups_get`
- `vrchat_groups_members_list`
- `vrchat_groups_members_get`
- `vrchat_groups_roles_list`
- `vrchat_groups_permissions_list`
- `vrchat_groups_announcements_get`
- `vrchat_groups_posts_list`
- `vrchat_groups_instances_list`

User groups
- `vrchat_users_groups_list`
- `vrchat_users_groups_requests`
- `vrchat_users_groups_represented`

Calendar
- `vrchat_calendar_events_list`
- `vrchat_calendar_featured_list`
- `vrchat_calendar_followed_list`
- `vrchat_calendar_search`

Invite messages
- `vrchat_invite_messages_list`
- `vrchat_invite_messages_get`

## Auto-generated tools
- `vrchat_read_<operationId>` for every GET operation in the OpenAPI spec, unless skipped by the curated tool skip list.

## Planned: area toggles
We plan to add per-area enable/disable toggles (for example, disabling group-related tools for users who never manage groups). This is not implemented yet; see `README.md` for current environment variables.


