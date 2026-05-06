# Evals

This project uses three evaluation loops, from cheapest to most realistic.

## 1. Mock LLM Evals

Use this when changing tool outputs, schemas, or response wording.

```bash
npm run test:evals
```

These tests run against the mock VRChat server and grade expected facts with an LLM. They are deterministic enough for CI-style regression checks, but they do not prove live VRChat behavior.

## 2. Read-Only Live Smoke

Use this after login changes, curated tool changes, or OpenAPI/spec parameter changes.

```bash
npm run build
npm run smoke:live
```

The smoke script starts the built MCP server, uses file cookie storage by default, and calls representative read tools across auth, profile, friends, worlds, groups, events, notifications, status page, and VRCX.

Useful optional targets:

```bash
VRCHAT_MCP_SMOKE_FRIEND_NAME="Display Name" npm run smoke:live
VRCHAT_MCP_SMOKE_WORLD_QUERY="club" npm run smoke:live
VRCHAT_MCP_SMOKE_GROUP_ID="grp_..." npm run smoke:live
```

Expected result shape:

```json
{
  "passed": 29,
  "warned": 0,
  "failed": 0,
  "results": []
}
```

Warnings are acceptable for optional VRCX or private group data. Failures need investigation before shipping.

## 3. Manual Agent Evals

Use this for the highest-signal checks: connect Claude/OpenCode to the MCP server and ask practical questions. Watch whether the agent chooses the right tools, follows IDs from prior results, handles empty results, and asks for confirmation before writes.

Good read-only prompts:

```text
Who is online right now, grouped by world, and where are the largest clusters of my friends?
```

```text
Find a friend named <name>, tell me where they are, and include the world/group IDs I would need for follow-up actions.
```

```text
Find upcoming events for group <group name or ID> this week. Pick the next one and show the event details.
```

```text
Search for worlds matching "club" and summarize three good candidates without dumping tags unless useful.
```

```text
Show recent notifications and tell me which ones look actionable.
```

Good write-flow prompts, only with `writes.allow=true` and safe targets:

```text
Create a private instance in <world name> for me, then invite only me to it.
```

```text
Invite <friend name> to my current instance, but ask me for confirmation before sending anything.
```

```text
Set my VRChat status description to a test value, confirm it changed, then set it back.
```

Manual pass criteria:

- The agent uses curated tools before raw/generated tools when a curated tool exists.
- The agent handles names first, then carries IDs forward for follow-up calls.
- The agent treats empty or missing results as a real outcome, not a failure.
- The agent does not expose excessive friend/profile data unless needed for the task.
- The agent asks before medium-risk or externally visible writes.
- The agent explains any VRChat API errors in user terms and suggests the next useful tool.

## Live LLM Evals

Live LLM evals are opt-in because they call real VRChat APIs and an LLM grader.

Create `test/fixtures/e2e.live.json`:

```json
{
  "cookieFile": "~/.vrchat-mcp-cookies.json",
  "loginTimeoutSec": 120,
  "debug": false,
  "writeTests": { "enabled": false }
}
```

Create `test/fixtures/evals.live.json` from `test/fixtures/evals.live.example.json`, then run:

```bash
VRCHAT_MCP_ENABLE_LIVE_EVALS=1 npm test -- test/evals/live-llm.test.ts
```

If this fails before running test cases with a login error, run `npm run smoke:live` first. Smoke is the cheaper auth/session diagnostic.
