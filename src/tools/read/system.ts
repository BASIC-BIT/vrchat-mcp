import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ReadOptionsSchema } from '../../schemas/read.js';
import { registerReadTool } from './common.js';

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
}
