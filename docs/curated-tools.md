# Curated Tool Charter

This document defines the high-signal, agent-friendly tool surface. The goal is to keep the
default toolset small, explicit, and task-oriented so an agent can reason about what to do next
without wading through hundreds of low-level endpoints.

## Principles

- Small and explicit: each tool has a single, obvious purpose.
- Human-input friendly: accept names or natural inputs where reasonable.
- Composable: outputs include IDs and metadata for follow-ups.
- Safe by default: write tools are opt-in via `writes.allow`, with group allowlists for group-scoped writes.

## Write safety

- Read-only tools are always enabled.
- Write tools require `writes.allow = true`.
- Group-scoped writes additionally honor `groups.allowlist`.

## Current curated tools (implemented)

Friends and social (read):

- `vrchat_friends_search`
- `vrchat_friend_details`
- `vrchat_friends_list`
- `vrchat_friends_overview`

Users and groups (read):

- `vrchat_me`
- `vrchat_user_profile`
- `vrchat_user_groups`

Avatars (read):

- `vrchat_avatar_profile`

Groups and updates (read):

- `vrchat_groups_search`
- `vrchat_group_profile`
- `vrchat_group_members`
- `vrchat_group_announcement`
- `vrchat_group_posts_recent`
- `vrchat_group_events_list`
- `vrchat_group_event_get`
- `vrchat_group_events_upcoming`
- `vrchat_group_instances_overview`

Worlds (read):

- `vrchat_worlds_search`
- `vrchat_worlds_favorites`
- `vrchat_world_profile`
- `vrchat_world_instances_overview`

Status and presence:

- `vrchat_status_get` (read)
- `vrchat_status_set` (low-risk write)
- `vrchat_profile_update` (profile write; status preserved automatically)

Notifications (read):

- `vrchat_notifications_recent`

Local VRCX (read, optional):

- `vrcx_db_status`
- `vrcx_memos_user_get`
- `vrcx_memos_world_get`
- `vrcx_memos_avatar_get`
- `vrcx_gamelog_world_visits_recent`
- `vrcx_instances_recent`
- `vrcx_user_relationship_summary`
- `vrcx_user_relationship_sessions`

Events and calendar (read):

- `vrchat_events_upcoming`
- `vrchat_events_search`

Events and calendar (write):

- `vrchat_event_create`
- `vrchat_event_update`
- `vrchat_event_delete`

Instances and invites (write):

- `vrchat_instance_create`
- `vrchat_invite_user`

Invites (write, low-risk):

- `vrchat_invite_self`

## Next up (near-term)

Groups (read):

- `vrchat_group_members_summary`
- `vrchat_groups_overview`

Notifications (read):

- `vrchat_notifications_unread`

## Later (optional)

Invites:

- `vrchat_invites_pending`
- `vrchat_invite_accept` (medium-risk)

Automation hooks:

- `vrchat_status_guard` (periodic check + corrective update)

## Toolset toggles (planned)

Auto-generated read tools are enabled by default (`vrchat_read_<operationId>`).
Auto-generated write tools are enabled by default (`vrchat_write_<operationId>`, gated by `writes.allow`).
The raw tool (`vrchat_call`) is disabled by default and can be enabled via config/environment flags.

## Group allowlist guard

Use `groups.allowlist` in the config file to limit group write operations to specific group IDs.
