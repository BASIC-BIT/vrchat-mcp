import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { AvatarCommonQuerySchema, PagingSchema, ReadOptionsSchema } from '../../schemas/read.js';
import { registerReadTool, splitReadArgsWithNumber } from './common.js';

export function registerAvatarReadTools(server: McpServer): void {
  registerReadTool({
    server,
    name: 'vrchat.avatars.get',
    description: 'Get an avatar by avatarId (read-only).',
    operationId: 'getAvatar',
    inputSchema: ReadOptionsSchema.extend({
      avatarId: z.string(),
    }),
  });

  registerReadTool({
    server,
    name: 'vrchat.avatars.search',
    description: 'Search avatars (read-only).',
    operationId: 'searchAvatars',
    inputSchema: ReadOptionsSchema.extend({
      ...PagingSchema,
      ...AvatarCommonQuerySchema,
      user: z.string().optional(),
      userId: z.string().optional(),
    }),
    buildParams: splitReadArgsWithNumber,
  });

  registerReadTool({
    server,
    name: 'vrchat.avatars.favorites',
    description: 'List favorited avatars (read-only).',
    operationId: 'getFavoritedAvatars',
    inputSchema: ReadOptionsSchema.extend({
      ...PagingSchema,
      ...AvatarCommonQuerySchema,
      search: z.string().optional(),
      userId: z.string().optional(),
    }),
    buildParams: splitReadArgsWithNumber,
  });
}
