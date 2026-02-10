import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getConfig } from '../config/index.js';
import { getSpecIndex } from './spec.js';
import { callReadOperation } from './readTools.js';
import { CallError } from './client.js';
import { buildParamsSchema } from './operationSchemas.js';
import { readToolName } from '../utils/toolNames.js';
import { toolError } from '../utils/toolResponses.js';
import { readOnlyToolAnnotations } from '../utils/toolAnnotations.js';
import {
  getCuratedReadToolName,
  getGeneratedReadToolDescription,
} from './generatedToolOverrides.js';
import { GENERATED_READ_SKIP_IDS } from './generatedToolSkips.js';

export type ReadToolResponder = (
  result: { data: unknown; url?: string },
  includeMeta?: boolean
) => {
  content: { type: 'text'; text: string }[];
  structuredContent: Record<string, unknown>;
};

function buildGeneratedReadToolDescription(operationId: string, op: any): string {
  const summary = op?.summary ?? op?.description ?? '';
  const summaryLine = String(summary).split('\n')[0].trim();
  const curated = getCuratedReadToolName(operationId);
  const override = getGeneratedReadToolDescription(operationId);

  if (override) return override;

  const fallback = summaryLine
    ? `Auto-generated read tool. ${summaryLine}`
    : `Auto-generated read tool for ${operationId}.`;

  if (curated) return `${fallback} Prefer curated tool: ${curated}.`;
  return `${fallback} Prefer curated tools when available.`;
}

function buildGeneratedReadToolInputSchema(input: {
  operationId: string;
  index: Awaited<ReturnType<typeof getSpecIndex>>;
  componentsSchemas: Record<string, unknown> | undefined;
  readOptionsSchema: z.ZodObject<any>;
}): z.ZodTypeAny {
  const opDef = input.index.operations.get(input.operationId);
  const paramsInfo = buildParamsSchema(opDef?.parameters ?? [], input.componentsSchemas, {
    aliasNumberForN: true,
  });

  const shape: Record<string, z.ZodTypeAny> = {};
  if (paramsInfo.schema) {
    shape.params = paramsInfo.required ? paramsInfo.schema : paramsInfo.schema.optional();
  }

  return z.object(shape).merge(input.readOptionsSchema).passthrough();
}

export async function registerGeneratedReadTools(
  server: McpServer,
  options: {
    readOptionsSchema: z.ZodObject<any>;
    readOutputSchema: z.ZodTypeAny;
    respond: ReadToolResponder;
  }
): Promise<number> {
  const config = getConfig();
  if (config.generatedReadTools.disable) return 0;
  const skipOperationIds = new Set(GENERATED_READ_SKIP_IDS);

  const index = await getSpecIndex();
  const spec = index.raw ?? {};
  const paths = spec.paths ?? {};
  const componentsSchemas = spec?.components?.schemas;
  let count = 0;

  for (const pathItem of Object.values(paths)) {
    for (const [method, op] of Object.entries<any>(pathItem ?? {})) {
      if (method !== 'get') continue;
      if (!op?.operationId) continue;
      const operationId = op.operationId as string;
      if (skipOperationIds.has(operationId)) continue;
      const toolName = readToolName(operationId);
      const description = buildGeneratedReadToolDescription(operationId, op);
      const inputSchema = buildGeneratedReadToolInputSchema({
        operationId,
        index,
        componentsSchemas,
        readOptionsSchema: options.readOptionsSchema,
      });

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
