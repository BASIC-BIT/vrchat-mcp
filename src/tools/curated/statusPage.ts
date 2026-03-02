import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  StatusPageIncidentsOutputSchema,
  StatusPageMaintenancesOutputSchema,
  StatusPageSummaryOutputSchema,
} from '../../models/statusPage.js';
import {
  getStatusPageSummary,
  listActiveStatusPageMaintenances,
  listOpenStatusPageIncidents,
} from '../../services/statusPage/index.js';
import { readOnlyToolAnnotations } from '../../utils/toolAnnotations.js';
import { toolName } from '../../utils/toolNames.js';
import { textContent, toolError } from '../../utils/toolResponses.js';

export function registerCuratedStatusPageTools(server: McpServer): void {
  server.registerTool(
    toolName('vrchat.status.page.summary'),
    {
      description:
        'Get VRChat service status page summary: overall state, non-operational components, unresolved incidents, and active maintenance (read-only).',
      outputSchema: StatusPageSummaryOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async () => {
      try {
        const payload = await getStatusPageSummary();
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
    toolName('vrchat.status.page.incidents.open'),
    {
      description: 'List unresolved incidents from the VRChat service status page (read-only).',
      outputSchema: StatusPageIncidentsOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async () => {
      try {
        const payload = await listOpenStatusPageIncidents();
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
    toolName('vrchat.status.page.maintenances.active'),
    {
      description:
        'List currently active scheduled maintenance windows from the VRChat service status page (read-only).',
      outputSchema: StatusPageMaintenancesOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async () => {
      try {
        const payload = await listActiveStatusPageMaintenances();
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
