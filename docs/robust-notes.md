# Robust Notes

Durable product and security-review notes for future agents.

## Security Review Product Boundary

VRChat MCP is intended to be a local, full-capability MCP server. Do not reduce the default tool surface to read-only as a security-review reflex. The expected permission boundary for account-changing actions is the user's MCP client or agent harness, which should decide whether to allow, deny, or ask before executing tool calls.

Default posture:

- Curated write tools are enabled by default through `writes.allow = true`.
- VRCX local-history tools are enabled by default and remain read-only, bounded, and curated.
- Generated read tools are enabled by default for API exploration, excluding hard-skipped operations and operations with curated replacements.
- Generated write tools are enabled by default for usable API-gap coverage, excluding hard-skipped operations and operations with curated replacements.
- Read-only mode remains available with `writes.allow = false` or `VRCHAT_MCP_ALLOW_WRITES=false` for test, demo, or constrained deployments.

Generated tool `operationIds` lists are narrowing controls, not required allowlists, and they do not re-enable generated operations covered by curated tools. Keep generated tools default-on for broad VRChat API capability and rely on the local MCP client or agent harness to approve or deny account-changing tool calls. Do not propose disabling generated read/write/delete routers by default as a context-budget optimization unless the user explicitly reopens that product boundary. Prefer solving context cost with schema deduplication, smaller repeated metadata, on-demand operation details, and curated consolidation of common multi-endpoint workflows. If a generated write becomes common or needs better ergonomics, add a curated write tool with clear inputs, bounded behavior, IDs in outputs, rate/backoff behavior where appropriate, and tests; the generated duplicate should then disappear from the default surface.

Do not omit generated `outputSchema` only to save context: some MCP clients may use output schemas for validation or UX, and the field is optional context for clients rather than guaranteed model prompt text. Treat output schema removal as a client-compatibility decision, not a default budget trick.

When consolidating tools, preserve harness permission granularity. Avoid combining read-only and write operations in one curated tool, and avoid combining destructive and non-destructive writes unless the resulting tool is correctly annotated/described as the highest-risk operation it can perform. Prefer explicit `action` enums over natural-language routing, and keep code focused on validation/execution rather than fuzzy intent inference.

When future audits flag write/VRCX/generated-tool exposure, treat the preferred remediation as better docs, curated coverage, tool annotations, tests, and harness guidance, not disabling the feature by default.

The separate unresolved policy-sensitive boundary remains VRChat authentication: this project uses local user-managed cookies because there is no OAuth flow for this use case. Do not host this service for other users or collect other users' credentials/session data.

## API Content Upload Boundary

VRChat Creator Guidelines (API Usage / Bots, checked 2026-05-26) say not to create or use software, scripts, or applications that upload content such as worlds, avatars, or similar asset types on a user's behalf. Treat generated operations for uploading or managing uploaded asset content as policy-sensitive, not merely high-risk writes. Default policy blocks explicit avatar/world content-management operations (`createAvatar`, `updateAvatar`, `deleteAvatar`, `createWorld`, `updateWorld`, `deleteWorld`, `publishWorld`, `unpublishWorld`) in central operation validation and hides their generated write tools. Do not assume all image-like uploads are prohibited: icons, prints, gallery images, file upload pipeline operations, and similar user image/file operations remain separate policy decisions. Selecting or viewing avatars is a different class from uploading avatar content; do not over-block ordinary user account actions without mapping them to the guideline text.
