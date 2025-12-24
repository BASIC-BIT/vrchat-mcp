# Design Notes (Archived)
These notes capture ideas and decisions from early planning docs. Items here are
either future-facing or contextual and are not required to run the MCP today.

## Tool ergonomics
- Prefer curated tools with clear, single-purpose effects.
- Favor name-based inputs for human-friendly lookup; return IDs for follow-ups.
- Automatically unroll pagination for “get all” domains (friends, groups) unless
  the user explicitly wants page-based browsing (e.g., world search).
- Keep outputs compact and task-oriented; avoid dumping large, low-signal fields.

## Safety + scope (future-facing)
- Hard deny: account deletion should never be exposed.
- Dangerous actions (world/group deletion, moderation actions) should remain
  off by default; if ever enabled, require explicit opt-in and strong warnings.
- Optional “safe vs power” profiles may be useful later (not implemented).

## Realtime + caching
- Pipeline websocket should update caches and drive MCP resources.
- Prefer resources + subscriptions over custom notifications for live updates.
- Stale-while-revalidate for heavy list endpoints (friends, groups) is desired.

## Friends overview (location-centric)
- Group online friends by instance/location to mirror VRChat’s social tab.
- Include instance details per location (summary by default, full optional).
- Use deduped instance/group/world lookups to keep output compact.
- Support optional filters like status + minimum instance user count.

## Groups + notifications
- Prefer group posts as the primary “updates” feed; announcements are singular.
- Use upcoming-window semantics for group events (e.g., next 7 days).
- Keep group profile separate from heavy lists (members/posts/instances).

## Evals (opt-in)
- LLM-as-judge evals for curated tool outputs are valuable but optional.
- Mock mode should be deterministic; live mode should be opt-in with real creds.
- Sources to revisit if needed:
  - https://platform.openai.com/docs/guides/graders
  - https://platform.openai.com/docs/guides/structured-outputs
  - https://www.promptfoo.dev/docs/intro/
  - https://docs.ragas.io/
