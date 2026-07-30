# Review Instructions

## What Important Means Here

Reserve Important findings for issues introduced by the PR that could break the
write-policy boundary, send the wrong request to a live VRChat account, leak
credentials or another user's data, corrupt cached state, or violate the MCP
protocol contract.

Style, naming, broad refactor preferences, missing comments, and test coverage
suggestions are Nit at most unless they hide a concrete risk to a real account.

## Noise Controls

- Do not report formatting, lint, type errors, or anything already gated by CI
  (`npm run check`, `metrics:tool-budget`, `metrics:scc`, `metrics:lizard`).
- Do not review generated files as if they were hand-written:
  `src/generated/vrchat-schemas.ts`, `test/generated/mock-schemas.ts`, and
  `docs/tools.md` are produced by `npm run generate:*`. Do flag a PR that edits
  them by hand instead of regenerating, or that changes source without
  regenerating a file that should have followed.
- Do not recommend new abstractions unless the duplication creates a real
  correctness, security, or operational risk.
- Do not flag pre-existing issues as PR blockers. Mark them as pre-existing in
  the summary if they are worth follow-up.
- On follow-up reviews for the same PR, suppress new nits unless the latest
  pushed code introduced them.

## Evidence Bar

Every finding should include the exact file and line, the changed behavior, why
it matters for this server, and the smallest safe fix. If the concern depends on
product judgment or on VRChat API behavior the diff does not settle, put it in
the summary instead of posting an inline blocker.

## VRChat MCP Checks

- **Write boundary.** New writes must honor `writes.allow`, respect
  `groups.allowlist` for group-scoped operations, and not reach endpoints
  blocked in `src/core/operationPolicy.ts`. A curated write that skips
  `checkGroupAllowed` where its siblings apply it is a finding.
- **Curated vs generated.** Adding an operation to `CURATED_WRITE_TOOL_MAP` or
  `CURATED_READ_TOOL_MAP` removes it from `vrchat_read` / `vrchat_write` /
  `vrchat_delete` even when listed in `generatedReadTools.operationIds` /
  `generatedWriteTools.operationIds`. That is a breaking change for existing
  deployments and needs a CHANGELOG note.
- **Request shape.** Path and query parameter names must match the OpenAPI spec
  exactly; `callOperation` rejects unknown params but cannot catch a valid-but-
  wrong one. Several generated request schemas are `.passthrough()`, so
  spreading caller input into a body can silently send extra fields.
- **Cache correctness.** A write that changes data served by a cached read must
  invalidate the matching tag (see `src/services/cache.ts` and the
  `groups:<id>` / `group-members:<id>` conventions). Read-modify-write flows
  must not build their merge base from a cached read.
- **Rate limits.** `callOperation` has no ambient retry. Multi-page or
  multi-target loops should use `callWithRetry` from `src/core/retry.ts` and
  stay bounded; unbounded pagination against a live account is a finding.
- **stdout is reserved for the MCP protocol.** Anything logged to stdout
  instead of stderr corrupts the transport.
- **Tool surface.** Curated tools should keep a single obvious purpose, accept
  human-friendly inputs where reasonable, return compact summaries plus IDs for
  high-volume collections, and mark truncation explicitly rather than sampling.
  Output schemas should keep nested VRChat objects opaque rather than embedding
  full generated `User` / `Group` / `World` schemas. See `docs/curated-tools.md`.
- **Schema honesty.** A tool's advertised input schema should match its
  documented behavior. In particular, `z.…default(x)` without `.optional()`
  lands the field in the emitted JSON Schema `required` list, which contradicts
  a description that says the field defaults.
- **Privacy.** Never log or return cookies, auth headers, or tokens. VRCX
  reads are local-only and read-only. Tools act on the operator's own account,
  never on behalf of another user.
