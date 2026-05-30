# MCPB Packaging

This folder contains packaging support for a local MCPB bundle.

Build the bundle with:

```bash
npm run mcpb:build
```

The output is written to `mcpb/vrchat-mcp-<version>-<platform>-<arch>.mcpb`.

The bundle includes compiled JavaScript and production `node_modules`. Because dependencies such as `better-sqlite3` and `keytar` include native code, each MCPB artifact is platform-specific. Build and smoke-test one artifact per target OS/architecture before publishing it.

The manifest lists the default runtime tools, including the compact generated OpenAPI routers (`vrchat_read`, `vrchat_write`, and `vrchat_delete`). Agent Skill guidance is bundled under `skills/vrchat-mcp/SKILL.md`; it is intentionally short and covers only VRChat MCP sharp edges that tool schemas do not fully communicate.

Do not submit an MCPB bundle to Smithery or another directory until the generated artifact has been locally installed and smoke-tested.
