# Changelog

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
