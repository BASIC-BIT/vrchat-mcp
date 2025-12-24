# VRChat MCP (TypeScript)

Local-first Model Context Protocol server for VRChat. Read-only by default, with curated tools, auto-generated read tools, and optional caching.

## Quick start (dev)
```bash
npm install
npm run dev  # runs src/index.ts via tsx (stdout is MCP protocol; logs go to stderr)
```

## Claude Desktop (minimal config)
Add this to your Claude Desktop config file and replace the path + user agent:

```json
{
  "mcpServers": {
    "vrchat": {
      "command": "npx",
      "args": ["tsx", "<ABS_PATH_TO_REPO>/src/index.ts"],
      "env": {
        "VRCHAT_MCP_USER_AGENT": "your-name (email@example.com)",
        "VRCHAT_MCP_COOKIE_STORE": "file"
      }
    }
  }
}
```

## OpenAPI / Swagger UI (via mcpo)
If you want a Swagger UI + OpenAPI proxy for this MCP without writing extra code, use the `mcpo` MCP-to-OpenAPI proxy. It generates OpenAPI schemas from MCP tools and serves interactive docs. citeturn0search0

Command mode (single MCP server):
```bash
uvx mcpo --port 8000 --api-key "top-secret" -- npx tsx <ABS_PATH_TO_REPO>/src/index.ts
```
Then open `http://localhost:8000/docs` in your browser. citeturn0search0

Config mode (Claude Desktop config file, supports hot-reload):
```bash
mcpo --config <PATH_TO_CLAUDE_DESKTOP_CONFIG.json> --hot-reload --api-key "top-secret"
```
Each MCP server is exposed under its own route (e.g., `http://localhost:8000/vrchat`), and Swagger UI is available at `http://localhost:8000/vrchat/docs`. citeturn0search0

## Scripts
- `build` - type-check and emit to `dist/`
- `start` - run the built server from `dist/`
- `typecheck` - type-check only
- `dev` - run with tsx
- `lint` / `lint:fix` - ESLint
- `format` / `format:check` - Prettier
- `test` / `test:watch` - Vitest
- `test:coverage` - coverage report
- `test:e2e` - run E2E tests (mock + live if configured)
- `test:e2e:live` - run only the live E2E tests
- `test:evals` - run opt-in LLM evaluation tests
- `check` - lint + typecheck + tests
- `generate:tools-docs` - regenerate `docs/tools.md`
- `mcpo` - run MCP-to-OpenAPI proxy with Swagger UI (see above)
- `generate:schemas` - regenerate VRChat OpenAPI Zod schemas in `src/generated/vrchat-schemas.ts` (do not edit manually)
- `generate:test-schemas` - regenerate zod schemas for mock API fixtures

## Configuration
Defaults live in `src/config/defaults.json`. To override, create a JSON config file and point to it with `VRCHAT_MCP_CONFIG_FILE`.

Example `vrchat-mcp.config.json`:
```json
{
  "api": { "userAgent": "your-name (email@example.com)" },
  "auth": { "cookieStore": "file" },
  "writes": { "allow": false },
  "groups": { "allowlist": ["grp_abc123"] },
  "cache": { "enabled": true }
}
```

Environment variables always override the config file when set.

## Environment variables (overrides)
- `VRCHAT_MCP_CONFIG_FILE` (optional): path to a JSON config file (relative or absolute).
- `VRCHAT_MCP_USER_AGENT` (recommended): descriptive UA string sent to the VRChat API; include contact/info. If unset we fall back to `vrchat-mcp/<version>` and log a warning.
- `VRCHAT_MCP_API_BASE` (optional): override API base (default `https://api.vrchat.cloud/api/1`).
- `VRCHAT_MCP_SPEC_URL` (optional): OpenAPI spec URL or local path (supports `file:` or relative paths; default `https://vrchat.community/openapi.yaml`).
- `VRCHAT_MCP_LOG_LEVEL` (optional): `debug | info | warn | error` (default `info`).
- `VRCHAT_MCP_COOKIE_STORE` (optional): `memory` (default), `file`, or `keychain`.
- `VRCHAT_MCP_COOKIE_FILE` (optional): file path used when `VRCHAT_MCP_COOKIE_STORE=file` (default `~/.vrchat-mcp-cookies.json`).
- `VRCHAT_MCP_ALLOW_WRITES` (optional): enable non-GET operations (`true|1|yes|on`). Default is read-only.
- `VRCHAT_MCP_GROUP_ALLOWLIST` (optional): comma-separated list of group IDs permitted for group write actions (default: allow all).
- `VRCHAT_MCP_ENABLE_RAW_CALL` (optional): enable the raw `vrchat_call` tool (disabled by default).
- `VRCHAT_MCP_DISABLE_GENERATED_READ_TOOLS` (optional): disable auto-generated read tools (`vrchat_read_<operationId>`).
- `VRCHAT_MCP_DISABLE_GENERATED_WRITE_TOOLS` (optional): disable auto-generated write tools (`vrchat_write_<operationId>`).
- For cache/pipeline tuning, edit the JSON config (see `src/config/defaults.json`). Env overrides exist but are intentionally not exhaustively listed here.

Live E2E config (local only):
- Create `test/fixtures/e2e.live.json` (gitignored) to enable live tests.       
- See `test/fixtures/e2e.live.example.json` for the expected shape.
- Run live tests with `npm run test:e2e:live` (or `npm run test:e2e`).
- To exercise write tools, set `writeTests.enabled=true` and fill in `worldId` (required) and optionally `inviteUserId`. This automatically enables writes for the live harness.

LLM eval config (local only):
- Create `test/fixtures/evals.live.json` (gitignored) to enable eval tests.
- See `test/fixtures/evals.live.example.json` for the expected shape.
- Run evals with `npm run test:evals`.
- Live evals reuse `test/fixtures/e2e.live.json` for login + optional friend expectations. Set `VRCHAT_MCP_ENABLE_LIVE_EVALS=1` to enable them (disabled by default so coverage runs don’t hit live APIs).
- Add optional `expectations` in `evals.live.json` to run extra live checks (world/group/avatar/favorite).
  - `expectations.avatarName` is treated as a substring match; use `avatarNameExact` for strict equality.

## Project layout
- `src/index.ts` - bootstrap + server startup.
- `src/core/` - VRChat API plumbing (spec parsing, request dispatch, read helpers).
- `src/tools/` - MCP tool registrations (curated, generated, auth, cache, system).
- `src/schemas/` - shared zod schemas for tool input/output.
- `src/generated/` - generated VRChat OpenAPI schemas (Zod).
- `src/services/` - domain services (cache, friends, pipeline).
- `src/resources/` - MCP resources (delta feeds, snapshots).
- `src/auth/` - login flow + cookie storage.
- `src/infra/` - logging and infrastructure utilities.
- `src/utils/` - shared lightweight helpers.
- `docs/` - architecture + tool inventory.

## Docs
- `docs/tools.md` - generated tool catalog (includes schemas).
- `docs/tools-guide.md` - short human guide for how to use the tools.
- `docs/architecture.md` - codebase overview and flow.
- `docs/curated-tools.md` - curated tool charter (scope + risk tiers).

## Tools (overview)
- Tool names use underscores (e.g., `vrchat_me`) for Claude Desktop compatibility.
- Canonical master list lives in `docs/tools.md` (generated).
- High-level tools: `vrchat_friend_details`, `vrchat_friends_search`, `vrchat_friends_list`, `vrchat_friends_overview`, `vrchat_user_profile`, `vrchat_user_groups`, `vrchat_profile_update`, `vrchat_groups_search`, `vrchat_group_profile`, `vrchat_group_members`, `vrchat_group_announcement`, `vrchat_group_posts_recent`, `vrchat_group_events_list`, `vrchat_group_event_get`, `vrchat_group_events_upcoming`, `vrchat_group_instances_overview`, `vrchat_worlds_search`, `vrchat_worlds_favorites`, `vrchat_world_profile`, `vrchat_world_instances_overview`, `vrchat_notifications_recent`, `vrchat_instance_create`, `vrchat_invite_self`, `vrchat_invite_user`, `vrchat_status_get`, `vrchat_status_set`, `vrchat_events_upcoming`, `vrchat_events_search`, `vrchat_event_create`, `vrchat_event_update`, `vrchat_event_delete`.
- Auto-generated tools: `vrchat_read_<operationId>` for every GET operation in the spec (read-only; prefer curated tools when available).
- Auto-generated write tools: `vrchat_write_<operationId>` for non-GET operations in the spec (writes still require `writes.allow = true`; prefer curated tools when available).
- Raw API mirror (disabled by default): `vrchat_call` (operationId-based access; enable via `VRCHAT_MCP_ENABLE_RAW_CALL`).
- Auth tools: `vrchat_auth_begin`, `vrchat_auth_status`, `vrchat_auth_logout`.
- Cache tool: `vrchat_cache_invalidate` (MCP-local).
- Resources: `vrchat://friends/changes{?after,limit}` (delta feed; subscribe for updates), `vrchat://friends/snapshot{?includeOffline,pageSize,maxPages}` (snapshot; subscribe for updates).

Read-tool options:
- `fields`: top-level fields to include (applies to objects or arrays of objects).
- `compact`: when true, truncates arrays to `maxArrayLength` (default 200).
- `maxArrayLength`: maximum array length when `compact` is true.
- `includeMeta`: include `url` in the structured response.
- `page`: pagination helper (offset + `n`-based endpoints only).
  - `enabled`: set true to auto-fetch multiple pages.
  - `size`: page size (maps to `n`).
  - `maxPages`: maximum pages to fetch (default 10).
  - `maxItems`: maximum items to return (default `size * maxPages`).
  - `offset`: starting offset (default from params or 0).

Note: Most list endpoints use query param `n` (not `number`). For convenience, curated tools accept `number` as an alias and translate it to `n`.

## Local OpenAPI reference
- A local copy of the OpenAPI spec can be stored at `specs/vrchat-openapi.yaml` (gitignored).
  Set `spec.url` in your config file (or `VRCHAT_MCP_SPEC_URL`) to use it.
- Full tool catalog is generated in `docs/tools.md` (includes curated + auto-generated tool schemas).
- Human guide lives in `docs/tools-guide.md`.

## Notes
- Stdout is reserved for MCP protocol; all logging goes to stderr.
- Cookie persistence currently uses tough-cookie jar with optional keychain/file backends.

