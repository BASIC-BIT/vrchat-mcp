import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  StatusGetOutputSchema,
  StatusSetInputSchema,
  StatusSetOutputSchema,
} from '../../models/status.js';
import { getCurrentStatus, updateStatus } from '../../services/status/index.js';
import {
  readOnlyToolAnnotations,
  writeToolAnnotations,
} from '../../utils/toolAnnotations.js';
import { toolName } from '../../utils/toolNames.js';
import { textContent, toolError } from '../../utils/toolResponses.js';

export function registerCuratedStatusTools(server: McpServer): void {
  server.registerTool(
    toolName('vrchat.status.get'),
    {
      description: 'Get your current status + description (read-only).',
      outputSchema: StatusGetOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async () => {
      try {
        const payload = await getCurrentStatus();
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
    toolName('vrchat.status.set'),
    {
      description:
        'Set your status + description (write). Accepts status or color (blue/green/orange/red). Defaults to current user.',
      inputSchema: StatusSetInputSchema,
      outputSchema: StatusSetOutputSchema,
      annotations: writeToolAnnotations,
    },
    async (args) => {
      try {
        const input = StatusSetInputSchema.parse(args);
        const payload = await updateStatus(input);
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
