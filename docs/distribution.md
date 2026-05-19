# Distribution and Listings

This document tracks public discovery surfaces for VRChat MCP. Keep it updated when submitting, claiming, editing, or removing listings.

## Canonical Package and Registry

| Surface | Status | URL / Identifier | Notes |
| --- | --- | --- | --- |
| GitHub | Live | https://github.com/BASIC-BIT/vrchat-mcp | Canonical source, docs, issues, and releases. |
| npm | Live | `@basicbit/vrchat-mcp` | Latest verified release: `0.1.5`. |
| Official MCP Registry | Live | `io.github.BASIC-BIT/vrchat-mcp` | Latest verified release: `0.1.5`; package entry points to npm `0.1.5`. |
| GitHub Releases | Live | https://github.com/BASIC-BIT/vrchat-mcp/releases | Latest verified release: `v0.1.5`. |

## Directories and Marketplaces

| Surface | Status | URL / Identifier | Notes |
| --- | --- | --- | --- |
| MCP.so | Live / submitted | https://mcp.so/server/vrchat-mcp/BASIC-BIT | Listing created under `BASIC-BIT`; config uses `npx -y @basicbit/vrchat-mcp@latest`. |
| mcpservers.org | Submitted | https://mcpservers.org/submit | Submitted on 2026-05-19 with contact `basic@basicbit.net`; review page estimated within 12 hours. |
| PulseMCP | Auto-ingest expected | https://www.pulsemcp.com/servers | PulseMCP states it ingests from the Official MCP Registry daily and processes weekly. Check after a week. |
| Glama | Submitted / pending review | https://glama.ai/mcp/servers | Submitted through Add Server flow on 2026-05-19. Public submissions are reviewed before becoming visible. |
| Smithery | Not submitted | https://smithery.ai | Current Smithery publishing expects public Streamable HTTP servers. VRChat MCP is currently local stdio with per-user VRChat auth cookies, so do not submit until there is a deliberate HTTP/OAuth design. |

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
| Future Smithery listing | Use replacement branding if HTTP/hosted support is added later. |
| Social/demo assets | Use replacement branding in screenshots, GIFs, and videos. |
