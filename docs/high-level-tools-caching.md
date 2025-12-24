# High-level Tools + Caching Plan (Friends Scale)

Date: 2025-12-22

## Goals
- Make "get all friends" fast enough for thousands of friends.
- Provide high-signal tools for agents (not just raw endpoints).
- Keep cache behavior clear, predictable, and safe by default.

## Decisions (defaults we will use)
- Friends list tool defaults to online-only; `includeOffline=true` includes offline friends.
- Cache TTL: keep existing friends TTL (120s) for now; revisit after realtime is wired.
- Staleness behavior: stale-while-revalidate for friends (configurable).
- Pagination defaults for "all friends": pageSize 100, maxPages 200 (up to ~20k).
- Pipeline (websocket) updates: enabled by default after login to keep caches warm.
- MCP resources: expose a friend-change delta resource.
- Fuzzy search: use existing contains-style friend search behavior.

## Phase 1 (start now)
- Add curated tool:
  - vrchat_friends_list (cache-backed, pagination controls, `includeOffline` flag)
- Extend friends fetch service to return pagination meta for tools.
- Keep cache storage in-memory and reuse existing cache manager.
- Update docs and tests.

## Phase 2 (next)
- Add friends overview tool (counts by status, quick summaries).
- Add optional friends snapshot resource (full list) with live updates.

## Progress
- [x] Plan written.
- [x] Implement friends fetch meta + curated tools.
- [x] Update docs/tools and tests.
- [x] Verify with unit tests.
- [x] Add stale-while-revalidate and pipeline cache updates.
- [x] Add friends delta resource backed by pipeline events.

### Progress log
- Added `fetchFriendsWithMeta` and cache storage for friends list + meta.
- Added `vrchat_friends_list` and `vrchat_friends_overview` curated tools.
- Added stale-while-revalidate support for friends cache (configurable via env).
- Updated docs and unit tests for new tools.
- Added pipeline websocket ingestion to update friends cache and emit delta resource updates.
