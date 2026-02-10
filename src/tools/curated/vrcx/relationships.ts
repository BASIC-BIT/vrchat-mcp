import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getConfig } from '../../../config/index.js';
import {
  VrcxUserRelationshipSessionsInputSchema,
  VrcxUserRelationshipSessionsOutputSchema,
  VrcxUserRelationshipSummaryInputSchema,
  VrcxUserRelationshipSummaryOutputSchema,
} from '../../../models/vrcx.js';
import {
  getUserRelationshipSummary,
  listUserRelationshipSessions,
} from '../../../services/vrcx/index.js';
import { readOnlyToolAnnotations } from '../../../utils/toolAnnotations.js';
import { toolName } from '../../../utils/toolNames.js';
import { textContent, toolError } from '../../../utils/toolResponses.js';

export function registerVrcxRelationshipTools(server: McpServer): void {
  server.registerTool(
    toolName('vrcx.user.relationship.summary'),
    {
      description:
        'Summarize your relationship history with a user using VRCX logs: time spent, join count, and last seen (read-only).',
      inputSchema: VrcxUserRelationshipSummaryInputSchema,
      outputSchema: VrcxUserRelationshipSummaryOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const input = VrcxUserRelationshipSummaryInputSchema.parse(args ?? {});
        const config = getConfig();
        const result = await getUserRelationshipSummary({
          enabled: config.vrcx.enabled,
          databasePath: config.vrcx.databasePath,
          worldDbPath: config.vrcx.worldDbPath,
          userId: input.userId,
          displayName: input.displayName,
        });
        if (!result.ok) return toolError(result.reason, result);
        const payload = {
          query: result.query,
          resolvedBy: result.resolvedBy,
          resolvedUserId: result.resolvedUserId,
          displayName: result.displayName,
          lastSeen: result.lastSeen,
          joinCount: result.joinCount,
          timeSpentMs: result.timeSpentMs,
          timeSpentHours: result.timeSpentHours,
          hasData: result.hasData,
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
    toolName('vrcx.user.relationship.sessions'),
    {
      description:
        'List recent shared instance sessions with a user from VRCX logs (read-only). Use this for deep history; results are limited by default.',
      inputSchema: VrcxUserRelationshipSessionsInputSchema,
      outputSchema: VrcxUserRelationshipSessionsOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const input = VrcxUserRelationshipSessionsInputSchema.parse(args ?? {});
        const config = getConfig();
        const result = await listUserRelationshipSessions({
          enabled: config.vrcx.enabled,
          databasePath: config.vrcx.databasePath,
          worldDbPath: config.vrcx.worldDbPath,
          userId: input.userId,
          displayName: input.displayName,
          limit: input.limit,
        });
        if (!result.ok) return toolError(result.reason, result);
        const payload = {
          query: result.query,
          resolvedBy: result.resolvedBy,
          resolvedUserId: result.resolvedUserId,
          total: result.total,
          limit: result.limit,
          truncated: result.truncated,
          sessions: result.sessions,
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
}
