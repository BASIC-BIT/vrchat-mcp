import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  InviteSelfOutputSchema,
  InviteSelfSchema,
  InviteUserToMeOutputSchema,
  InviteUserToMeSchema,
  InviteUserOutputSchema,
  InviteUserSchema,
} from '../../models/invites.js';
import {
  inviteUserToCurrentInstance,
  prepareInviteUser,
  resolveInviteLocation,
  sendSelfInvite,
  sendUserInvite,
} from '../../services/invites/index.js';
import { writeToolAnnotations } from '../../utils/toolAnnotations.js';
import { toolName } from '../../utils/toolNames.js';
import { textContent, toolError } from '../../utils/toolResponses.js';

export function registerCuratedInviteTools(server: McpServer): void {
  server.registerTool(
    toolName('vrchat.invite.self'),
    {
      description: 'Invite yourself to an instance (low-risk write).',
      inputSchema: InviteSelfSchema,
      outputSchema: InviteSelfOutputSchema,
      annotations: writeToolAnnotations,
    },
    async (args) => {
      try {
        const input = InviteSelfSchema.parse(args);
        const location = resolveInviteLocation(input);
        const notification = await sendSelfInvite(location);
        const payload = {
          status: 'sent',
          notification,
        };
        return {
          content: textContent(JSON.stringify(payload, null, 2)),
          structuredContent: payload as Record<string, unknown>,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    }
  );

  server.registerTool(
    toolName('vrchat.invite.user'),
    {
      description: 'Invite a user to an instance.',
      inputSchema: InviteUserSchema,
      outputSchema: InviteUserOutputSchema,
      annotations: writeToolAnnotations,
    },
    async (args) => {
      try {
        const input = InviteUserSchema.parse(args);
        const prepared = prepareInviteUser(input);
        if (!prepared.ok) {
          return toolError(prepared.reason);
        }

        const notification = await sendUserInvite(prepared.userId, prepared.request);
        const payload = {
          status: 'sent',
          notification,
        };
        return {
          content: textContent(JSON.stringify(payload, null, 2)),
          structuredContent: payload as Record<string, unknown>,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    }
  );

  server.registerTool(
    toolName('vrchat.invite.user_to_me'),
    {
      description:
        'Invite a user to your current instance. Requires only the target userId; resolves your current location automatically. If you only have a display name, run vrchat_friends_search first to get userId.',
      inputSchema: InviteUserToMeSchema,
      outputSchema: InviteUserToMeOutputSchema,
      annotations: writeToolAnnotations,
    },
    async (args) => {
      try {
        const input = InviteUserToMeSchema.parse(args);
        const payload = await inviteUserToCurrentInstance(input);
        return {
          content: textContent(JSON.stringify(payload, null, 2)),
          structuredContent: payload as Record<string, unknown>,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    }
  );
}
