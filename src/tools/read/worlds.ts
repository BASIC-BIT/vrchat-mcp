import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { PagingSchema, ReadOptionsSchema, WorldCommonQuerySchema } from '../../schemas/read.js';
import { registerReadTool, splitReadArgsWithNumber } from './common.js';

export function registerWorldReadTools(server: McpServer): void {
  registerReadTool({
    server,
    name: 'vrchat.worlds.get',
    description: 'Get a world by worldId (read-only).',
    operationId: 'getWorld',
    inputSchema: ReadOptionsSchema.extend({
      worldId: z.string(),
    }),
  });

  registerReadTool({
    server,
    name: 'vrchat.worlds.active',
    description: 'List active worlds (read-only).',
    operationId: 'getActiveWorlds',
    inputSchema: ReadOptionsSchema.extend({
      ...PagingSchema,
      ...WorldCommonQuerySchema,
      noplatform: z.string().optional(),
    }),
    buildParams: splitReadArgsWithNumber,
  });

  registerReadTool({
    server,
    name: 'vrchat.worlds.recent',
    description: 'List recent worlds (read-only).',
    operationId: 'getRecentWorlds',
    inputSchema: ReadOptionsSchema.extend({
      ...PagingSchema,
      ...WorldCommonQuerySchema,
      userId: z.string().optional(),
    }),
    buildParams: splitReadArgsWithNumber,
  });
}
