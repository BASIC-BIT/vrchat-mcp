# Privacy

VRChat MCP runs locally on your machine as a stdio MCP server. The project does not operate a hosted service for your VRChat session.

## Data Access

Depending on which tools you call, VRChat MCP can retrieve VRChat account, friend, world, group, event, notification, invite, avatar, status, and local VRCX history data. Tool results are returned to the MCP client that launched the server.

## Authentication Storage

By default, VRChat auth cookies are stored in the operating system keychain. If keychain storage is unavailable, the server falls back to a local cookie file on your machine. You can opt into file storage explicitly with `VRCHAT_MCP_COOKIE_STORE=file`.

VRChat's Creator Guidelines caution third-party API applications not to request or store login credentials, auth tokens, or session data. This project currently relies on local user-managed cookies because VRChat does not provide OAuth for this use case. Treat that as a policy-sensitive personal-use boundary: do not collect anyone else's login information, do not host this service for other users, and clear cookies with `vrchat_auth_logout` when you no longer need the session.

## Network Requests

The server makes requests to VRChat APIs, VRChat pipeline services, and VRChat status endpoints as needed for the tools you call. VRCX features read local VRCX database files on your machine when VRCX data is present.

Curated write tools, generated write tools for API gaps, generated read tools, and read-only VRCX local-history tools are enabled by default for local full-capability use. Use your MCP client or agent harness to control account-changing tool calls, or set `VRCHAT_MCP_ALLOW_WRITES=false` for read-only mode. VRCX tools stay read-only and avoid known cookie/credential storage.

## Hosted Integrations

Do not send VRChat MCP cookies or session tokens to hosted third-party services. Public HTTP or hosted connector variants should only be used if a future VRChat OAuth or public-data-only design exists.
