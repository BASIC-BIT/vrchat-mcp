import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { PagingSchema, ReadOptionsSchema } from '../../schemas/read.js';
import { registerReadTool, splitReadArgsWithNumber } from './common.js';

export function registerUserReadTools(server: McpServer): void {
  registerReadTool({
    server,
    name: 'vrchat.me',
    description: 'Get the current user profile (read-only).',
    operationId: 'getCurrentUser',
    inputSchema: ReadOptionsSchema,
  });

  registerReadTool({
    server,
    name: 'vrchat.users.get',
    description: 'Get a user by userId (read-only).',
    operationId: 'getUser',
    inputSchema: ReadOptionsSchema.extend({
      userId: z.string(),
    }),
  });

  registerReadTool({
    server,
    name: 'vrchat.users.getByName',
    description: 'Get a user by username (read-only).',
    operationId: 'getUserByName',
    inputSchema: ReadOptionsSchema.extend({
      username: z.string(),
    }),
  });

  registerReadTool({
    server,
    name: 'vrchat.users.search',
    description: 'Search users by display name (read-only).',
    operationId: 'searchUsers',
    inputSchema: ReadOptionsSchema.extend({
      ...PagingSchema,
      search: z.string(),
      developerType: z.string().optional(),
    }),
    buildParams: splitReadArgsWithNumber,
  });

  registerReadTool({
    server,
    name: 'vrchat.users.groups.list',
    description: 'List user groups (read-only).',
    operationId: 'getUserGroups',
    inputSchema: ReadOptionsSchema.extend({
      userId: z.string(),
    }),
  });

  registerReadTool({
    server,
    name: 'vrchat.users.groups.requests',
    description: 'List user group requests (read-only).',
    operationId: 'getUserGroupRequests',
    inputSchema: ReadOptionsSchema.extend({
      userId: z.string(),
    }),
  });

  registerReadTool({
    server,
    name: 'vrchat.users.groups.represented',
    description: 'Get user represented group (read-only).',
    operationId: 'getUserRepresentedGroup',
    inputSchema: ReadOptionsSchema.extend({
      userId: z.string(),
    }),
  });
}
