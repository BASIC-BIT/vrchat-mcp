import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { z } from 'zod';
import { getConfig } from '../config/index.js';
import { getSpecIndex } from './spec.js';
import { callReadOperation } from './readTools.js';
import { CallError } from './client.js';
import { readToolName } from '../utils/toolNames.js';
import { toolError } from '../utils/toolResponses.js';
import { readOnlyToolAnnotations } from '../utils/toolAnnotations.js';
import { getCuratedReadToolName } from './generatedToolOverrides.js';
import { buildGeneratedToolDescription } from './generatedToolDescriptions.js';
import { GENERATED_READ_SKIP_IDS } from './generatedToolSkips.js';
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
  const skipOperationIds = new Set(GENERATED_READ_SKIP_IDS);
  const allowedOperationIds = new Set(config.generatedReadTools.operationIds);
  const hasAllowlist = allowedOperationIds.size > 0;

  const index = await getSpecIndex();
  const spec = index.raw ?? {};
  const paths = spec.paths ?? {};
  const inputSchema = GeneratedReadToolInputSchema;
  let count = 0;

  for (const pathItem of Object.values(paths)) {
    for (const [method, op] of Object.entries<any>(pathItem ?? {})) {
      if (method !== 'get') continue;
      if (!op?.operationId) continue;
      const operationId = op.operationId as string;
      if (skipOperationIds.has(operationId)) continue;
      if (getCuratedReadToolName(operationId)) continue;
      if (hasAllowlist && !allowedOperationIds.has(operationId)) continue;
      const toolName = readToolName(operationId);
      const description = buildGeneratedToolDescription('read', operationId, op);

      server.registerTool(
        toolName,
        {
          description,
          inputSchema,
          outputSchema: options.readOutputSchema,
          annotations: readOnlyToolAnnotations,
        },
        async (args: any) => {
          try {
            const { params = {}, fields, compact, maxArrayLength, includeMeta } = args ?? {};
            const result = await callReadOperation(operationId, params, {
              fields,
              compact,
              maxArrayLength,
              includeMeta,
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
      count += 1;
    }
  }

  return count;
}
