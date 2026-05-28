import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { z } from 'zod';
import { getConfig } from '../config/index.js';
import { callOperation, CallError } from './client.js';
import { toolName } from '../utils/toolNames.js';
import { toolError } from '../utils/toolResponses.js';
import { destructiveToolAnnotations, writeToolAnnotations } from '../utils/toolAnnotations.js';
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

function registerGeneratedWriteRouter(input: {
  server: McpServer;
  toolNameValue: string;
  description: string;
  availableOperationIds: Set<string>;
  outputSchema: z.ZodTypeAny;
  respond: WriteToolResponder;
  destructive: boolean;
}): void {
  const inputSchema = GeneratedWriteToolInputSchema;
  input.server.registerTool(
    input.toolNameValue,
    {
      description: input.description,
      inputSchema,
      outputSchema: input.outputSchema,
      annotations: input.destructive ? destructiveToolAnnotations : writeToolAnnotations,
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
        if (!input.availableOperationIds.has(operationId)) {
          return toolError(
            `Generated operation ${operationId} is not available through ${input.toolNameValue}. Use vrchat_operation_details for status.`
          );
        }
        const result = await callOperation({
          operationId,
          params,
          body,
          options: callOptions,
        });
        return input.respond(result, includeMeta);
      } catch (err) {
        if (err instanceof CallError && err.payload) {
          return toolError(err.message, err.payload);
        }
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    }
  );
}

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
  const availableWriteOperationIds = await getAvailableGeneratedOperationIds('write');
  const availableDeleteOperationIds = await getAvailableGeneratedOperationIds('delete');
  let count = 0;

  if (availableWriteOperationIds.size > 0) {
    registerGeneratedWriteRouter({
      server,
      toolNameValue: toolName('vrchat.write'),
      description:
        'Call an available generated VRChat POST/PUT/PATCH operation by operationId. Use vrchat_operations and vrchat_operation_details to discover params/body.',
      availableOperationIds: availableWriteOperationIds,
      outputSchema: options.writeOutputSchema,
      respond: options.respond,
      destructive: false,
    });
    count += 1;
  }

  if (availableDeleteOperationIds.size > 0) {
    registerGeneratedWriteRouter({
      server,
      toolNameValue: toolName('vrchat.delete'),
      description:
        'Call an available generated VRChat DELETE operation by operationId. Use vrchat_operations and vrchat_operation_details to discover params/body.',
      availableOperationIds: availableDeleteOperationIds,
      outputSchema: options.writeOutputSchema,
      respond: options.respond,
      destructive: true,
    });
    count += 1;
  }

  return count;
}
