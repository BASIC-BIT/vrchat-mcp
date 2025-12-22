# Groups + Notifications Curated Tools Plan

Date: 2025-12-22

## Goals
- Provide a small, high-signal tool surface for group discovery + monitoring.
- Keep large lists (members, posts, instances) as standalone tools with pagination.
- Avoid optional embeds; keep each tool single-purpose and explicit.
- Cache heavily for read-heavy group data; keep notifications fresh.

## Decisions
- Use **group posts** as the primary "recent updates" surface. The announcement endpoint is a single current announcement and create-announcement warns that it overwrites previous announcements and recommends posts instead. (Documented in VRChat API reference.)
- Provide a simple **group profile** tool (no embedded extras) that accepts `groupId` or `shortCode`.
- Use upcoming-window semantics for group events (same as `vrchat_events_upcoming`).

## Highest-signal tools (Phase 1)
Groups:
- `vrchat_groups_search` - search by name or shortCode, returns short summaries.
- `vrchat_group_profile` - group details by groupId or shortCode.
- `vrchat_group_announcement` - current announcement (single object).
- `vrchat_group_posts_recent` - recent posts (paged).
- `vrchat_group_events_upcoming` - upcoming events window for a group.
- `vrchat_group_instances_overview` - active instances summary for a group.
- `vrchat_group_members` - list group members (userId + displayName), paged.

Notifications:
- `vrchat_notifications_recent` - recent notifications (paged + type filter).

## Caching (defaults)
- Groups domain (search/profile/announcement/posts/events/instances):
  - TTL: 300s
  - Stale: 1800s
- Notifications:
  - TTL: 30s
  - Stale: 300s

Cache tags:
- `groups` + per-group tags (`groups:{groupId}`)
- `groups:search:{query}`
- `notifications`

## Implementation Notes
- Resolve `groupId` from `shortCode` via `searchGroups` (case-insensitive exact match).
- Keep payloads minimal:
  - Group search result: `groupId`, `name`, `shortCode`, `memberCount` (optional)
  - Posts result: `id`, `title`, `text`, `createdAt`, `updatedAt`, `authorId`, `visibility`
  - Announcement: `id`, `title`, `text`, `createdAt`, `updatedAt`, `authorId`
  - Instances overview: `worldId`, `worldName`, `instanceId`, `location`, `memberCount`
  - Notifications: `id`, `type`, `message`, `createdAt`, `senderUserId`, `seen`, `details` (parsed if JSON)

## Progress
- [x] Implement group curated tools.
- [x] Implement notifications curated tool.
- [x] Add caching defaults + env vars.
- [x] Update docs/tools + curated-tools list.
- [x] Add unit tests.
