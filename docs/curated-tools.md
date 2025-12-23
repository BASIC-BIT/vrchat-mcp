# Curated Tool Charter

This document defines the high-signal, agent-friendly tool surface. The goal is to keep the
default toolset small, explicit, and task-oriented so an agent can reason about what to do next
without wading through hundreds of low-level endpoints.

## Principles
- Small and explicit: each tool has a single, obvious purpose.
- Human-input friendly: accept names or natural inputs where reasonable.
- Composable: outputs include IDs and metadata for follow-ups.
- Safe by default: write tools are limited and risk-tiered.

## Risk tiers
- Read-only: safe, always enabled.
- Low-risk write: enabled by default (no confirmation).
- Medium-risk write: enabled, but require confirmation token.
- High-risk: disabled by default (require explicit opt-in).

## Current curated tools (implemented)
Friends and social (read):
- `vrchat_friends_search`
- `vrchat_friend_location_details`
- `vrchat_friends_all`
- `vrchat_friends_online`
- `vrchat_friends_overview`

Users and groups (read):
- `vrchat_user_profile`
- `vrchat_user_groups`

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

Notifications (read):
- `vrchat_notifications_recent`

Events and calendar (read):
- `vrchat_events_upcoming`
- `vrchat_events_search`

Events and calendar (write, medium-risk):
- `vrchat_event_create`
- `vrchat_event_update`
- `vrchat_event_delete`

Instances and invites (write, medium-risk):
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
We intend to default to curated tools only. Low-level curated and auto-generated tools will
become opt-in via environment flags. Not implemented yet.

## Confirmation pattern
Medium-risk tools are two-step:
1) call returns a `confirmId`
2) re-call with same args + `confirmId` to execute

## Group allowlist guard
Use `groups.allowlist` in the config file to limit group write operations to specific group IDs.
