import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { PagingSchema, ReadOptionsSchema } from '../../schemas/read.js';
import { registerReadTool, splitReadArgsWithNumber } from './common.js';

export function registerFriendReadTools(server: McpServer): void {
  registerReadTool({
    server,
    name: 'vrchat.friends.list',
    description: 'List friends (read-only).',
    operationId: 'getFriends',
    inputSchema: ReadOptionsSchema.extend({
      ...PagingSchema,
      offline: z.boolean().optional(),
    }),
    buildParams: splitReadArgsWithNumber,
  });

  registerReadTool({
    server,
    name: 'vrchat.friends.status',
    description: 'Check friend status for a user (read-only).',
    operationId: 'getFriendStatus',
    inputSchema: ReadOptionsSchema.extend({
      userId: z.string(),
    }),
  });
}
