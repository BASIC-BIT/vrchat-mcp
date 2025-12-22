import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { PagingSchema, ReadOptionsSchema } from '../../schemas/read.js';
import { registerReadTool, splitReadArgsWithNumber } from './common.js';

export function registerInstanceReadTools(server: McpServer): void {
  registerReadTool({
    server,
    name: 'vrchat.instances.get',
    description: 'Get an instance by worldId and instanceId (read-only).',
    operationId: 'getInstance',
    inputSchema: ReadOptionsSchema.extend({
      worldId: z.string(),
      instanceId: z.string(),
    }),
  });

  registerReadTool({
    server,
    name: 'vrchat.instances.getByShortName',
    description: 'Get instance by short name (read-only).',
    operationId: 'getInstanceByShortName',
    inputSchema: ReadOptionsSchema.extend({
      shortName: z.string(),
    }),
  });

  registerReadTool({
    server,
    name: 'vrchat.instances.recent',
    description: 'List recent instance locations (read-only).',
    operationId: 'getRecentLocations',
    inputSchema: ReadOptionsSchema.extend({
      ...PagingSchema,
    }),
    buildParams: splitReadArgsWithNumber,
  });
}
