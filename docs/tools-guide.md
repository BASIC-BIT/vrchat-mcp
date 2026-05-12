# Tools Guide

This is the human-oriented overview for how to use the tool surface. The full, generated catalog of exposed tools (with schemas) is in `docs/tools.md`.

## How to use tools

- Prefer **curated tools** first. They include search and summary flows for common VRChat tasks.
- Use **auto-generated tools** (`vrchat_read_<operationId>`, `vrchat_write_<operationId>`) only when a curated tool does not exist.
- **Writes are opt-in**. Set `writes.allow = true` (or `VRCHAT_MCP_ALLOW_WRITES=true`) to enable any non-GET operation.
- Group write actions are restricted by `groups.allowlist` when set.

## MCP resources

- `vrchat://friends/changes{?after,limit}` - delta feed for friend updates.
- `vrchat://friends/snapshot{?includeOffline,pageSize,maxPages}` - friends snapshot.

## Swagger UI (mcpo)

- Run `npm run mcpo` to spin up an OpenAPI proxy with Swagger UI.
- `npm run mcpo` requires `uvx` (from Astral’s `uv`) to be installed.
- Open `http://localhost:8000/docs` to browse and try tool calls.
- For config-based setup (Claude Desktop config + hot reload), see `README.md`.

## Where the truth lives

- `docs/tools.md` is generated from code + the OpenAPI spec and reflects the actual exposed tools.
- `docs/curated-tools.md` describes the curated tool charter and risk tiers.
