import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { PagingSchema, ReadOptionsSchema } from '../../schemas/read.js';
import { registerReadTool, splitReadArgsWithNumber } from './common.js';

export function registerGroupReadTools(server: McpServer): void {
  registerReadTool({
    server,
    name: 'vrchat.groups.get',
    description: 'Get a group by groupId (read-only).',
    operationId: 'getGroup',
    inputSchema: ReadOptionsSchema.extend({
      groupId: z.string(),
      includeRoles: z.boolean().optional(),
    }),
  });

  registerReadTool({
    server,
    name: 'vrchat.groups.members.list',
    description: 'List group members (read-only).',
    operationId: 'getGroupMembers',
    inputSchema: ReadOptionsSchema.extend({
      ...PagingSchema,
      groupId: z.string(),
      sort: z.string().optional(),
      roleId: z.string().optional(),
    }),
    buildParams: splitReadArgsWithNumber,
  });

  registerReadTool({
    server,
    name: 'vrchat.groups.members.get',
    description: 'Get group member (read-only).',
    operationId: 'getGroupMember',
    inputSchema: ReadOptionsSchema.extend({
      groupId: z.string(),
      userId: z.string(),
    }),
  });

  registerReadTool({
    server,
    name: 'vrchat.groups.roles.list',
    description: 'List group roles (read-only).',
    operationId: 'getGroupRoles',
    inputSchema: ReadOptionsSchema.extend({
      groupId: z.string(),
    }),
  });

  registerReadTool({
    server,
    name: 'vrchat.groups.permissions.list',
    description: 'List group permissions (read-only).',
    operationId: 'getGroupPermissions',
    inputSchema: ReadOptionsSchema.extend({
      groupId: z.string(),
    }),
  });

  registerReadTool({
    server,
    name: 'vrchat.groups.announcements.get',
    description: 'Get group announcement (read-only).',
    operationId: 'getGroupAnnouncements',
    inputSchema: ReadOptionsSchema.extend({
      groupId: z.string(),
    }),
  });

  registerReadTool({
    server,
    name: 'vrchat.groups.posts.list',
    description: 'List group posts (read-only).',
    operationId: 'getGroupPosts',
    inputSchema: ReadOptionsSchema.extend({
      ...PagingSchema,
      groupId: z.string(),
      publicOnly: z.boolean().optional(),
    }),
    buildParams: splitReadArgsWithNumber,
  });

  registerReadTool({
    server,
    name: 'vrchat.groups.instances.list',
    description: 'List group instances (read-only).',
    operationId: 'getGroupInstances',
    inputSchema: ReadOptionsSchema.extend({
      groupId: z.string(),
    }),
  });
}
