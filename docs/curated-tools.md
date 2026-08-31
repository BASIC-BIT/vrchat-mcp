# Curated Tool Charter

This document defines the curated tool surface. The goal is to keep the
default toolset small, explicit, and task-oriented so MCP clients can choose the next call
without wading through hundreds of low-level endpoints.

## Principles

- Small and explicit: each tool has a single, obvious purpose.
- Human-input friendly: accept names or natural inputs where reasonable.
- Composable: outputs include IDs and metadata for follow-ups.
- Local full capability by default: curated write tools are enabled, with account-changing approval expected from the MCP client or agent harness. Group allowlists can further restrict group-scoped writes.

## Write controls

- Read-only tools are always enabled.
- Curated write tools are enabled by default through `writes.allow = true`.
- Set `writes.allow = false` or `VRCHAT_MCP_ALLOW_WRITES=false` for read-only mode.
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

Status page (read):

- `vrchat_status_page_overview`

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
- `vrchat_instance_link_event`
- `vrchat_invite`
- `vrchat_invite_user`
- `vrchat_invite_user_to_me`

`vrchat_instance_link_event` accepts an explicit group, event, world, and instance ID. It first
checks `groups.allowlist`, then freshly reads both objects and requires the event and group-type
instance to have that same group owner. It refuses to replace a different existing event link.
Calls targeting one instance are serialized within the MCP process so concurrent requests cannot
replace one another after both read an unlinked instance. Re-linking the same event is an
idempotent no-op that still invalidates the relevant caches. The result includes the group and
event IDs plus readable event and instance names for safe follow-up calls. The tool can only set
`calendarEntryId`; it cannot unlink an event or change any other instance field, and it does not
send invitations or notifications. VRChat accepts the link only when the event starts within six
hours or ended within the previous six hours. Like other account-changing tools, approval belongs
at the MCP client or agent-harness boundary.

Groups and social writes:

- `vrchat_group_invite`
- `vrchat_friend_request`
- `vrchat_boop`

Group posts (write):

- `vrchat_group_post_create`
- `vrchat_group_post_update`
- `vrchat_group_post_delete`

Neither create nor update notifies group members unless `sendNotification` is explicitly set, because a single post can ping the whole group.

All three accept `groupId` or `shortCode`, and the `groups.allowlist` guard always runs against the resolved ID so a short code cannot route around it.

VRChat replaces the entire post on edit, and its API has no single-post read. `vrchat_group_post_update` therefore always looks the post up first, scanning the most recent 300 posts fresh from the API rather than from the cached list, and fills in whatever fields the caller omitted. Omitting `roleIds` keeps the current role restrictions; pass `roleIds: []` to clear them. Omitting `imageId` keeps the current image; pass `imageId: null` to remove it. An update whose supplied values all match the post is rejected, since re-sending identical content only bumps the timestamp and can re-notify members.

If the post is older than that lookup window, supplying `title`, `text`, and `visibility` together still lets the edit land as an outright replace. That path cannot recover `roleIds` or `imageId`, so it clears them and reports `mergedFromExisting: false`. Skipping the lookup is deliberately not offered as an optimization: a replace that silently drops `roleIds` would widen a role-restricted post to the whole group.

Creates and updates report success even when the write lands but VRChat's response cannot be parsed, returning `post: null`. Neither call is idempotent, so reporting a failure there would invite a retry that posts twice and, with `sendNotification`, notifies twice.

All three tools invalidate cached group reads after the write, including when the response fails to parse. One gap worth knowing: a `vrchat_group_posts_recent` load already in flight when the write happens can still store its pre-write result afterwards, because `invalidateByTag` cannot see a request whose entry has not been written yet. Reads can then serve the old list for the remainder of the group cache TTL. This affects every cached area equally, not just posts, and fixing it needs generation-checking in `CacheManager` rather than anything post-specific.

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

## Toolset toggles

The default toolset is curated plus generated read/write/delete routers for API gaps. `vrchat_read` handles available generated GET operations by `operationId`; `vrchat_write` handles available generated POST/PUT/PATCH operations by `operationId`; `vrchat_delete` handles available generated DELETE operations by `operationId`. Use `vrchat_operations` to list availability and `vrchat_operation_details` for exact params/body schemas. The generated routers can be narrowed with `generatedReadTools.operationIds` / `generatedWriteTools.operationIds` or disabled with `generatedReadTools.enabled = false` / `generatedWriteTools.enabled = false`. Generated routers do not expose hard-skipped operations or operations with curated replacements, even if those operation IDs appear in an `operationIds` narrowing list.
The raw tool (`vrchat_call`) is disabled by default and can be enabled via config/environment flags.

## Output schema budget

Curated tool output schemas should document stable top-level fields and keep nested raw VRChat API objects opaque. This preserves useful MCP metadata without embedding large generated `User`, `Group`, `World`, `CalendarEvent`, or similar object schemas in every tool. If an agent needs specific nested fields before calling a tool, add a compact curated summary field rather than reintroducing a full generated API object schema.

## Consolidation candidates

Prefer fewer, higher-confidence curated tools when multiple endpoint-shaped tools represent one user intent. A combined tool should keep the target and side effect explicit, expose IDs in outputs for follow-ups, and preserve confirmation/risk controls.

Near-term candidates:

- Keep `vrchat_invite` as the primary invite entry point for self-invites, user invites, and invite-to-current-instance flows; keep narrow invite tools only when they avoid ambiguity for agents.
- Keep social write tools batch-capable where safe (`vrchat_boop`, `vrchat_friend_request`, `vrchat_group_invite`) instead of exposing one generated endpoint per target.
- Consider a single event management surface only if create/update/delete/follow can stay explicit enough to avoid accidental destructive calls.
- Keep profile/status writes separate unless the combined tool can make status changes, profile edits, and preserved fields obvious to the caller.

## Group allowlist guard

Use `groups.allowlist` in the config file to limit group write operations to specific group IDs.
