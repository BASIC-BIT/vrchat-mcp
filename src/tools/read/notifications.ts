import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { PagingSchema, ReadOptionsSchema } from '../../schemas/read.js';
import { registerReadTool, splitReadArgsWithNumber } from './common.js';

export function registerNotificationReadTools(server: McpServer): void {
  registerReadTool({
    server,
    name: 'vrchat.notifications.list',
    description: 'List notifications (read-only).',
    operationId: 'getNotifications',
    inputSchema: ReadOptionsSchema.extend({
      ...PagingSchema,
      type: z.string().optional(),
      sent: z.boolean().optional(),
      hidden: z.boolean().optional(),
      after: z.string().optional(),
    }),
    buildParams: splitReadArgsWithNumber,
  });

  registerReadTool({
    server,
    name: 'vrchat.notifications.get',
    description: 'Get a notification by notificationId (read-only).',
    operationId: 'getNotification',
    inputSchema: ReadOptionsSchema.extend({
      notificationId: z.string(),
    }),
  });
}
