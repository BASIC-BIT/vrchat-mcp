import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { PagingSchema, ReadOptionsSchema } from '../../schemas/read.js';
import { registerReadTool, splitReadArgsWithNumber } from './common.js';

export function registerFavoriteReadTools(server: McpServer): void {
  registerReadTool({
    server,
    name: 'vrchat.favorites.list',
    description: 'List favorites (read-only).',
    operationId: 'getFavorites',
    inputSchema: ReadOptionsSchema.extend({
      ...PagingSchema,
      type: z.string().optional(),
      tag: z.string().optional(),
    }),
    buildParams: splitReadArgsWithNumber,
  });

  registerReadTool({
    server,
    name: 'vrchat.favorite_groups.list',
    description: 'List favorite groups (read-only).',
    operationId: 'getFavoriteGroups',
    inputSchema: ReadOptionsSchema.extend({
      ...PagingSchema,
      userId: z.string().optional(),
      ownerId: z.string().optional(),
    }),
    buildParams: splitReadArgsWithNumber,
  });

  registerReadTool({
    server,
    name: 'vrchat.favorites.limits',
    description: 'Get favorite limits (read-only).',
    operationId: 'getFavoriteLimits',
    inputSchema: ReadOptionsSchema,
  });
}
