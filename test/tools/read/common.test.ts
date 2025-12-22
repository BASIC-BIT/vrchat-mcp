import { describe, it, expect, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { FakeServer } from '../../helpers/fake-server.js';

vi.mock('../../../src/core/readTools.js', () => {
  return {
    callReadOperation: vi.fn().mockResolvedValue({ data: { ok: true }, url: 'http://local' }),
  };
});

import {
  registerReadTool,
  readToolResponse,
  splitReadArgs,
  splitReadArgsWithNumber,
} from '../../../src/tools/read/common.js';
import { callReadOperation } from '../../../src/core/readTools.js';

describe('read tool helpers', () => {
  it('splits read args and preserves params', () => {
    const result = splitReadArgs({ fields: ['id'], compact: true, foo: 'bar' });
    expect(result.params).toEqual({ foo: 'bar' });
    expect(result.options.fields).toEqual(['id']);
    expect(result.options.compact).toBe(true);
  });

  it('maps number to n in pagination helper', () => {
    const result = splitReadArgsWithNumber({ number: 5, offset: 2 });
    expect(result.params).toEqual({ offset: 2, n: 5 });
  });

  it('registers a read tool and calls the operation', async () => {
    const server = new FakeServer();
    registerReadTool({
      server: server as unknown as McpServer,
      name: 'vrchat.test.read',
      description: 'Test tool',
      operationId: 'getConfig',
      inputSchema: z.object({}),
    });

    const tool = server.tools.find((entry) => entry.name === 'vrchat_test_read');
    expect(tool).toBeDefined();

    const result = await Promise.resolve(tool!.handler({ includeMeta: true, foo: 'bar' }));
    expect(callReadOperation).toHaveBeenCalledWith('getConfig', { foo: 'bar' }, expect.any(Object));
    expect(result).toEqual(readToolResponse({ data: { ok: true }, url: 'http://local' }, true));
  });
});
