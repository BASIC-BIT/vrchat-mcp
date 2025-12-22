import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ZodTypeAny } from 'zod';
import { callReadOperation } from '../../core/readTools.js';
import { ReadToolOutputSchema } from '../../schemas/read.js';
import { toolName } from '../../utils/toolNames.js';
import { textContent, toolError } from '../../utils/toolResponses.js';

export interface ReadToolOptions {
  fields?: string[];
  compact?: boolean;
  maxArrayLength?: number;
  includeMeta?: boolean;
  page?: {
    enabled?: boolean;
    size?: number;
    maxPages?: number;
    maxItems?: number;
    offset?: number;
  };
}

export function splitReadArgs(args: unknown): {
  params: Record<string, unknown>;
  options: ReadToolOptions;
  includeMeta?: boolean;
} {
  const input = (args ?? {}) as Record<string, unknown>;
  const { fields, compact, maxArrayLength, includeMeta, page, ...params } = input;
  const options: ReadToolOptions = {
    fields: fields as string[] | undefined,
    compact: compact as boolean | undefined,
    maxArrayLength: maxArrayLength as number | undefined,
    includeMeta: includeMeta as boolean | undefined,
    page: page as ReadToolOptions['page'] | undefined,
  };
  return {
    params: params as Record<string, unknown>,
    options,
    includeMeta: options.includeMeta,
  };
}

export function splitReadArgsWithNumber(args: unknown): {
  params: Record<string, unknown>;
  options: ReadToolOptions;
  includeMeta?: boolean;
} {
  const { number, n, ...rest } = (args ?? {}) as Record<string, unknown>;
  const { params, options, includeMeta } = splitReadArgs(rest);
  if (n !== undefined) params.n = n;
  if (params.n === undefined && number !== undefined) params.n = number;
  return { params, options, includeMeta };
}

export function readToolResponse(result: { data: unknown; url?: string }, includeMeta?: boolean) {
  const text = JSON.stringify(includeMeta ? result : result.data, null, 2);
  return {
    content: textContent(text),
    structuredContent: result as unknown as Record<string, unknown>,
  };
}

export function registerReadTool(options: {
  server: McpServer;
  name: string;
  description: string;
  operationId: string;
  inputSchema: ZodTypeAny;
  buildParams?: (args: unknown) => {
    params: Record<string, unknown>;
    options: ReadToolOptions;
    includeMeta?: boolean;
  };
}): void {
  const { server, name, description, operationId, inputSchema, buildParams } = options;
  const builder = buildParams ?? splitReadArgs;
  server.registerTool(
    toolName(name),
    {
      description,
      inputSchema,
      outputSchema: ReadToolOutputSchema,
    },
    async (args) => {
      try {
        const { params, options: readOptions, includeMeta } = builder(args ?? {});
        const result = await callReadOperation(operationId, params, readOptions);
        return readToolResponse(result, includeMeta);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    }
  );
}
