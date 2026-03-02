import { describe, it, expect, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakeServer } from '../helpers/fake-server.js';

vi.mock('../../src/core/client.js', async () => {
  const actual = await vi.importActual('../../src/core/client.js');
  return {
    ...actual,
    callOperation: vi.fn(),
  };
});

import { registerRawTools } from '../../src/tools/raw.js';
import { callOperation } from '../../src/core/client.js';

describe('raw tool', () => {
  it('returns structured content from callOperation', async () => {
    vi.mocked(callOperation).mockResolvedValue({ url: 'http://example', status: 200 });
    const server = new FakeServer();
    registerRawTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_call');
    expect(tool).toBeDefined();

    const result = await Promise.resolve(tool!.handler({ operationId: 'getConfig' }));
    expect(result).toMatchObject({
      structuredContent: { url: 'http://example', status: 200 },
    });
  });

  it('reports errors when callOperation throws', async () => {
    vi.mocked(callOperation).mockRejectedValue(new Error('boom'));
    const server = new FakeServer();
    registerRawTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_call');

    const result = await Promise.resolve(tool!.handler({ operationId: 'getConfig' }));
    expect(result).toMatchObject({ isError: true });
  });

  it('blocks deprecated group announcement operationIds', async () => {
    const server = new FakeServer();
    registerRawTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_call');
    const beforeCallCount = vi.mocked(callOperation).mock.calls.length;

    const result = await Promise.resolve(tool!.handler({ operationId: 'getGroupAnnouncements' }));
    expect(result).toMatchObject({ isError: true });
    expect(vi.mocked(callOperation).mock.calls.length).toBe(beforeCallCount);
  });
});
