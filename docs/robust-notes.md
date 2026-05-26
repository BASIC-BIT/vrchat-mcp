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

Generated tool `operationIds` lists are narrowing controls, not required allowlists, and they do not re-enable generated operations covered by curated tools. Keep generated writes broad for API gaps by default and rely on the local MCP client or agent harness to approve or deny account-changing tool calls. If a generated write becomes common or needs better ergonomics, add a curated write tool with clear inputs, bounded behavior, IDs in outputs, rate/backoff behavior where appropriate, and tests; the generated duplicate should then disappear from the default surface.

When future audits flag write/VRCX/generated-tool exposure, treat the preferred remediation as better docs, curated coverage, tool annotations, tests, and harness guidance, not disabling the feature by default.

The separate unresolved policy-sensitive boundary remains VRChat authentication: this project uses local user-managed cookies because there is no OAuth flow for this use case. Do not host this service for other users or collect other users' credentials/session data.
