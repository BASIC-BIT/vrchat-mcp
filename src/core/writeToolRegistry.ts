import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { z } from 'zod';
import { getConfig } from '../config/index.js';
import { callOperation, CallError } from './client.js';
import { toolName } from '../utils/toolNames.js';
import { toolError } from '../utils/toolResponses.js';
import { destructiveToolAnnotations } from '../utils/toolAnnotations.js';
import { getAvailableGeneratedOperationIds } from './generatedOperations.js';
import { GeneratedWriteToolInputSchema } from '../schemas/write.js';

export type WriteToolResponder = (
  result: {
    data?: unknown;
    url?: string;
    status?: number;
    headers?: Record<string, string>;
    dryRun?: boolean;
  },
  includeMeta?: boolean
) => {
  content: { type: 'text'; text: string }[];
  structuredContent: Record<string, unknown>;
};

export async function registerGeneratedWriteTools(
  server: McpServer,
  options: {
    writeOptionsSchema: z.ZodObject<any>;
    writeOutputSchema: z.ZodTypeAny;
    respond: WriteToolResponder;
  }
): Promise<number> {
  const config = getConfig();
  if (!config.generatedWriteTools.enabled) return 0;
  const availableOperationIds = await getAvailableGeneratedOperationIds('write');
  if (availableOperationIds.size === 0) return 0;
  const inputSchema = GeneratedWriteToolInputSchema;

  server.registerTool(
    toolName('vrchat.write'),
    {
      description:
        'Call an available generated VRChat write operation by operationId. Use vrchat_operations and vrchat_operation_details to discover params/body.',
      inputSchema,
      outputSchema: options.writeOutputSchema,
      annotations: destructiveToolAnnotations,
    },
    async (args: unknown) => {
      try {
        const {
          operationId,
          params = {},
          body,
          options: callOptions,
          includeMeta,
        } = inputSchema.parse(args ?? {});
        if (!availableOperationIds.has(operationId)) {
          return toolError(
            `Generated write operation ${operationId} is not available. Use vrchat_operation_details for status.`
          );
        }
        const result = await callOperation({
          operationId,
          params,
          body,
          options: callOptions,
        });
        return options.respond(result, includeMeta);
      } catch (err) {
        if (err instanceof CallError && err.payload) {
          return toolError(err.message, err.payload);
        }
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    }
  );

  return 1;
}
