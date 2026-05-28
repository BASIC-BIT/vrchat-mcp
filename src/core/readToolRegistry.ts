import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { z } from 'zod';
import { getConfig } from '../config/index.js';
import { callReadOperation } from './readTools.js';
import { CallError } from './client.js';
import { toolName } from '../utils/toolNames.js';
import { toolError } from '../utils/toolResponses.js';
import { readOnlyToolAnnotations } from '../utils/toolAnnotations.js';
import { getAvailableGeneratedOperationIds } from './generatedOperations.js';
import { GeneratedReadToolInputSchema } from '../schemas/read.js';

export type ReadToolResponder = (
  result: { data: unknown; url?: string },
  includeMeta?: boolean
) => {
  content: { type: 'text'; text: string }[];
  structuredContent: Record<string, unknown>;
};

export async function registerGeneratedReadTools(
  server: McpServer,
  options: {
    readOptionsSchema: z.ZodObject<any>;
    readOutputSchema: z.ZodTypeAny;
    respond: ReadToolResponder;
  }
): Promise<number> {
  const config = getConfig();
  if (!config.generatedReadTools.enabled) return 0;
  const availableOperationIds = await getAvailableGeneratedOperationIds('read');
  if (availableOperationIds.size === 0) return 0;
  const inputSchema = GeneratedReadToolInputSchema;

  server.registerTool(
    toolName('vrchat.read'),
    {
      description:
        'Call an available generated VRChat GET operation by operationId. Use vrchat_operations and vrchat_operation_details to discover params.',
      inputSchema,
      outputSchema: options.readOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args: unknown) => {
      try {
        const { operationId, params = {}, fields, compact, maxArrayLength, includeMeta, page } =
          inputSchema.parse(args ?? {});
        if (!availableOperationIds.has(operationId)) {
          return toolError(
            `Generated read operation ${operationId} is not available. Use vrchat_operation_details for status.`
          );
        }
        const result = await callReadOperation(operationId, params, {
          fields,
          compact,
          maxArrayLength,
          includeMeta,
          page,
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
