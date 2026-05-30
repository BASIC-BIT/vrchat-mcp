---
name: vrchat-mcp
description: Use when operating VRChat MCP tools, especially auth, privacy-sensitive results, writes, stale cache, or resolving names to IDs.
---

# VRChat MCP

Use tool schemas and descriptions for normal tool selection. This skill only covers product-specific sharp edges.

- VRChat MCP is designed for local use with user-managed authentication. Normal operation uses the server's auth tools and local auth storage; agents should not need to handle raw VRChat cookies or session tokens.
- If authentication is missing, use the auth tool flow and verify with a current-user or profile read before continuing.
- Prefer overview or search tools before detail tools. Use IDs returned by tools for follow-up calls; do not infer IDs from names or URLs.
- If direct friend lookup by name fails, use the explicit friend search tool before concluding the friend is unavailable.
- For write tools, keep the target and side effect visible to the user. If a tool returns `confirm_required`, rerun only with the returned `confirmId` and unchanged arguments.
- If results look stale, invalidate the relevant cache once and retry before treating the result as unavailable.
- VRCX tools read local VRCX history rather than live VRChat API state.
