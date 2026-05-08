<p align="center">
  <img src="assets/logo.svg" alt="VRChat MCP logo" width="112" height="112" />
</p>

# VRChat MCP

Give your AI assistant safe, local-first access to your VRChat account.

VRChat MCP is a [Model Context Protocol](https://modelcontextprotocol.io/) server for tools like Claude Desktop, OpenCode, and other MCP clients. It helps an assistant answer practical questions about your VRChat presence, friends, groups, worlds, events, notifications, and optional local VRCX history.

It is read-only by default, keeps authentication local, and exposes curated high-signal tools instead of forcing agents to reason through the raw VRChat API.

This project is unofficial and is not affiliated with VRChat Inc.

## What You Can Ask

- Who is online, and where are they?
- Show my current VRChat status and location.
- Find a friend by display name and get their current profile details.
- Search worlds and return compact results with IDs for follow-up actions.
- Find upcoming public or group calendar events.
- Summarize active group instances.
- Check recent notifications.
- Read local VRCX memos and recent world visit history, if VRCX is installed.
- Invite yourself to a known instance, or invite a friend, after writes are explicitly enabled.

## Safety Model

- Read-only by default.
- Write tools require explicit opt-in with `writes.allow = true` or `VRCHAT_MCP_ALLOW_WRITES=true`.
- Group write tools can be limited to specific group IDs with `groups.allowlist`.
- Authentication cookies can stay in memory, in a local file, or in the OS keychain.
- Logs go to stderr so stdout remains reserved for MCP protocol messages.
- Live tests, live smoke checks, and LLM evals are opt-in and use local fixture files.

## Quick Start

Requirements:

- Node.js 20 or newer.
- An MCP client such as Claude Desktop, OpenCode, or another MCP-compatible host.

Install from source:

```bash
git clone https://github.com/BASIC-BIT/vrchat-mcp.git
cd vrchat-mcp
npm install
npm run build
```

Start the local login flow:

```bash
npm run mcp:login
```

The login helper opens a local browser flow and stores cookies according to your config. The default development helper uses file-backed cookie storage so subsequent MCP sessions can reuse the login.

## MCP Client Config

Use the built server for day-to-day use. Replace the path with your local checkout and use a descriptive VRChat API user agent.

```json
{
  "mcpServers": {
    "vrchat": {
      "command": "node",
      "args": ["<ABS_PATH_TO_REPO>/dist/bin/cli.js"],
      "env": {
        "VRCHAT_MCP_USER_AGENT": "your-name (email@example.com)",
        "VRCHAT_MCP_COOKIE_STORE": "file"
      }
    }
  }
}
```

For active development, you can point your MCP client at the TypeScript entrypoint instead:

```json
{
  "mcpServers": {
    "vrchat-dev": {
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

## Configuration

Defaults live in `src/config/defaults.json`. To override them, create a JSON config file and point to it with `VRCHAT_MCP_CONFIG_FILE`.

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

Environment variables override the config file when set.

Common environment variables:

- `VRCHAT_MCP_CONFIG_FILE`: path to a JSON config file.
- `VRCHAT_MCP_USER_AGENT`: descriptive user agent sent to the VRChat API. Include contact information when possible.
- `VRCHAT_MCP_API_BASE`: override the API base URL. Defaults to `https://api.vrchat.cloud/api/1`.
- `VRCHAT_MCP_SPEC_URL`: OpenAPI spec URL or local path. Supports `file:` and relative paths.
- `VRCHAT_MCP_LOG_LEVEL`: `debug`, `info`, `warn`, or `error`.
- `VRCHAT_MCP_COOKIE_STORE`: `memory`, `file`, or `keychain`.
- `VRCHAT_MCP_COOKIE_FILE`: cookie file path when `VRCHAT_MCP_COOKIE_STORE=file`.
- `VRCHAT_MCP_ALLOW_WRITES`: enable non-GET operations.
- `VRCHAT_MCP_GROUP_ALLOWLIST`: comma-separated list of group IDs permitted for group write actions.
- `VRCHAT_MCP_ENABLE_RAW_CALL`: enable the raw `vrchat_call` tool. Disabled by default.
- `VRCHAT_MCP_DISABLE_GENERATED_READ_TOOLS`: disable auto-generated read tools.
- `VRCHAT_MCP_DISABLE_GENERATED_WRITE_TOOLS`: disable auto-generated write tools.

Cache and realtime pipeline tuning are configured in JSON. See `src/config/defaults.json` for the full set of defaults.

## Tool Surface

VRChat MCP exposes three layers:

- Curated tools for common agent workflows, such as `vrchat_me`, `vrchat_friends_search`, `vrchat_friend_details`, `vrchat_worlds_search`, `vrchat_group_profile`, `vrchat_events_upcoming`, and `vrchat_notifications_recent`.
- Auto-generated read tools named `vrchat_read_<operationId>` for GET operations from the VRChat OpenAPI spec.
- Auto-generated write tools named `vrchat_write_<operationId>` for non-GET operations. These remain gated by the write safety configuration.

Local-only tools and resources include:

- `vrchat_auth_begin`, `vrchat_auth_status`, and `vrchat_auth_logout` for local authentication.
- `vrchat_cache_invalidate` for MCP-local cache control.
- `vrchat://friends/changes{?after,limit}` for friend change deltas.
- `vrchat://friends/snapshot{?includeOffline,pageSize,maxPages}` for friend snapshots.

The generated catalog lives in `docs/tools.md`. The shorter usage guide lives in `docs/tools-guide.md`.

## Optional Swagger UI

If you want a Swagger UI and OpenAPI-style proxy for the MCP tools, use `mcpo`:

```bash
uvx mcpo --port 8000 --api-key "top-secret" -- node <ABS_PATH_TO_REPO>/dist/bin/cli.js
```

Then open `http://localhost:8000/docs`.

You can also run config mode against an MCP client config file:

```bash
mcpo --config <PATH_TO_MCP_CONFIG.json> --hot-reload --api-key "top-secret"
```

Each MCP server is exposed under its own route, such as `http://localhost:8000/vrchat`, with Swagger UI at `http://localhost:8000/vrchat/docs`.

## Development

Useful scripts:

- `npm run dev`: run `src/index.ts` through `tsx`.
- `npm run build`: type-check and emit to `dist/`.
- `npm run start`: run the built server from `dist/`.
- `npm run lint`: run ESLint.
- `npm run typecheck`: type-check without emit.
- `npm test`: run Vitest.
- `npm run check`: lint, type-check, and test.
- `npm run mcp:login`: launch the local login helper.
- `npm run mcp:status`: check local auth status through the harness.
- `npm run mcp:logout`: clear the local auth session through the harness.
- `npm run smoke:live`: run the opt-in read-only live smoke matrix against the built server.
- `npm run generate:tools-docs`: regenerate `docs/tools.md`.
- `npm run generate:schemas`: regenerate `src/generated/vrchat-schemas.ts` from the VRChat OpenAPI spec.
- `npm run generate:test-schemas`: regenerate mock test schemas.

Project layout:

- `src/index.ts`: server bootstrap.
- `src/core/`: VRChat API plumbing, spec parsing, request dispatch, and read helpers.
- `src/tools/`: MCP tool registration.
- `src/schemas/`: shared Zod schemas for tool inputs and outputs.
- `src/generated/`: generated OpenAPI Zod schemas.
- `src/services/`: domain services for auth, cache, friends, worlds, groups, VRCX, and more.
- `src/resources/`: MCP resources for snapshots and delta feeds.
- `src/auth/`: local login flow and cookie storage.
- `src/infra/`: logging and infrastructure utilities.
- `src/utils/`: lightweight shared helpers.
- `docs/`: architecture, tool inventory, evals, and design notes.

## Testing And Evals

Local checks:

```bash
npm run check
```

Read-only live smoke checks are opt-in:

```bash
npm run build
npm run mcp:login
npm run smoke:live
```

Live E2E and LLM evals use gitignored local fixture files:

- `test/fixtures/e2e.live.json`
- `test/fixtures/evals.live.json`

See `docs/evals.md` for the repeatable smoke, LLM, and manual agent evaluation workflow.

## Documentation

- `docs/tools.md`: generated tool catalog with schemas.
- `docs/tools-guide.md`: short human guide for the tool surface.
- `docs/architecture.md`: codebase overview and data flow.
- `docs/curated-tools.md`: curated tool charter and risk tiers.
- `docs/evals.md`: smoke, LLM, and manual agent eval workflow.
- `docs/public-launch-plan.md`: release awareness, registry, and launch-channel plan.
- `docs/vrcx.md`: local VRCX integration notes.
- `docs/design-notes.md`: archived design notes and future-facing ideas.

## License

MIT. See `LICENSE`.
