import { describe, it, expect, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakeServer } from '../helpers/fake-server.js';

vi.mock('../../src/core/readToolRegistry.js', () => ({
  registerGeneratedReadTools: vi.fn().mockResolvedValue(2),
}));
vi.mock('../../src/core/writeToolRegistry.js', () => ({
  registerGeneratedWriteTools: vi.fn().mockResolvedValue(1),
}));

import { registerGeneratedTools } from '../../src/tools/generated.js';
import { registerGeneratedReadTools } from '../../src/core/readToolRegistry.js';
import { registerGeneratedWriteTools } from '../../src/core/writeToolRegistry.js';
import { ReadOptionsSchema, ReadToolOutputSchema } from '../../src/schemas/read.js';
import { WriteOptionsSchema, WriteToolOutputSchema } from '../../src/schemas/write.js';
import { readToolResponse } from '../../src/tools/read/common.js';
import { writeToolResponse } from '../../src/tools/write/common.js';

describe('generated tools registration', () => {
  it('wires generated read and write tools with schemas', async () => {
    const server = new FakeServer();
    await registerGeneratedTools(server as unknown as McpServer);

    expect(registerGeneratedReadTools).toHaveBeenCalledTimes(1);
    const args = vi.mocked(registerGeneratedReadTools).mock.calls[0][1];
    expect(args.readOptionsSchema).toBe(ReadOptionsSchema);
    expect(args.readOutputSchema).toBe(ReadToolOutputSchema);
    expect(args.respond).toBe(readToolResponse);

    expect(registerGeneratedWriteTools).toHaveBeenCalledTimes(1);
    const writeArgs = vi.mocked(registerGeneratedWriteTools).mock.calls[0][1];
    expect(writeArgs.writeOptionsSchema).toBe(WriteOptionsSchema);
    expect(writeArgs.writeOutputSchema).toBe(WriteToolOutputSchema);
    expect(writeArgs.respond).toBe(writeToolResponse);
  });
});
