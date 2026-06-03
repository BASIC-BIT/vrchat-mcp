# Distribution and Listings

This document tracks public discovery surfaces for VRChat MCP. Keep it updated when submitting, claiming, editing, or removing listings.

## Canonical Package and Registry

| Surface | Status | URL / Identifier | Notes |
| --- | --- | --- | --- |
| GitHub | Live | https://github.com/BASIC-BIT/vrchat-mcp | Canonical source, docs, issues, and releases. |
| npm | Live | `@basicbit/vrchat-mcp` | Latest verified release: `0.1.5`; `0.1.6` pending publish. |
| Official MCP Registry | Live | `io.github.BASIC-BIT/vrchat-mcp` | Latest verified release: `0.1.5`; package entry points to npm `0.1.5`; `0.1.6` pending registry publish. |
| GitHub Releases | Live | https://github.com/BASIC-BIT/vrchat-mcp/releases | Latest verified release: `v0.1.5`; `v0.1.6` pending release. |

## Directories and Marketplaces

| Surface | Status | URL / Identifier | Notes |
| --- | --- | --- | --- |
| MCP.so | Live / submitted | https://mcp.so/server/vrchat-mcp/BASIC-BIT | Listing created under `BASIC-BIT`; config uses `npx -y @basicbit/vrchat-mcp@latest`. |
| mcpservers.org | Submitted | https://mcpservers.org/submit | Submitted on 2026-05-19 with contact `basic@basicbit.net`; review page estimated within 12 hours. |
| PulseMCP | Auto-ingest expected | https://www.pulsemcp.com/servers | PulseMCP states it ingests from the Official MCP Registry daily and processes weekly. Check after a week. |
| Glama | Submitted / pending review | https://glama.ai/mcp/servers | Submitted through Add Server flow on 2026-05-19. Public submissions are reviewed before becoming visible. |
| Smithery | Not submitted / MCPB candidate | https://smithery.ai | Current Smithery publishing supports public Streamable HTTP URLs and local stdio MCPB bundles. Do not publish a hosted VRChat MCP without VRChat OAuth; only submit after a local MCPB artifact is built and smoke-tested. |

## Awesome Lists

| Surface | Status | URL / Identifier | Notes |
| --- | --- | --- | --- |
| TensorBlock awesome-mcp-servers | PR open | https://github.com/TensorBlock/awesome-mcp-servers/pull/562 | Adds VRChat MCP to Gaming. |
| appcypher awesome-mcp-servers | Branch prepared, PR blocked | https://github.com/appcypher/awesome-mcp-servers/compare/main...BASIC-BIT:awesome-mcp-servers:add-vrchat-mcp | Maintainer repo currently appears not to allow this account to create PRs; do not spend more time unless policy changes. |
| wong2 awesome-mcp-servers / mcpservers.org | Submitted via website | https://mcpservers.org/submit | Repo README says PRs are not accepted; submit through website instead. |

## Listing Copy

Short description:

```text
Local stdio MCP server for VRChat friends, worlds, groups, events, notifications, status, avatars, and VRCX history.
```

Install/config snippet:

```json
{
  "mcpServers": {
    "vrchat": {
      "command": "npx",
      "args": ["-y", "@basicbit/vrchat-mcp@latest"]
    }
  }
}
```

Tags:

```text
VRChat, MCP, Model Context Protocol, VRCX, Gaming
```

## Platform Packaging Opportunities

Prioritize local-first distribution surfaces that keep VRChat authentication on the user's machine. Do not publish any hosted/persistent service that asks users for VRChat credentials or stores VRChat cookies/session tokens.

| Surface | Priority | Status | Local Auth Fit | Next Action |
| --- | --- | --- | --- | --- |
| MCPB bundle | High | Candidate | Strong | Build and smoke-test a platform-specific `.mcpb` artifact before broader non-developer promotion. |
| Smithery local MCPB listing | High | Candidate after MCPB | Strong | Publish only a local MCPB bundle, not a hosted URL. Re-check Smithery upload/review flow after the artifact exists. |
| Claude Code plugin | Medium-high | Candidate | Strong | Package `.mcp.json` plus one or two VRChat workflow skills; consider community marketplace submission after local testing. |
| Codex plugin | Medium-high | Candidate | Strong | Package `.codex-plugin/plugin.json`, `.mcp.json`, and VRChat workflow skills; public self-serve publishing is not ready, but local/Git-backed marketplaces work. |
| GitHub MCP Registry / Copilot IDE install | High | Ingest expected from registry | Strong for IDE/local; weak for cloud agent | Verify GitHub MCP Registry visibility and add Copilot/VS Code install docs once visible. |
| Client recipe docs | Medium | Needed | Strong | Add tested snippets for Claude Code, Codex, VS Code/Copilot, and generic JSON MCP clients. |
| Claude.ai connectors / Claude API MCP connector | Low until auth redesign | Blocked | Weak | Requires public HTTP/SSE MCP. Do not pursue for cookie/session-backed personal VRChat access. |
| OpenAI Responses API remote MCP / ChatGPT Apps | Low until auth redesign | Blocked | Weak | Requires public hosted MCP and app review. Revisit only for OAuth-backed or public-data-only VRChat tooling. |
| GitHub Copilot Extension | Low | Not planned | Weak | Hosted GitHub App-style extension is a worse fit than MCP Registry/local MCP for this project. |

Auth boundary:

- Safer: local stdio, MCPB, Claude/Codex plugins that launch local stdio, and client configs that run `@basicbit/vrchat-mcp` on the user's machine.
- Unsafe for the current architecture: hosted public MCP services that store, proxy, or operate user VRChat cookies/session tokens.
- Future hosted support requires VRChat OAuth or a separate public-data-only MCP that does not touch personal account state.
- Policy-sensitive even locally: VRChat's Creator Guidelines say API applications should not request or store login credentials, auth tokens, or session data. Treat current local cookie auth as a personal-use risk boundary unless VRChat provides OAuth or explicit approval.

## Smithery MCPB Notes

Current Smithery docs describe two publish paths:

- Public Streamable HTTP URL, which is not appropriate for user-authenticated VRChat access unless VRChat OAuth or another deliberate auth design exists.
- Local MCPB bundle, which is the acceptable path to evaluate because users download and run the stdio server on their own machine.

MCPB packaging is a separate release artifact, not just a direct npm package listing. A bundle needs at least:

- `manifest.json` using MCPB manifest version `0.3` or newer.
- `server.type: "node"` and an entry point pointing at bundled compiled JavaScript.
- Production dependencies bundled in `node_modules` inside the archive.
- A default runtime tool list that matches the manifest, including compact generated routers.
- Compatibility metadata for Node.js `>=24.15.0` and supported platforms.
- Privacy policy links because the server connects to VRChat and may read user/account/social data.

Do not submit to Smithery until the MCPB artifact is built, locally smoke-tested, and reviewed for auth/privacy wording.

## Branding Follow-Up

Replace the current `assets/logo.svg` before a broader marketing push. Known replacement surfaces include:

| Surface | Replacement Needed |
| --- | --- |
| Repo | `assets/logo.svg` |
| npm | Package tarball includes `assets/logo.svg` through `package.json` files. |
| MCP.so | Avatar URL currently points at `https://raw.githubusercontent.com/BASIC-BIT/vrchat-mcp/main/assets/logo.svg`. |
| mcpservers.org | Check whether the listing caches repository artwork after approval. |
| Glama | Check whether the listing imports or caches repository artwork after approval. |
| PulseMCP | Check after auto-ingestion. |
| Future Smithery listing | Use replacement branding if a local MCPB listing or deliberate HTTP/OAuth design is added later. |
| Social/demo assets | Use replacement branding in screenshots, GIFs, and videos. |
