import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getConfig } from '../config/index.js';
import { getSpecIndex } from './spec.js';
import { callReadOperation } from './readTools.js';
import { readToolName } from '../utils/toolNames.js';
import { toolError } from '../utils/toolResponses.js';

export type ReadToolResponder = (result: { data: unknown; url?: string }, includeMeta?: boolean) => {
  content: { type: 'text'; text: string }[];
  structuredContent: Record<string, unknown>;
};


export async function registerGeneratedReadTools(
  server: McpServer,
  options: {
    readOptionsSchema: z.ZodObject<any>;
    readOutputSchema: z.ZodTypeAny;
    respond: ReadToolResponder;
  },
): Promise<number> {
  const config = getConfig();
  if (config.generatedReadTools.disable) return 0;
  const skipOperationIds = new Set(config.generatedReadTools.skipOperationIds);

  const index = await getSpecIndex();
  const spec = index.raw ?? {};
  const paths = spec.paths ?? {};
  let count = 0;

  for (const pathItem of Object.values(paths)) {
    for (const [method, op] of Object.entries<any>(pathItem ?? {})) {
      if (method !== 'get') continue;
      if (!op?.operationId) continue;
      const operationId = op.operationId as string;
      if (skipOperationIds.has(operationId)) continue;
      const toolName = readToolName(operationId);
      const summary = op.summary ?? op.description ?? '';
      const description = summary
        ? `Read-only: ${String(summary).split('\n')[0]}`
        : `Read-only: ${operationId}`;

      const inputSchema = z
        .object({
          params: z.record(z.string(), z.any()).optional(),
        })
        .merge(options.readOptionsSchema);

      server.registerTool(
        toolName,
        {
          description,
          inputSchema,
          outputSchema: options.readOutputSchema,
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
            const message = err instanceof Error ? err.message : 'Unknown error';
            return toolError(message);
          }
        },
      );
      count += 1;
    }
  }

  return count;
}
