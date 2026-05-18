# Public Launch Plan

This is the working checklist for taking VRChat MCP from private repo to public project. Security fixes should merge before any public release, npm publish, or registry submission.

## Goals

- Make the project discoverable to people searching for VRChat, MCP, Claude, OpenCode, and VRCX tooling.
- Lead with the defaults: read-only operations, local authentication, explicit writes, and no affiliation with VRChat Inc.
- Prefer durable developer surfaces over broad paid ads for the first launch.
- Use a short feedback loop: ship public, watch installs/issues/stars/registry traffic, then decide whether broader promotion is worth it.

## Launch Gates

| Gate                 | Required Before Public Launch | Notes                                                                                                      |
| -------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Security fixes       | Yes                           | Merge the parallel security work first.                                                                    |
| README               | Done                          | Public-facing README landed in PR #9.                                                                      |
| Repo metadata        | Done                          | Description, homepage, and topics are set.                                                                 |
| Social preview       | Asset ready                   | Use `assets/social-preview.png` in GitHub repo settings.                                                   |
| Release notes        | Done                          | `CHANGELOG.md` includes the initial `v0.1.0` notes.                                                        |
| Package validation   | Needed                        | Re-run `npm run check`, `npm run build`, and `npm pack --dry-run` on final `main`.                         |
| Live smoke           | Recommended                   | Run `npm run smoke:live` after local login. Keep results private if they include account-specific details. |
| npm publish decision | Done                          | Publish the scoped package as `@basicbit/vrchat-mcp`.                                                      |

## Primary Discovery Surfaces

| Surface                   | Why It Matters                                                                                        | Action                                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| GitHub repository         | Primary source of trust, docs, issues, stars, and topic discovery.                                    | Done: public repo, social preview, and GitHub releases are in place.                                   |
| npm                       | Install path and prerequisite for official MCP Registry metadata when using npm package distribution. | Done: `@basicbit/vrchat-mcp` is published on npm.                                                      |
| Official MCP Registry     | Upstream source of truth for MCP server discovery. Other registries may consume it.                   | Done: `io.github.BASIC-BIT/vrchat-mcp` is published and verified.                                      |
| GitHub MCP Registry       | High-intent discovery inside GitHub's MCP ecosystem.                                                  | Verify listing after official MCP Registry submission and public repo indexing.                        |
| Smithery                  | MCP marketplace with install/distribution workflow and usage visibility.                              | Submit after public repo and npm package are stable. Lead with concrete VRChat tasks.                  |
| MCP.so                    | Third-party MCP marketplace with a visible Submit flow and GitHub issue submissions.                  | Submit via `https://mcp.so/submit` or `chatmcp/mcpso` issue after public release.                      |
| Glama MCP Servers         | Large indexed MCP directory with quality and maintenance signals.                                     | Use Add Server flow after public release; verify how it classifies local-only/auth tools.              |
| Awesome MCP Servers lists | High-reach GitHub discovery for builders browsing MCP servers.                                        | Submit PRs to `punkpeye/awesome-mcp-servers` and `appcypher/awesome-mcp-servers` after public release. |

## Official MCP Registry Steps

The official registry is currently the highest-value registry because it is intended as a primary source of truth for public MCP servers.

Completed steps:

1. Used the scoped npm package name `@basicbit/vrchat-mcp`.
2. Added `mcpName` to `package.json`.
3. Matched the registry namespace to GitHub's authorized org casing: `io.github.BASIC-BIT/vrchat-mcp`.
4. Published the package to npm.
5. Installed `mcp-publisher`.
6. Added and reviewed `server.json`.
7. Declared stdio transport, supported environment variables, repository URL, and the exact package version.
8. Authenticated with `mcp-publisher login github`.
9. Published with `mcp-publisher publish`.
10. Verified via registry API search.

Candidate server description:

```text
MCP server for VRChat friends, worlds, groups, events, notifications, and optional VRCX history. Read-only by default with explicit opt-in writes.
```

## Community Launch Channels

Use these after the repo is public and the security fixes are merged.

| Channel                            | Fit                   | Notes                                                                                                  |
| ---------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------ |
| MCP Discord / registry discussions | High                  | Best early feedback channel for registry correctness and MCP ergonomics.                               |
| GitHub release announcement        | High                  | Durable link for registries and social posts.                                                          |
| X / Bluesky / Mastodon             | Medium                | Good for quick awareness in MCP builder circles if the post includes a concrete demo prompt.           |
| Hacker News Show HN                | Medium                | Worth considering if the README and install path are clean. Lead with concrete VRChat tasks, not hype. |
| Reddit MCP tooling spaces          | Medium                | Useful if framed as open-source tooling, not promotion.                                                |
| VRChat creator communities         | Medium                | Be careful and transparent: unofficial and read-only by default. Do not imply endorsement.             |
| Product Hunt                       | Low for first release | More work than value unless we have screenshots, demo video, and a polished install path.              |

## Paid Awareness

Do not start with Google Ads for the first public release.

Reasoning:

- Search intent is likely narrow and hard to target before people know to search for this category.
- The best early users are MCP builders, VRChat power users, and VRCX users, not broad paid-search audiences.
- Paid traffic before security fixes, release notes, and registry listings creates avoidable trust risk.

If we test paid later, use a capped experiment:

- Budget: $10 to $25/day for 7 days.
- Channels: exact-match Google Search and maybe sponsor placement on an MCP directory if available.
- Keywords: `VRChat MCP`, `VRChat Claude`, `VRCX MCP`, `VRChat API MCP`.
- Landing page: GitHub README or a small docs page with install instructions and write controls.
- Success metric: qualified installs, stars, issues, Discord messages, or npm downloads, not impressions.

## Launch Copy Kit

Short description:

```text
VRChat MCP gives MCP clients tools for VRChat friends, worlds, groups, events, notifications, and optional VRCX history.
```

One paragraph:

```text
VRChat MCP is an unofficial Model Context Protocol server for VRChat. It is read-only by default, keeps authentication on your machine, and gives MCP clients like Claude Desktop and OpenCode tools for friends, worlds, groups, events, notifications, and VRCX history.
```

Launch post draft:

```text
I am releasing VRChat MCP, an unofficial MCP server for VRChat.

It lets MCP clients answer questions like who is online, where friends are, what events are coming up, and what VRCX history/memos say. The server is read-only by default.

Repo: <PUBLIC_REPO_URL>
```

Registry tags:

```text
vrchat, mcp, model-context-protocol, claude, opencode, typescript, vrchat-api, vrcx, social-vr
```

## Manual GitHub Settings

GitHub does not expose social preview upload through `gh repo edit`. Upload this image manually after the repo is public or just before launch:

```text
assets/social-preview.png
```

Path in GitHub:

```text
Settings -> General -> Social preview -> Edit -> Upload an image
```

Current image dimensions are `1200x630`, which matches Open Graph social-card dimensions and is accepted by GitHub social preview uploads.

## First 48 Hours After Public Release

- Watch GitHub issues and discussions closely.
- Pin or link one canonical install/config answer if repeated questions appear.
- Keep a short known-issues section in the release notes.
- Avoid enabling write-heavy demos until users understand the write opt-in model.
- Track which channels actually send qualified users.

## Open Questions

- Should we add a `server.json` to the repo before or during npm publication?
- Do we want a tiny docs site later, or is GitHub README enough for `0.1.0`?
- Should launch wait for a demo GIF/video of the login flow and one read-only MCP client query?
