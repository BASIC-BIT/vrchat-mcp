import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { callOperation, type CallInput } from '../core/client.js';
import { CallInputSchema } from '../schemas/call.js';
import { toolName } from '../utils/toolNames.js';
import { toolError } from '../utils/toolResponses.js';

export function registerRawTools(server: McpServer): void {
  server.registerTool(
    toolName('vrchat.call'),
    {
      description: 'Call a VRChat OpenAPI operation by operationId.',
      inputSchema: CallInputSchema,
      outputSchema: z.object({
        url: z.string(),
        status: z.number().optional(),
        headers: z.record(z.string(), z.string()).optional(),
        data: z.any().optional(),
        dryRun: z.boolean().optional(),
      }),
    },
    async (args: CallInput) => {
      try {
        const result = await callOperation(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
          structuredContent: result as unknown as Record<string, unknown>,
        };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return toolError(message);
    }
  }
);
}
