import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getConfig } from '../../../config/index.js';
import {
  VrcxRecentInstanceSessionsInputSchema,
  VrcxRecentInstanceSessionsOutputSchema,
  VrcxRecentWorldVisitsInputSchema,
  VrcxRecentWorldVisitsOutputSchema,
} from '../../../models/vrcx.js';
import {
  listRecentInstanceSessionsForActiveUser,
  listRecentWorldVisits,
} from '../../../services/vrcx/index.js';
import { readOnlyToolAnnotations } from '../../../utils/toolAnnotations.js';
import { toolName } from '../../../utils/toolNames.js';
import { textContent, toolError } from '../../../utils/toolResponses.js';

export function registerVrcxGamelogTools(server: McpServer): void {
  server.registerTool(
    toolName('vrcx.gamelog.world_visits.recent'),
    {
      description:
        'List recent world visits from the VRCX gamelog (read-only). This reflects your local VRChat/VRCX activity history.',
      inputSchema: VrcxRecentWorldVisitsInputSchema,
      outputSchema: VrcxRecentWorldVisitsOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const input = VrcxRecentWorldVisitsInputSchema.parse(args ?? {});
        const config = getConfig();
        const result = await listRecentWorldVisits({
          enabled: config.vrcx.enabled,
          databasePath: config.vrcx.databasePath,
          worldDbPath: config.vrcx.worldDbPath,
          daysBack: input.daysBack,
          limit: input.limit,
        });
        if (!result.ok) return toolError(result.reason, result);
        const payload = {
          from: result.from,
          limit: result.limit,
          total: result.total,
          truncated: result.truncated,
          visits: result.visits,
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
    toolName('vrcx.instances.recent'),
    {
      description:
        'List recent instance sessions for your active VRCX account (read-only). Derived from VRCX gamelog OnPlayerLeft entries.',
      inputSchema: VrcxRecentInstanceSessionsInputSchema,
      outputSchema: VrcxRecentInstanceSessionsOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const input = VrcxRecentInstanceSessionsInputSchema.parse(args ?? {});
        const config = getConfig();
        const result = await listRecentInstanceSessionsForActiveUser({
          enabled: config.vrcx.enabled,
          databasePath: config.vrcx.databasePath,
          worldDbPath: config.vrcx.worldDbPath,
          daysBack: input.daysBack,
          limit: input.limit,
        });
        if (!result.ok) return toolError(result.reason, result);
        const payload = {
          from: result.from,
          limit: result.limit,
          total: result.total,
          truncated: result.truncated,
          activeUserId: result.activeUserId,
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
