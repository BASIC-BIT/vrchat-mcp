<p align="center">
  <img src="assets/logo.svg" alt="VRChat MCP logo" width="112" height="112" />
</p>

# VRChat MCP

Unofficial local [Model Context Protocol](https://modelcontextprotocol.io/) tools for VRChat friends, worlds, groups, events, notifications, status, invites, and local VRCX history.

[![npm](https://img.shields.io/npm/v/%40basicbit%2Fvrchat-mcp)](https://www.npmjs.com/package/@basicbit/vrchat-mcp) [![license](https://img.shields.io/npm/l/%40basicbit%2Fvrchat-mcp)](./LICENSE)

VRChat MCP runs locally through stdio by default and also offers an opt-in loopback-only Streamable HTTP mode. Your VRChat auth cookies stay on your machine and default to your OS keychain, with file storage as the fallback when a keychain backend is unavailable. Curated write tools, generated read/write tools, and read-only VRCX local-history tools are available by default; use your MCP client or agent harness to approve account-changing tool calls.

This project is unofficial and is not affiliated with VRChat Inc.

## Policy and Safety Boundaries

VRChat does not provide a public OAuth flow for third-party API applications. VRChat's Creator Guidelines say API applications should not request or store VRChat login credentials, auth tokens, or session data, should identify themselves with a clear User-Agent, should cache/back off instead of sending unmetered requests, and should not act on behalf of another user.

This project is therefore intended only as a local, user-controlled personal tool. Do not run it as a hosted/public MCP service, do not collect anyone else's credentials or cookies, do not automate spam or harassment, and do not use it to evade VRChat enforcement or moderation. Use write tools only for actions you would intentionally perform yourself in VRChat.

## Install

Requirements:

- Node.js 24.15.0 or newer.
- An MCP client that can run local stdio servers.
- Native dependencies are installed for keychain and VRCX SQLite support (`keytar`, `better-sqlite3`).

On headless Linux or containers without a keychain daemon such as `libsecret`, set `VRCHAT_MCP_COOKIE_STORE=file` for explicit persistent cookie storage.

The npm package is the normal install path:

```bash
npx -y @basicbit/vrchat-mcp
```

The server is also published to the official MCP Registry as `io.github.BASIC-BIT/vrchat-mcp`.

## MCP Client Config

Most clients use one of these shapes. No environment variables are required for the default setup.

### OpenCode

OpenCode uses an array-valued `command` field.

Add this to `~/.config/opencode/opencode.json`:

```json
{
  "mcp": {
    "vrchat": {
      "type": "local",
      "command": ["npx", "-y", "@basicbit/vrchat-mcp"],
      "enabled": true
    }
  }
}
```

### Claude Desktop, Cursor, Kiro, Roo, Windsurf

These clients usually split the executable into `command` plus `args`.

Use this in clients that expect an `mcpServers` object:

```json
{
  "mcpServers": {
    "vrchat": {
      "command": "npx",
      "args": ["-y", "@basicbit/vrchat-mcp"]
    }
  }
}
```

### VS Code

VS Code uses a `servers` object instead of `mcpServers`.

Use this in `.vscode/mcp.json`:

```json
{
  "servers": {
    "vrchat": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@basicbit/vrchat-mcp"]
    }
  }
}
```

### OpenAI Codex

Add this to `~/.codex/config.toml` or `.codex/config.toml`:

```toml
[mcp_servers.vrchat]
command = "npx"
args = ["-y", "@basicbit/vrchat-mcp"]
startup_timeout_sec = 40
```

If your Windows client cannot spawn `npx` directly, use `cmd` as the command and put `/c`, `npx`, `-y`, and `@basicbit/vrchat-mcp` in the argument list.

## Local Streamable HTTP

Use native Streamable HTTP when an MCP client needs to connect to a long-running local server instead of spawning its own stdio child process. STDIO remains the default and recommended setup for ordinary desktop clients.

HTTP mode:

- Binds only to `127.0.0.1`.
- Uses the MCP endpoint `http://127.0.0.1:8765/mcp` by default.
- Requires `Authorization: Bearer <token>` on every MCP request.
- Supports stateful sessions, SSE notifications, resource subscriptions, and session termination.
- Reaps abandoned sessions after 30 minutes of inactivity while preserving active response streams.
- Shares one local VRChat login, cache, and pipeline connection across all connected HTTP clients.
- Is not a hosted or multi-user mode.

Generate a secret and launch the server in PowerShell:

```powershell
$env:VRCHAT_MCP_HTTP_BEARER_TOKEN = node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
npx -y @basicbit/vrchat-mcp --transport http
```

Then configure the MCP client to use `http://127.0.0.1:8765/mcp` and send the token from `VRCHAT_MCP_HTTP_BEARER_TOKEN` as a bearer token. Keep the token in an environment variable or secret store; do not put it in a URL or commit it to a client configuration.

CLI overrides:

```powershell
npx -y @basicbit/vrchat-mcp --transport http --port 9000 --path /vrchat-mcp
```

The HTTP listener deliberately cannot bind to a LAN or public interface. Public hosting remains unsupported because VRChat does not provide the OAuth/account-isolation model needed for a hosted personal-account service.

## Login

After adding the server to your MCP client, ask it to call `vrchat_auth_begin`. The tool returns a local browser login URL.

After logging in, call `vrchat_auth_status` to confirm the session. By default, cookies are stored in the OS keychain so the login survives MCP server restarts. If the OS keychain is unavailable, VRChat MCP falls back to file storage.

Do not ask another person to use this login flow for you. Do not send the local login URL, cookies, or session files to hosted tools or third-party services.

Useful auth tools:

- `vrchat_auth_begin`: start local browser login.
- `vrchat_auth_status`: check whether the server is logged in.
- `vrchat_auth_logout`: clear the stored session.

## What You Can Ask

Examples:

```txt
Show my VRChat status and current location.
```

```txt
Which friends are online, grouped by world?
```

```txt
Search my friends for Alice and show their profile.
```

```txt
Find public VRChat events happening today.
```

```txt
Invite Bob to my current instance.
```

```txt
Show recent worlds from my local VRCX history.
```

## Tools

VRChat MCP exposes curated tools plus generated read/write/delete routers by default. Curated tools cover common tasks with compact, agent-friendly inputs and outputs.

Common curated tools include:

- `vrchat_me`
- `vrchat_friends_overview`
- `vrchat_friends_search`
- `vrchat_friend_details`
- `vrchat_worlds_search`
- `vrchat_group_profile`
- `vrchat_events_upcoming`
- `vrchat_notifications_recent`
- `vrchat_instance_link_event`
- `vrchat_invite`
- `vrchat_group_invite`
- `vrchat_friend_request`
- `vrchat_boop`
- `vrcx_instances_recent`

Generated OpenAPI API-gap coverage uses three router tools:

- `vrchat_read` for available GET operations; pass `operationId` plus path/query/header/cookie values under `params`.
- `vrchat_write` for available POST/PUT/PATCH operations; pass `operationId`, `params`, and JSON payloads under `body`.
- `vrchat_delete` for available DELETE operations; pass `operationId`, `params`, and optional JSON payloads under `body`.

Use `vrchat_operations` to list available generated operation IDs and `vrchat_operation_details` for exact per-operation params/body schemas.

Generated read and write tools are enabled by default. `VRCHAT_MCP_DISABLE_GENERATED_READ_TOOLS=true` hides `vrchat_read`. `VRCHAT_MCP_DISABLE_GENERATED_WRITE_TOOLS=true` hides both `vrchat_write` and `vrchat_delete`, which share the generated-write switch. JSON config can also narrow either surface to specific operation IDs; `generatedWriteTools.operationIds` covers DELETE operations too, so a list holding only POST/PUT/PATCH IDs also hides `vrchat_delete`:

```json
{
  "generatedReadTools": { "enabled": true, "operationIds": ["getAvatarStyles"] },
  "generatedWriteTools": { "enabled": true, "operationIds": ["selectAvatar"] }
}
```

When an `operationIds` list is empty and that generated tool class is enabled, all generated operations in that class are available through its router except hard-skipped operations and operations with curated replacements. Prefer curated tools for common workflows, but generated routers keep the local server capable as the VRChat API evolves without duplicating known curated coverage or exposing generated endpoints this client cannot reliably call.

See `docs/tools-guide.md` for a short guide and `docs/tools.md` for the generated catalog.

## Write Controls

Curated write tools and generated write tools for API gaps are enabled by default so the local MCP server is usable from the first run. Your MCP client or agent harness is expected to control tool-call permission, approval, and denial for account-changing actions.

To force read-only mode, add this `env` fragment inside the server entry for your MCP client:

```json
{
  "env": {
    "VRCHAT_MCP_ALLOW_WRITES": "false"
  }
}
```

Only use write tools when you intend this local MCP server to perform VRChat account actions. Bulk social tools are capped and back off on 429s, but you are responsible for avoiding spam, harassment, or unwanted automation.

For group write tools, you can restrict writes to specific group IDs with a JSON config file:

```json
{
  "groups": {
    "allowlist": ["grp_abc123"]
  }
}
```

Then set `VRCHAT_MCP_CONFIG_FILE` to that file path in your MCP client config.

## Configuration

Configuration is optional. Defaults cover normal local use.

Common environment variables:

| Variable                                  | Use                                                      |
| ----------------------------------------- | -------------------------------------------------------- |
| `VRCHAT_MCP_CONFIG_FILE`                  | Path to a JSON config file.                              |
| `VRCHAT_MCP_USER_AGENT`                   | Descriptive user agent for VRChat API requests.          |
| `VRCHAT_MCP_LOG_LEVEL`                    | `debug`, `info`, `warn`, or `error`.                     |
| `VRCHAT_MCP_COOKIE_STORE`                 | `keychain`, `file`, or `memory`. Defaults to `keychain`. |
| `VRCHAT_MCP_COOKIE_FILE`                  | Cookie file path when `VRCHAT_MCP_COOKIE_STORE=file`.    |
| `VRCHAT_MCP_ALLOW_WRITES`                 | Set to `false` for read-only mode.                       |
| `VRCHAT_MCP_UPLOAD_ROOTS`                 | Absolute roots allowed for local PNG uploads.            |
| `VRCHAT_MCP_TRANSPORT`                    | `stdio` (default) or `http`.                             |
| `VRCHAT_MCP_HTTP_BEARER_TOKEN`            | Required 32+ character secret for HTTP mode.             |
| `VRCHAT_MCP_HTTP_PORT`                    | Loopback HTTP port. Defaults to `8765`.                  |
| `VRCHAT_MCP_HTTP_PATH`                    | MCP endpoint path. Defaults to `/mcp`.                   |
| `VRCHAT_MCP_HTTP_MAX_SESSIONS`            | Maximum concurrent HTTP sessions. Defaults to `8`.       |
| `VRCHAT_MCP_HTTP_RATE_LIMIT_PER_MINUTE`   | Per-client HTTP request limit. Defaults to `300`.        |
| `VRCHAT_MCP_HTTP_SESSION_IDLE_TIMEOUT_MS` | Abandoned-session timeout. Defaults to `1800000`.        |

Example JSON config:

```json
{
  "auth": { "cookieStore": "file" },
  "writes": { "allow": false },
  "http": {
    "port": 8765,
    "path": "/mcp",
    "maxSessions": 8,
    "rateLimitPerMinute": 300,
    "sessionIdleTimeoutMs": 1800000
  },
  "groups": { "allowlist": ["grp_abc123"] },
  "uploads": { "allowedRoots": ["C:\\Users\\you\\Pictures\\VRChat Uploads"] },
  "cache": { "enabled": true },
  "vrcx": { "enabled": true }
}
```

See `src/config/defaults.json` for all defaults.

## Local Development

```bash
git clone https://github.com/BASIC-BIT/vrchat-mcp.git
cd vrchat-mcp
npm install
npm run build
npm run check
```

Useful scripts:

- `npm run dev`: run from `src/index.ts`.
- `npm run start`: run the built server from `dist/`.
- `npm run dev -- --transport http`: run the local Streamable HTTP server from source.
- `npm run start -- --transport http`: run the built local Streamable HTTP server.
- `npm run mcp:login`: start login through the local harness.
- `npm run mcp:status`: check auth through the local harness.
- `npm run smoke:live`: run the opt-in live smoke check.
- `npm run generate:tools-docs`: regenerate `docs/tools.md`.
- `npm run generate:schemas`: regenerate OpenAPI schemas.
- `npm run mcpb:build`: build a local MCPB bundle under `mcpb/`.

Live E2E tests and LLM evals are opt-in. See `docs/evals.md` for details.

## License

MIT. See `LICENSE`.
