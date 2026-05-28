import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  generatedToolStatusValues,
  listGeneratedOperations,
} from '../../core/generatedOperations.js';
import { getOperationDetails } from '../../core/operationDetails.js';
import { ReadOptionsSchema } from '../../schemas/read.js';
import { readOnlyToolAnnotations } from '../../utils/toolAnnotations.js';
import { toolName } from '../../utils/toolNames.js';
import { textContent, toolError } from '../../utils/toolResponses.js';
import { registerReadTool } from './common.js';

const OperationDetailsInputSchema = z.object({
  operationId: z.string().describe('VRChat OpenAPI operationId.'),
});

const OperationsInputSchema = z.object({
  kind: z.enum(['read', 'write', 'delete']).describe('Operation kind.').optional(),
  view: z.enum(['available', 'all']).describe('Show available generated ops or all ops.').optional(),
  query: z.string().describe('Filter operationId, path, summary, or description.').optional(),
  limit: z.number().int().min(1).max(500).describe('Max operations.').optional(),
});

const OperationSummarySchema = z.object({
  operationId: z.string(),
  kind: z.enum(['read', 'write', 'delete']),
  method: z.string(),
  path: z.string(),
  summary: z.string().optional(),
  description: z.string().optional(),
  generatedToolStatus: z.enum(generatedToolStatusValues),
  generatedToolName: z.string().optional(),
  curatedToolName: z.string().optional(),
  blockedReason: z.string().optional(),
});

const OperationsOutputSchema = z.object({
  total: z.number().int().min(0),
  truncated: z.boolean(),
  operations: z.array(OperationSummarySchema),
});

const OperationDetailsOutputSchema = z.object({
  operationId: z.string(),
  method: z.string(),
  path: z.string(),
  summary: z.string().optional(),
  description: z.string().optional(),
  generatedToolStatus: z.enum(generatedToolStatusValues),
  generatedToolName: z.string().optional(),
  curatedToolName: z.string().optional(),
  blockedReason: z.string().optional(),
  parameters: z.array(
    z.object({
      name: z.string(),
      in: z.enum(['path', 'query', 'header', 'cookie']),
      required: z.boolean(),
      description: z.string().optional(),
      schemaRef: z.string().optional(),
      schema: z.unknown().optional(),
    })
  ),
  requestBody: z
    .object({
      required: z.boolean(),
      description: z.string().optional(),
      contentTypes: z.array(z.string()).optional(),
      schemaRef: z.string().optional(),
      schema: z.unknown().optional(),
    })
    .optional(),
});

export function registerSystemReadTools(server: McpServer): void {
  registerReadTool({
    server,
    name: 'vrchat.config.get',
    description: 'Fetch API config (read-only).',
    operationId: 'getConfig',
    inputSchema: ReadOptionsSchema,
  });

  registerReadTool({
    server,
    name: 'vrchat.system.time',
    description: 'Get current system time (read-only).',
    operationId: 'getSystemTime',
    inputSchema: ReadOptionsSchema,
  });

  server.registerTool(
    toolName('vrchat.operations'),
    {
      description:
        'List VRChat OpenAPI operationIds and generated-tool availability for vrchat_read/vrchat_write/vrchat_delete.',
      inputSchema: OperationsInputSchema,
      outputSchema: OperationsOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const input = OperationsInputSchema.parse(args ?? {});
        const result = await listGeneratedOperations(input);
        return {
          content: textContent(JSON.stringify(result, null, 2)),
          structuredContent: result as unknown as Record<string, unknown>,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    }
  );

  server.registerTool(
    toolName('vrchat.operation_details'),
    {
      description: 'Look up exact OpenAPI params and request body schema for a VRChat operationId.',
      inputSchema: OperationDetailsInputSchema,
      outputSchema: OperationDetailsOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const { operationId } = OperationDetailsInputSchema.parse(args ?? {});
        const details = await getOperationDetails(operationId);
        return {
          content: textContent(JSON.stringify(details, null, 2)),
          structuredContent: details as unknown as Record<string, unknown>,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    }
  );
}
