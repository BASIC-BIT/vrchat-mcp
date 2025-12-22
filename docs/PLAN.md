# VRChat MCP Server — Plan (TypeScript)
**Date:** 2025-12-18  
**Primary client (v1):** Claude Desktop (local MCP over stdio)  
**Target:** Full VRChat API coverage immediately (mirroring), then build ergonomic tools/resources/notifications iteratively.

---

## 0) Goals and Non‑Goals

### Goals
- **Full API coverage day 1** without creating 200+ hand-authored MCP tools.
- **Local-first**: runs as a local process for Claude Desktop initially.
- **Hosted-ready architecture**: internal structure supports multiple concurrent MCP sessions/users later.
- **Auth via login flow** (not “paste a cookie”), while still providing a manual-cookie fallback.
- **Realtime**: emit MCP updates based on VRChat pipeline websocket events.
- **Ergonomics later**: start with raw API mirroring, then add high-level tools gradually.

### Non‑Goals (for v1)
- Fully automated policy enforcement for agents (we’ll provide safety modes + deny/confirm lists, but won’t “AI-proof” everything).
- Multi-account/profile UX (explicitly deferred; single VRChat account per MCP instance for v1).

---

## 1) Constraints, Safety, and “Power Mode”

### Reality check
VRChat publishes guidance about API usage (User-Agent, rate limiting, not storing credentials/tokens, etc.). We’ll ship:
- **Default mode:** “guidelines-friendly” (safer defaults, less persistence)
- **Power mode:** opt-in flags for “do the powerful thing” use cases

### Proposed modes
- `VRCHAT_MCP_MODE=safe` (default)
  - Persisted auth **off** by default
  - High-risk endpoint families disabled or require confirmations
- `VRCHAT_MCP_MODE=power`
  - Persisted auth allowed
  - Broader endpoint surface enabled (except hard-deny list)

### Hard deny list (always)
- **Account deletion** (`PUT /users/{userId}/delete`) — never exposed.

### “Not yet” list (v1 excludes or requires explicit confirmation)
- World deletion
- Group deletion
- Group moderation actions (bans/kicks/role edits)
- Anything that looks like irreversible economic/tilia actions

### Confirm-on-call list (recommended, even in power mode)
For the “not yet” list we can either:
- (A) omit in v1 completely, or
- (B) include behind `confirm: true` + a scary `reason` string in the tool input (client-side confirmations still encouraged)

Decision: start with (A) for v1; add (B) later once we’ve seen real usage.

---

## 2) Transport Strategy

### v1 (easiest for Claude Desktop)
- **stdio transport** using the MCP TypeScript SDK.

### vNext (hosted-ready)
- Add **Streamable HTTP** transport.
- Model server state as “sessions” keyed by MCP session id, so multi-user is not a rewrite.

---

## 3) Core Design: “Full API Mirroring” Without Tool Explosion

### The baseline tool
Implement one “raw” tool that can call any VRChat operation described by the OpenAPI spec:
- Tool name: `vrchat.call`
- Input:
  - `operationId` (string)
  - `params` (object; includes path/query/header params as needed)
  - `body` (any; optional)
  - `options` (optional):
    - `dryRun` (bool; returns the resolved request without sending)
    - `rawResponse` (bool; return status/headers/body)
- Output:
  - VRChat JSON response (raw object)
  - If `rawResponse`: include status code + selected headers (rate-limit related, request id)

Why `operationId`:
- Stable-ish reference for OpenAPI-driven tooling
- Prevents arbitrary URL access (safer than “method + path” freeform)

### OpenAPI spec ingest
Use the community OpenAPI spec as the source of truth:
- Fetch/update the spec during development (and optionally embed a pinned copy at release).
- Build an in-memory index:
  - `operationId → { method, pathTemplate, paramsSchema, requestBodySchema }`
  - `tag → [operationId...]` for discovery/UI

### Optional secondary tool (later)
If we hit cases the spec can’t represent well (file uploads, multipart weirdness), add:
- `vrchat.request` (method + path + query + headers + body)
…but only after we confirm we actually need it.

---

## 4) HTTP Client Behavior (VRChat API)

### Base URL
- `https://api.vrchat.cloud/api/1`

### Required headers
- A descriptive `User-Agent` including:
  - project name/version
  - contact or repo
  - runtime/platform (optional)

### Auth handling (cookies)
VRChat primarily uses:
- `auth` cookie (session auth)
- `twoFactorAuth` cookie (remembered device)

Implementation detail (v1):
- Maintain an in-memory cookie jar per MCP session.

### Rate limiting / robustness
- Handle `429` with exponential backoff + jitter.
- Respect `Retry-After` when present.
- Add a client-side “soft limiter” to avoid spamming endpoints from agent loops.
- Use conditional requests (ETag / If-Modified-Since) where practical (phase 2+).

---

## 5) Authentication UX (Login Flow, Not Cookie Paste)

### Core requirement
We want a **login flow**, but we must avoid using MCP “form elicitation” for sensitive data.

### v1 approach (Claude Desktop friendly)
**Browser-based local login UI**:
1. User runs tool `vrchat.auth.begin`
2. Tool returns a `http://127.0.0.1:<port>/...` URL
3. User opens URL in a browser and completes:
   - username/password
   - 2FA (TOTP) if required
   - any additional verification step VRChat requires (if applicable)
4. Server stores resulting cookies in memory (and optionally in OS keychain)
5. User runs `vrchat.auth.status` (or we auto-refresh status in the tool response)

Notes:
- This works even if Claude Desktop doesn’t support URL-elicitation natively, because we just return a URL.
- Later, if client supports MCP URL-mode elicitation, we can integrate it for a nicer UX.

### Tool surface (v1)
- `vrchat.auth.begin` → returns login URL + one-time code
- `vrchat.auth.status` → returns logged-in state + current user basics
- `vrchat.auth.logout` → calls VRChat logout, clears cookies, clears persisted secrets
- `vrchat.auth.importCookie` (fallback) → user pastes `auth=...` cookie (power users)

### 2FA
Login UI should handle:
- TOTP entry (preferred)
- Recovery codes (optional)
- “remember this device” behavior (twoFactorAuth cookie) if VRChat supports it

### Persisting auth (keep simple)
**Default:** do not persist secrets in safe mode.  
**Optional:** persist in OS keychain/keyring (cross-platform).

Risks:
- Node keychain libraries often use native modules; packaging must be tested on all OSes.
Fallback option if keychain is too painful:
- “Persist disabled by default” + a documented manual-login each run.

---

## 6) Realtime: Pipeline Websocket → MCP Notifications/Resources

### What we want
- Connect to VRChat “pipeline” websocket after auth.
- Translate events into MCP updates.

### Two viable MCP surfaces
1) **Resources + subscriptions** (recommended default)
   - Expose resources like:
     - `vrchat://me`
     - `vrchat://friends`
     - `vrchat://notifications`
     - `vrchat://groups/{groupId}`
   - When pipeline events come in:
     - update cached state
     - emit `notifications/resources/updated` for subscribed URIs

2) **Custom notifications** (optional)
   - Emit a structured “pipeline event” notification stream.
   - Useful for clients that don’t do resources yet.

Decision (v1): implement (1) first; add (2) only if needed.

### Cache strategy
- Cache per MCP session:
  - last known “me”
  - friend list / friend status
  - notifications list
  - group membership basics
- On websocket event:
  - update cache if event contains enough info
  - otherwise schedule a targeted API fetch (debounced)

---

## 7) “Ergonomic Tools” Roadmap (After Mirroring Works)

Once `vrchat.call` is stable, add high-level tools that compose multiple endpoints:

### Social / Presence
- `vrchat.status.set` (status + description + maybe bio fields)
- `vrchat.friends.listOnline` (filter client-side with cached data)
- `vrchat.user.resolve` (accept username/displayName/id)

### Invites
- `vrchat.invite.send` (resolve user + world/instance + message; handle common errors)
- `vrchat.invite.myselfTo` convenience wrapper

### Groups
- `vrchat.group.post` (prefer “posts” over “announcements” footgun)
- `vrchat.group.announce` (maybe later; guardrails)

### Reliability ergonomics
- Built-in retries/backoff for known transient errors
- Idempotency where possible (avoid duplicate invites/status flaps)

---

## 8) Multi-User / Hosted Readiness (Design Now, Implement Later)

### Session abstraction (do this from day 1)
Represent each MCP connection as a `Session` object with:
- cookie jar
- websocket connection + subscriptions
- caches
- per-session rate limiter
- config overrides

### HTTP transport later
When adding Streamable HTTP:
- Keep per-session state keyed by MCP session id header.
- Add server auth (bearer tokens) for hosted deployments.
- Support multiple concurrent users without shared cookie jars.

---

## 9) Packaging, Distribution, and Claude Desktop Setup

### Distribution goals
- Publish as an npm package.
- Support `npx vrchat-mcp` or `vrchat-mcp` binary.
- Minimal external dependencies for end users.
  - **Locked in:** use **npm** for development and contribution (lowest friction).

### Claude Desktop
- Provide a ready-to-copy MCP server config snippet.
- Document required env vars:
  - `VRCHAT_MCP_MODE`
  - `VRCHAT_MCP_USER_AGENT`
  - `VRCHAT_MCP_PERSIST_AUTH` (optional)

---

## 10) Tooling and Scaffolding (TypeScript)

### Baseline runtime + module system
- **Locked in:** target **Node.js 20 LTS** (enforce via `engines`), using native `fetch`.
- **Locked in:** **ESM-only** (`"type": "module"`), unless Claude Desktop/MCP integration proves it impossible.
  - CI should run on Node 20 + Node 22 to stay ahead of the curve.

### TypeScript
- Single `tsconfig.json` for library + CLI, plus optional `tsconfig.test.json` if needed.
- Add a strict-but-practical rule set (strict type-checking, noImplicitAny, etc.) early to avoid churn later.

### Formatting (Prettier)
- Add Prettier with a small, boring config.
- Add `.prettierignore` (node_modules, dist, coverage, generated OpenAPI artifacts).
- Add scripts:
  - `format` (write)
  - `format:check` (CI)

### Linting (ESLint)
- ESLint + `@typescript-eslint` (use the modern config style supported by current ESLint).
- Pair with `eslint-config-prettier` so formatting is owned by Prettier.
- Keep rules minimal at first; add stricter rules only when they clearly prevent real bugs.
- Add scripts:
  - `lint`
  - `lint:fix`

### Repo hygiene
- `.editorconfig` (consistent indentation/line endings across OSes).
- `.gitattributes` (avoid CRLF issues in published artifacts).
- Ensure logging goes to **stderr**, never stdout (stdio MCP uses stdout for protocol).

### Testing framework
- Use a fast TS-native runner (e.g., Vitest) with:
  - unit tests for OpenAPI indexing + request building
  - “mock HTTP” tests for retry/backoff/rate-limit behavior
  - simulated websocket event mapping tests

### CI (cross-platform)
- GitHub Actions matrix: Windows/macOS/Linux.
- Run: `typecheck`, `lint`, `test`, and a minimal “can start server” smoke check.

### Release workflow (optional but recommended)
- Use Changesets (or equivalent) for versioning + changelogs.
- Automate npm publish on tags/releases once stable.

---

## 11) Testing Strategy (Lightweight, Practical)

### Unit tests
- OpenAPI indexing: operationId mapping + URL construction
- Param injection: path/query/header correctness
- Safety gating: deny/confirm lists

### Integration tests
- HTTP client behavior using a mock server (responses, 401/429 retry)
- Login flow state machine (without real credentials)
- Pipeline event → resource update mapping (simulated events)

### Manual QA checklist
- Works on Windows/macOS/Linux
- Works under Claude Desktop stdio
- Login + 2FA works
- `vrchat.call` can hit common endpoints successfully
- Websocket connects and produces resource updates

---

## 12) Milestones (Suggested)

### Milestone A — Skeleton + `vrchat.call`
- stdio MCP server boots
- loads OpenAPI spec (pinned copy)
- `vrchat.call` executes read endpoints
- basic rate-limit handling

### Milestone B — Auth
- local browser login UI
- cookie jar in memory
- `vrchat.auth.status/logout/importCookie`

### Milestone C — Realtime
- pipeline websocket connect
- resources + subscribe + updated notifications
- cache refresh strategy

### Milestone D — First ergonomic tools
- status set
- invite send
- friend presence helpers

### Milestone E — Hosted-ready refactor (transport + server auth)
- Streamable HTTP option
- multi-session correctness

---

## 13) Open Questions (Track as we iterate)
- Which client MCP features does Claude Desktop currently support (resources/subscriptions, URL elicitation)?
- Keychain feasibility across OSes in Node without painful native builds (and what the fallback should be).
- Exact “not yet” endpoint list (world/group delete + which group moderation operations).
- How aggressive to be with caching/conditional requests to avoid API spam from agent loops.
