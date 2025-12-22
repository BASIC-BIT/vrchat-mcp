import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  InviteSelfOutputSchema,
  InviteSelfSchema,
  InviteUserOutputSchema,
  InviteUserSchema,
} from '../../models/invites.js';
import {
  prepareInviteUser,
  resolveInviteLocation,
  sendSelfInvite,
  sendUserInvite,
} from '../../services/invites/index.js';
import { createConfirmation, consumeConfirmation } from '../../services/confirmations.js';
import { toolName } from '../../utils/toolNames.js';
import { textContent, toolError } from '../../utils/toolResponses.js';

export function registerCuratedInviteTools(server: McpServer): void {
  server.registerTool(
    toolName('vrchat.invite.self'),
    {
      description: 'Invite yourself to an instance (low-risk write).',
      inputSchema: InviteSelfSchema,
      outputSchema: InviteSelfOutputSchema,
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
    },
  );

  server.registerTool(
    toolName('vrchat.invite.user'),
    {
      description: 'Invite a user to an instance (medium-risk write; requires confirmation).',
      inputSchema: InviteUserSchema,
      outputSchema: InviteUserOutputSchema,
    },
    async (args) => {
      try {
        const input = InviteUserSchema.parse(args);
        const prepared = prepareInviteUser(input);
        if (!prepared.ok) {
          return toolError(prepared.reason);
        }
        const confirmPayload = { userId: prepared.userId, request: prepared.request };
        if (!input.confirmId) {
          const confirm = createConfirmation('invite.user', confirmPayload);
          const payload = {
            status: 'confirm_required',
            confirmId: confirm.confirmId,
            expiresAt: confirm.expiresAt,
          };
          return {
            content: textContent(JSON.stringify(payload, null, 2)),
            structuredContent: payload,
          };
        }

        const confirm = consumeConfirmation(input.confirmId, 'invite.user', confirmPayload);
        if (!confirm.ok) {
          return toolError(confirm.reason, { status: 'confirm_failed', reason: confirm.reason });
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
    },
  );
}
