import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerVrcxStatusTool } from './status.js';
import { registerVrcxMemoTools } from './memos.js';
import { registerVrcxGamelogTools } from './gamelog.js';
import { registerVrcxRelationshipTools } from './relationships.js';

export function registerCuratedVrcxTools(server: McpServer): void {
  registerVrcxStatusTool(server);
  registerVrcxMemoTools(server);
  registerVrcxGamelogTools(server);
  registerVrcxRelationshipTools(server);
}
