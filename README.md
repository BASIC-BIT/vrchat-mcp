<p align="center">
  <img src="assets/logo.svg" alt="VRChat MCP logo" width="112" height="112" />
</p>

# VRChat MCP

Unofficial [Model Context Protocol](https://modelcontextprotocol.io/) tools for VRChat friends, worlds, groups, events, notifications, status, invites, and local VRCX history.

[![npm](https://img.shields.io/npm/v/%40basicbit%2Fvrchat-mcp)](https://www.npmjs.com/package/@basicbit/vrchat-mcp) [![license](https://img.shields.io/npm/l/%40basicbit%2Fvrchat-mcp)](./LICENSE)

VRChat MCP runs locally through stdio. Your VRChat auth cookies stay on your machine and default to your OS keychain.

This project is unofficial and is not affiliated with VRChat Inc.

## Install

Requirements:

- Node.js 24.15.0 or newer.
- An MCP client that can run local stdio servers.

The npm package is the normal install path:

```bash
npx -y @basicbit/vrchat-mcp
```

The server is also published to the official MCP Registry as `io.github.BASIC-BIT/vrchat-mcp`.

## MCP Client Config

Most clients use one of these shapes. No environment variables are required for the default setup.

### OpenCode

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

## Login

After adding the server to your MCP client, ask it to call `vrchat_auth_begin`. The tool returns a local browser login URL.

After logging in, call `vrchat_auth_status` to confirm the session. By default, cookies are stored in the OS keychain so the login survives MCP server restarts.

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

VRChat MCP exposes curated tools for common tasks plus generated tools from the VRChat OpenAPI spec.

Common curated tools include:

- `vrchat_me`
- `vrchat_friends_overview`
- `vrchat_friends_search`
- `vrchat_friend_details`
- `vrchat_worlds_search`
- `vrchat_group_profile`
- `vrchat_events_upcoming`
- `vrchat_notifications_recent`
- `vrchat_invite_user_to_me`
- `vrcx_instances_recent`

Generated tools use these naming patterns:

- `vrchat_read_<operationId>` for GET operations.
- `vrchat_write_<operationId>` for non-GET operations.

See `docs/tools-guide.md` for a short guide and `docs/tools.md` for the generated catalog.

## Write Controls

Write tools are enabled by default so client installs work without extra setup. Your MCP client may still ask before executing tool calls, depending on its own permission model.

To force read-only mode:

```json
{
  "env": {
    "VRCHAT_MCP_ALLOW_WRITES": "false"
  }
}
```

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

| Variable                  | Use                                                      |
| ------------------------- | -------------------------------------------------------- |
| `VRCHAT_MCP_CONFIG_FILE`  | Path to a JSON config file.                              |
| `VRCHAT_MCP_USER_AGENT`   | Descriptive user agent for VRChat API requests.          |
| `VRCHAT_MCP_LOG_LEVEL`    | `debug`, `info`, `warn`, or `error`.                     |
| `VRCHAT_MCP_COOKIE_STORE` | `keychain`, `file`, or `memory`. Defaults to `keychain`. |
| `VRCHAT_MCP_COOKIE_FILE`  | Cookie file path when `VRCHAT_MCP_COOKIE_STORE=file`.    |
| `VRCHAT_MCP_ALLOW_WRITES` | Set to `false` for read-only mode.                       |

Example JSON config:

```json
{
  "auth": { "cookieStore": "file" },
  "writes": { "allow": false },
  "groups": { "allowlist": ["grp_abc123"] },
  "cache": { "enabled": true }
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
- `npm run mcp:login`: start login through the local harness.
- `npm run mcp:status`: check auth through the local harness.
- `npm run smoke:live`: run the opt-in live smoke check.
- `npm run generate:tools-docs`: regenerate `docs/tools.md`.
- `npm run generate:schemas`: regenerate OpenAPI schemas.

Live E2E tests and LLM evals are opt-in. See `docs/evals.md` for details.

## License

MIT. See `LICENSE`.
