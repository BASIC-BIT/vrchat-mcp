import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ReadOptionsSchema } from '../../schemas/read.js';
import { registerReadTool } from './common.js';

export function registerInviteMessageReadTools(server: McpServer): void {
  registerReadTool({
    server,
    name: 'vrchat.invite_messages.list',
    description: 'List invite messages (read-only).',
    operationId: 'getInviteMessages',
    inputSchema: ReadOptionsSchema.extend({
      userId: z.string(),
      messageType: z.string(),
    }),
  });

  registerReadTool({
    server,
    name: 'vrchat.invite_messages.get',
    description: 'Get an invite message slot (read-only).',
    operationId: 'getInviteMessage',
    inputSchema: ReadOptionsSchema.extend({
      userId: z.string(),
      messageType: z.string(),
      slot: z.number().int(),
    }),
  });
}
