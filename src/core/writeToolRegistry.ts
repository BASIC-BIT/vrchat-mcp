import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getConfig } from '../config/index.js';
import { getSpecIndex } from './spec.js';
import { callOperation, CallError } from './client.js';
import { buildParamsSchema, buildRequestBodySchema } from './operationSchemas.js';
import { writeToolName } from '../utils/toolNames.js';
import { toolError } from '../utils/toolResponses.js';
import { annotationsForWriteMethod } from '../utils/toolAnnotations.js';
import {
  getCuratedWriteToolName,
  getGeneratedWriteToolDescription,
} from './generatedToolOverrides.js';
import { GENERATED_WRITE_SKIP_IDS } from './generatedToolSkips.js';

export type WriteToolResponder = (
  result: { data?: unknown; url?: string; status?: number; headers?: Record<string, string>; dryRun?: boolean },
  includeMeta?: boolean,
) => {
  content: { type: 'text'; text: string }[];
  structuredContent: Record<string, unknown>;
};

const WRITE_METHODS = new Set(['post', 'put', 'patch', 'delete']);

export async function registerGeneratedWriteTools(
  server: McpServer,
  options: {
    writeOptionsSchema: z.ZodObject<any>;
    writeOutputSchema: z.ZodTypeAny;
    respond: WriteToolResponder;
  },
): Promise<number> {
  const config = getConfig();
  if (config.generatedWriteTools.disable) return 0;
  const skipOperationIds = new Set(GENERATED_WRITE_SKIP_IDS);

  const index = await getSpecIndex();
  const spec = index.raw as
    | {
        paths?: Record<string, Record<string, unknown>>;
        components?: { schemas?: Record<string, unknown> };
      }
    | null;
  const paths = spec?.paths ?? {};
  const componentsSchemas = spec?.components?.schemas;
  let count = 0;

  for (const pathItem of Object.values(paths)) {
    if (!pathItem || typeof pathItem !== 'object') continue;
    for (const [method, opValue] of Object.entries(pathItem)) {
      if (!WRITE_METHODS.has(method)) continue;
      if (!opValue || typeof opValue !== 'object') continue;
      const op = opValue as { operationId?: unknown; summary?: unknown; description?: unknown };
      const operationId = typeof op.operationId === 'string' ? op.operationId : undefined;
      if (!operationId) continue;
      if (skipOperationIds.has(operationId)) continue;
      const toolName = writeToolName(operationId);
      const summary =
        (typeof op.summary === 'string' ? op.summary : undefined) ??
        (typeof op.description === 'string' ? op.description : undefined) ??
        '';
      const summaryLine = String(summary).split('\n')[0].trim();
      const curated = getCuratedWriteToolName(operationId);
      const override = getGeneratedWriteToolDescription(operationId);
      const fallback = summaryLine
        ? `Auto-generated write tool. ${summaryLine}`
        : `Auto-generated write tool for ${operationId}.`;
      const description =
        override ?? (curated ? `${fallback} Prefer curated tool: ${curated}.` : `${fallback} Prefer curated tools when available.`);

      const opDef = index.operations.get(operationId);
      const paramsInfo = buildParamsSchema(opDef?.parameters ?? [], componentsSchemas);
      const bodyInfo = buildRequestBodySchema(opDef, componentsSchemas);
      const shape: Record<string, z.ZodTypeAny> = {};
      if (paramsInfo.schema) {
        shape.params = paramsInfo.required
          ? paramsInfo.schema
          : paramsInfo.schema.optional();
      }
      if (bodyInfo.schema) {
        shape.body = bodyInfo.required ? bodyInfo.schema : bodyInfo.schema.optional();
      }
      const inputSchema = z
        .object(shape)
        .merge(options.writeOptionsSchema)
        .passthrough();

      server.registerTool(
        toolName,
        {
          description,
          inputSchema,
          outputSchema: options.writeOutputSchema,
          annotations: annotationsForWriteMethod(method),
        },
        async (args: unknown) => {
          try {
            const input = (args ?? {}) as {
              params?: Record<string, unknown>;
              body?: unknown;
              options?: { dryRun?: boolean; rawResponse?: boolean };
              includeMeta?: boolean;
            };
            const { params = {}, body, options: callOptions, includeMeta } = input;
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
        },
      );
      count += 1;
    }
  }

  return count;
}
