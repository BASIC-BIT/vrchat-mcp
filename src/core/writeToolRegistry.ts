import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getConfig } from '../config/index.js';
import { getSpecIndex } from './spec.js';
import { callOperation, CallError } from './client.js';
import { buildParamsSchema, buildRequestBodySchema } from './operationSchemas.js';
import { writeToolName } from '../utils/toolNames.js';
import { toolError } from '../utils/toolResponses.js';
import { annotationsForWriteMethod } from '../utils/toolAnnotations.js';
import { getCuratedWriteToolName } from './generatedToolOverrides.js';
import { buildGeneratedToolDescription } from './generatedToolDescriptions.js';
import { GENERATED_WRITE_SKIP_IDS } from './generatedToolSkips.js';

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

const WRITE_METHODS = new Set(['post', 'put', 'patch', 'delete']);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function getWriteOperationInfo(
  method: string,
  opValue: unknown,
  skipOperationIds: Set<string>
): { operationId: string; op: { summary?: unknown; description?: unknown } } | null {
  if (!WRITE_METHODS.has(method)) return null;
  if (!isPlainObject(opValue)) return null;
  const op = opValue as { operationId?: unknown; summary?: unknown; description?: unknown };
  const operationId = typeof op.operationId === 'string' ? op.operationId : undefined;
  if (!operationId) return null;
  if (skipOperationIds.has(operationId)) return null;
  return { operationId, op };
}

function buildGeneratedWriteToolInputSchema(input: {
  operationId: string;
  index: Awaited<ReturnType<typeof getSpecIndex>>;
  componentsSchemas: Record<string, unknown> | undefined;
  writeOptionsSchema: z.ZodObject<any>;
}): z.ZodTypeAny {
  const opDef = input.index.operations.get(input.operationId);
  const paramsInfo = buildParamsSchema(opDef?.parameters ?? [], input.componentsSchemas);
  const bodyInfo = buildRequestBodySchema(opDef, input.componentsSchemas);

  const shape: Record<string, z.ZodTypeAny> = {};
  if (paramsInfo.schema) {
    shape.params = paramsInfo.required ? paramsInfo.schema : paramsInfo.schema.optional();
  }
  if (bodyInfo.schema) {
    shape.body = bodyInfo.required ? bodyInfo.schema : bodyInfo.schema.optional();
  }
  return z.object(shape).merge(input.writeOptionsSchema).passthrough();
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
  const skipOperationIds = new Set(GENERATED_WRITE_SKIP_IDS);
  const allowedOperationIds = new Set(config.generatedWriteTools.operationIds);
  const hasAllowlist = allowedOperationIds.size > 0;

  const index = await getSpecIndex();
  const spec = index.raw as {
    paths?: Record<string, Record<string, unknown>>;
    components?: { schemas?: Record<string, unknown> };
  } | null;
  const paths = spec?.paths ?? {};
  const componentsSchemas = spec?.components?.schemas;
  let count = 0;

  for (const pathItem of Object.values(paths)) {
    if (!isPlainObject(pathItem)) continue;
    for (const [method, opValue] of Object.entries(pathItem)) {
      const info = getWriteOperationInfo(method, opValue, skipOperationIds);
      if (!info) continue;
      const { operationId, op } = info;
      if (getCuratedWriteToolName(operationId)) continue;
      if (hasAllowlist && !allowedOperationIds.has(operationId)) continue;
      const toolName = writeToolName(operationId);
      const description = buildGeneratedToolDescription('write', operationId, op);
      const inputSchema = buildGeneratedWriteToolInputSchema({
        operationId,
        index,
        componentsSchemas,
        writeOptionsSchema: options.writeOptionsSchema,
      });

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
        }
      );
      count += 1;
    }
  }

  return count;
}
