# Changelog

## 0.1.9 - 2026-07-31

- Add curated `vrchat_group_post_create`, `vrchat_group_post_update`, and `vrchat_group_post_delete` so a tool-filtered deployment can grant group posting without granting every other write.
- Keep group posts quiet by default: both create and update require an explicit `sendNotification` opt-in before members are pinged.
- Fill omitted fields on `vrchat_group_post_update` from the current post, since VRChat replaces the whole post on edit. The lookup always runs, so an edit never silently drops `roleIds` or `imageId`; pass `roleIds: []` to clear role restrictions deliberately. Posts older than the 300-post lookup window can still be replaced outright by supplying `title`, `text`, and `visibility`, which reports `mergedFromExisting: false`.
- Reject a `vrchat_group_post_update` call that changes no fields, so an unchanged post cannot have its timestamp bumped or its members re-notified.
- Invalidate cached group reads after every post write, including when the write succeeds but its response fails to parse, so `vrchat_group_posts_recent` does not serve a stale list and a retry cannot double-post.
- Include `roleIds` and `imageId` in group post summaries so read-then-edit flows no longer drop role restrictions or attached images.
- Accept `shortCode` as well as `groupId` on all three group post tools, resolving it before the `groups.allowlist` check.
- Support removing a post image with `imageId: null` on update, which was otherwise unreachable once the curated tools replaced the generated `updateGroupPost`.
- Reject an update whose supplied values already match the post, instead of re-sending identical content and possibly re-notifying members.
- Report success when a post write lands but its response cannot be parsed, since neither create nor update is idempotent and a retry would post and notify twice.
- **Breaking:** `addGroupPost`, `updateGroupPost`, and `deleteGroupPost` now resolve to the curated tools above and are no longer reachable through `vrchat_write` or `vrchat_delete`, even when listed in `generatedWriteTools.operationIds`.

## 0.1.8 - 2026-07-24

- Add opt-in, loopback-only MCP Streamable HTTP alongside the default stdio transport.
- Protect HTTP with required bearer authentication, Host and Origin validation, bounded sessions, abandoned-session cleanup, request rate and body limits, and graceful shutdown.
- Track resource subscriptions per MCP session and fan VRChat pipeline updates out to every subscribed client.
- Add HTTP configuration, CLI options, documentation, multi-session end-to-end coverage, and compatible production dependency security updates.
- Make `vrchat_group_members` return one bounded page by default and require `view: "all"` for complete snapshots.
- Pace, retry, cache, and cap full group-member snapshots at 10,000 members without publishing interrupted scans as complete.

## 0.1.7 - 2026-06-13

- Refresh dependency locks for Hono, Undici, esbuild, and Node type patch updates.
- Raise the direct Undici and Node type dependency minimums to the refreshed patch versions.

## 0.1.6 - 2026-06-03

- Fix local browser auth submissions from same-port loopback aliases such as `localhost`.
- Keep auth Host and Origin validation strict for non-loopback, wrong-port, non-HTTP, and userinfo-shaped inputs.
- Keep live status-page e2e coverage opt-in so release CI does not depend on transient external status-page availability.

## 0.1.5 - 2026-05-19

- Correct the MCP Registry package metadata so the npm package entry points at the published release version.

## 0.1.4 - 2026-05-18

- Default authentication cookie storage to the OS keychain, with file storage fallback when the keychain backend is unavailable.
- Rewrite the README around consumer install paths, client-specific MCP config, login, and core tools.

## 0.1.3 - 2026-05-17

- Simplify registry-visible configuration to the common user-facing environment variables.
- Keep low-level cache, pipeline, and group allowlist tuning in JSON config instead of environment variables.
- `VRCHAT_MCP_GROUP_ALLOWLIST` remains honored for compatibility; prefer `groups.allowlist` in `VRCHAT_MCP_CONFIG_FILE` for new setups.
- Enable write tools by default; set `writes.allow=false` or `VRCHAT_MCP_ALLOW_WRITES=false` for read-only mode.

## 0.1.2 - 2026-05-16

- Match MCP Registry server namespace casing to the GitHub organization namespace authorized by registry login.

## 0.1.1 - 2026-05-16

- Add MCP Registry metadata and npm ownership marker for registry publication.
- Move the documented and CI runtime baseline to Node.js 24.15.0, the current LTS baseline used for release validation.

## 0.1.0 - 2026-05-15

Initial public release.

- MCP tools for VRChat friends, worlds, groups, events, notifications, status, avatars, and VRCX history.
- Local browser login flow with configurable cookie storage.
- Read-only defaults with explicit write opt-in and group write allowlists.
- Curated tools for common workflows plus generated tools from the VRChat OpenAPI spec.
- Local resources for friend snapshots and friend change deltas.
- Mock E2E coverage, opt-in live smoke checks, and generated tool catalog docs.
