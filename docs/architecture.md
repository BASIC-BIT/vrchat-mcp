# Architecture Overview

This server is organized by responsibility so each file stays small and focused.

## Entry point

- `src/index.ts` boots the MCP server, initializes auth, registers tools/resources, wires pipeline handlers, and connects the stdio transport.

## Core API plumbing (`src/core/`)

- `spec.ts` loads and caches the VRChat OpenAPI spec.
- `client.ts` executes API operations with auth + headers and enforces write gating.
- `readTools.ts` provides read-only helpers (pagination, field selection, shaping).
- `readToolRegistry.ts` registers auto-generated GET tools from the spec.
- `writeToolRegistry.ts` registers auto-generated non-GET tools from the spec.

## Tool registration (`src/tools/`)

- `registerAllTools.ts` is the single place that wires up all tools.
- `raw.ts` exposes `vrchat_call` for direct operationId invocation (disabled by default; enable via `rawTools.enabled`).
- `auth.ts` exposes login/status/logout.
- `cache.ts` exposes cache invalidation.
- `curated/` contains task-focused tools.
- `read/` contains system read utilities (config/time).

## Schemas (`src/schemas/`)

- Shared Zod schemas for tool inputs/outputs.

## Services (`src/services/`)

- Small, testable domain services like caching, friend lookup, and pipeline events.

## Resources (`src/resources/`)

- MCP resources backed by pipeline/cache (e.g., friend change delta feed).

## Infra + utils

- `src/infra/` for logging.
- `src/utils/` for small helpers such as tool name mapping.

## Tests

- `test/` focuses on deterministic behavior (spec parsing, tool naming, read helpers, cache).
- Coverage is reported via `npm run test:coverage`.
