import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getOperationDetails } from '../../core/operationDetails.js';
import { ReadOptionsSchema } from '../../schemas/read.js';
import { readOnlyToolAnnotations } from '../../utils/toolAnnotations.js';
import { toolName } from '../../utils/toolNames.js';
import { textContent, toolError } from '../../utils/toolResponses.js';
import { registerReadTool } from './common.js';

const OperationDetailsInputSchema = z.object({
  operationId: z.string().describe('VRChat OpenAPI operationId.'),
});

const OperationDetailsOutputSchema = z.object({
  operationId: z.string(),
  method: z.string(),
  path: z.string(),
  summary: z.string().optional(),
  description: z.string().optional(),
  generatedToolStatus: z.enum([
    'available',
    'blocked_by_policy',
    'curated_replacement',
    'hard_skipped',
    'disabled_by_config',
    'not_allowlisted',
  ]),
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
