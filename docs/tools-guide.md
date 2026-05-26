# Tools Guide

This is the human-oriented overview for how to use the tool surface. The full, generated catalog of exposed tools (with schemas) is in `docs/tools.md`.

## How to use tools

- Prefer **curated tools** first. They include search and summary flows for common VRChat tasks.
- Auto-generated read tools (`vrchat_read_<operationId>`) and write tools (`vrchat_write_<operationId>`) are enabled by default for API coverage. Generated tools omit hard-skipped operations and operations already covered by curated tools, so the default surface stays focused on usable API gaps. Use `generatedReadTools.operationIds` or `generatedWriteTools.operationIds` only when you want to narrow the remaining generated surface.
- Curated write tools are enabled by default for local full-capability use. Set `writes.allow = false` (or `VRCHAT_MCP_ALLOW_WRITES=false`) for read-only mode.
- The MCP client or agent harness is expected to control approval/denial for account-changing tool calls.
- Group write actions are restricted by `groups.allowlist` when set.
- Do not expose this server as a hosted/public MCP service with VRChat cookies. Keep it local and user-controlled.

## Metadata budget

Tool names, tool descriptions, argument names, argument descriptions, and schema structure consume model context. Run `npm run metrics:tool-budget` to report the estimated default tool metadata token budget, category breakdown, initial tool-list cost, full schema cost, repeated argument-description hotspots, blank tool-description coverage, argument-description coverage, and the largest tools by metadata size. CI includes this in `npm run metrics`; keep the budget from drifting upward unless the extra guidance is worth the context cost.

## MCP resources

- `vrchat://friends/changes{?after,limit}` - delta feed for friend updates.
- `vrchat://friends/snapshot{?includeOffline,pageSize,maxPages}` - friends snapshot.

## Swagger UI (mcpo)

- Run `npm run mcpo` to spin up an OpenAPI proxy with Swagger UI.
- `npm run mcpo` requires `uvx` (from Astral’s `uv`) to be installed.
- Open `http://localhost:8000/docs` to browse and try tool calls.
- For config-based setup (Claude Desktop config + hot reload), see `README.md`.

## Where the truth lives

- `docs/tools.md` is generated from code + the OpenAPI spec and includes curated tools plus the generated catalog.
- `docs/curated-tools.md` describes the curated tool charter and risk tiers.
