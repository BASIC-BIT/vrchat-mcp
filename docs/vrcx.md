# VRCX Integration Notes

This repo includes optional read-only tooling to pull _local_ context from the VRCX SQLite database.

The goal is to expose information that VRChat's public API does not provide (e.g. local memos, your join/leave history, and time-spent estimates), while avoiding sensitive material (cookies, stored credentials).

## Default locations

VRCX stores its primary database under the user's application data directory.

- Windows: `%APPDATA%\\VRCX\\VRCX.sqlite3`
- macOS (common): `~/Library/Application Support/VRCX/VRCX.sqlite3`
- Linux (common): `~/.config/VRCX/VRCX.sqlite3` (some builds use `~/.local/share/VRCX`)

VRCX also stores a small JSON settings file:

- Windows: `%APPDATA%\\VRCX\\VRCX.json`

The `VRCX.json` key `VRCX_DatabaseLocation` can override the DB path.

VRCX may also create `VRCX-WorldData.db` in the same directory.

## Key tables (high-level)

Useful (non-secret) tables commonly present:

- `memos`, `world_memos`, `avatar_memos` (your local notes)
- `gamelog_location` (your recent world/instance visits)
- `gamelog_join_leave` (player join/leave events; used by VRCX to estimate time spent)
- `favorite_world`, `favorite_avatar`, `cache_world`, `cache_avatar`

Sensitive / do-not-expose tables:

- `cookies` (session cookies)
- `configs` contains keys like `config:savedcredentials` (may include credentials/cookies)
  - Only a small allowlist of safe keys should be read (e.g. `config:lastuserloggedin`, `config:vrcx_databaseversion`).

Per-user tables (prefixed):

VRCX creates user-specific tables using a prefix derived from the logged-in VRChat userId.
The prefix is roughly `userId` with `-` and `_` removed.

Examples:

- `<prefix>_notes`
- `<prefix>_friend_log_current`
- `<prefix>_friend_log_history`
- `<prefix>_feed_*`

## “Time spent with someone” (how VRCX derives it)

VRCX uses `gamelog_join_leave` entries.

- `type = 'OnPlayerLeft'` rows often include a `time` column representing how long that player was present before leaving.
- `created_at` is the leave timestamp.
- Join timestamp can be approximated as: `joinTime = created_at - time`.

This enables tools to provide:

- relationship summary: total time spent, last seen, count of distinct instances
- relationship sessions: recent per-session breakdown (bounded by limit)

## Tooling philosophy

- Read-only by default.
- Small, curated outputs.
- No raw SQL passthrough.
- Never return `cookies` or sensitive `configs` keys.
- History-heavy tools are separate or explicitly bounded by limits.
