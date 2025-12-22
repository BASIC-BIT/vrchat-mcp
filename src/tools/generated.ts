import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerGeneratedReadTools } from '../core/readToolRegistry.js';
import { ReadOptionsSchema, ReadToolOutputSchema } from '../schemas/read.js';
import { readToolResponse } from './read/common.js';

export async function registerGeneratedTools(server: McpServer): Promise<void> {
  await registerGeneratedReadTools(server, {
    readOptionsSchema: ReadOptionsSchema,
    readOutputSchema: ReadToolOutputSchema,
    respond: readToolResponse,
  });
}
