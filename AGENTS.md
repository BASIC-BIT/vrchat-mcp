# AGENTS

This repo uses linting, typechecking, and tests to validate changes.

Guidance for coding agents:

- After significant code changes (or at the end of a work loop), run `npm run check`.
- If you need just one step, use `npm run lint`, `npm run typecheck`, or `npm test`.
- After making a change, run at least one relevant targeted test (or add/edit one) and confirm it passes before reporting back.
- For PR review workflow: before pushing any new commits, respond to each open review comment (reply or reaction) and resolve the thread.
- Keep stdout reserved for MCP protocol; log to stderr only.
- Config defaults live in `src/config/defaults.json`; override via `VRCHAT_MCP_CONFIG_FILE` (env overrides still supported).
- Prefer the local harness over Codex MCP hosting for dev iteration:
  - `npm run mcp:login` to authenticate (keeps the server alive while you log in).
  - `npm run mcp:status`, `npm run mcp:logout`, `npm run mcp:list-tools`, `npm run mcp:call`.
  - The harness defaults cookie storage to `file`. Override via config JSON or env vars if needed.
  - Use `VRCHAT_MCP_SERVER_COMMAND` / `VRCHAT_MCP_SERVER_ARGS` to switch between `tsx src/index.ts` and built `dist/bin/cli.js`.
- Write tools are enabled by default. Use `writes.allow=false` in config, or `VRCHAT_MCP_ALLOW_WRITES=false`, when a test or run must be read-only.
- Regenerate tool catalog docs after spec updates: `npm run generate:tools-docs`.
- Regenerate VRChat OpenAPI schemas after spec updates: `npm run generate:schemas` (updates `src/generated/vrchat-schemas.ts`; do not edit manually).
- Regenerate mock test schemas after spec tweaks: `npm run generate:test-schemas` (updates `test/generated/mock-schemas.ts`; do not edit manually).

## Tool ergonomics goals (distilled)

- Prefer names over IDs: tools should accept human inputs (displayName/username) as first-class arguments; IDs are optional for precision or follow-ups.
- Keep tools strict and explicit: each tool has a single, obvious purpose and should not hide search/fallback behaviors internally.
- Fail cleanly with guidance: when a name lookup fails, return a structured "not found" response that points to the next obvious tool.
- Chainable outputs: successful responses should include both human labels and IDs for follow-up calls.

## Curated output philosophy

- Curated tools should return the smallest set of fields that answer the likely user question and support follow-up actions.
- For high-volume collections (friends, group members, large lists), never return full objects by default; return compact summaries + IDs.
- High-volume curated tools should auto-unroll pagination internally; only expose pagination when partial results are the intent (e.g., world search).
- Avoid arbitrary sampling. Either return counts/aggregations, or return a compact snippet for every item (and mark truncation explicitly).
- Use name-first search flows; include IDs in results so the agent can resolve detail views explicitly.
- If we include potentially noisy fields (e.g., tags), note that they may be noisy and consider cleaning later.
- Add argument descriptions for curated tools (especially include flags, filters, and paging knobs) so agents understand when to toggle them vs. use a different tool.

### Specific notes (current direction)

- `vrchat_friend_details` should be KISS: accept `name` or `userId`, resolve directly, and either return the friend's details or a clear not-found error. No "match=exact" flag and no ambiguous candidate logic.
- `vrchat_friends_search` is the explicit fuzzy lookup tool (agent should call it next after a not-found).
- For `vrchat_me`, default to progressive disclosure: prefer `view` presets (`presence`, `summary`, `profile`) over broad field expansion.
- For "invite friend to my current instance" flows, prefer `vrchat_invite_user_to_me` to avoid manual current-location plumbing in the agent loop.

## Caching considerations (planned)

- Cache expensive list fetches (e.g., full friends list pagination) with TTLs to avoid repeated full scans on every call.
- Support targeted invalidation (e.g., after invite/accept/remove flows or on explicit agent request).
- Add an explicit cache-control tool (e.g., `vrchat_cache_invalidate`) for agents to force refreshes when needed.
- Document per-area caching policy (friends, groups, worlds, etc.) with TTL defaults and invalidation triggers.

## Realtime pipeline notes

- Pipeline websocket auto-starts after login by default; disable with `pipeline.enabled=false` in config.
- Use `pipeline.url` to override the websocket endpoint when testing.
- Use `pipeline.changeBuffer` to cap in-memory friend change history.
- Friend change deltas are exposed via `vrchat://friends/changes{?after,limit}` and require `resources/subscribe` for notifications.

## Confirmation tokens (medium-risk writes)

- Medium-risk write tools may return `confirm_required` with a `confirmId`.
- Re-run the tool with the same arguments + `confirmId` to execute.
- Tokens expire after `confirmations.ttlMs` (default 120000ms).

## Group write guard

- Set `groups.allowlist` to a list of group IDs to limit group write operations.

## E2E tests

- Mock E2E runs by default (`test/e2e/mock.test.ts`) and uses the OpenAPI fixtures + mock server.
- Live E2E is opt-in: create `test/fixtures/e2e.live.json` (gitignored) to run `test/e2e/live.test.ts`.
- Configure expectations in that file (see `test/fixtures/e2e.live.example.json`).
- LLM evals are opt-in: create `test/fixtures/evals.live.json` (gitignored) to run `test/evals/mock-llm.test.ts`.
  - Requires an OpenAI API key + model (see `test/fixtures/evals.live.example.json`).
  - Run with `npm run test:evals`.
  - Live evals also read `test/fixtures/e2e.live.json` for login + optional friend expectations.
  - Optional `expectations` fields in `evals.live.json` can drive extra live eval cases (world/group/avatar/favorite).
  - `expectations.avatarName` is treated as a substring match; use `avatarNameExact` for strict equality.
