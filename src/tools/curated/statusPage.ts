import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  StatusPageOverviewInputSchema,
  StatusPageOverviewOutputSchema,
} from '../../models/statusPage.js';
import { getStatusPageOverview } from '../../services/statusPage/index.js';
import { readOnlyToolAnnotations } from '../../utils/toolAnnotations.js';
import { toolName } from '../../utils/toolNames.js';
import { textContent, toolError } from '../../utils/toolResponses.js';

export function registerCuratedStatusPageTools(server: McpServer): void {
  server.registerTool(
    toolName('vrchat.status.page.overview'),
    {
      description:
        'Compact VRChat status-page overview: up/down state, graph min/max/current values, unresolved + recent incidents, and active + upcoming maintenance (read-only).',
      inputSchema: StatusPageOverviewInputSchema,
      outputSchema: StatusPageOverviewOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const input = StatusPageOverviewInputSchema.parse(args ?? {});
        const payload = await getStatusPageOverview(input);
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
