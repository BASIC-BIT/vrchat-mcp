import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerGeneratedReadTools } from '../core/readToolRegistry.js';
import { registerGeneratedWriteTools } from '../core/writeToolRegistry.js';
import { ReadOptionsSchema, ReadToolOutputSchema } from '../schemas/read.js';
import { WriteOptionsSchema, WriteToolOutputSchema } from '../schemas/write.js';
import { readToolResponse } from './read/common.js';
import { writeToolResponse } from './write/common.js';

export async function registerGeneratedTools(server: McpServer): Promise<void> {
  await registerGeneratedReadTools(server, {
    readOptionsSchema: ReadOptionsSchema,
    readOutputSchema: ReadToolOutputSchema,
    respond: readToolResponse,
  });
  await registerGeneratedWriteTools(server, {
    writeOptionsSchema: WriteOptionsSchema,
    writeOutputSchema: WriteToolOutputSchema,
    respond: writeToolResponse,
  });
}
