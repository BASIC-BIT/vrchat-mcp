import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { z } from 'zod';
vi.mock('../../src/core/spec.js', () => {
  return {
    getSpecIndex: () =>
      Promise.resolve({
      raw: {
        paths: {
          '/config': { get: { operationId: 'getConfig', summary: 'Get Config' } },
          '/widgets': { get: { operationId: 'getWidget', summary: 'Get Widget' } },
          '/me': { post: { operationId: 'updateUser', summary: 'Update User' } },
        },
      },
      operations: new Map([
        [
          'getConfig',
          { operationId: 'getConfig', method: 'GET', path: '/config', parameters: [], hasRequestBody: false },
        ],
        [
          'getWidget',
          { operationId: 'getWidget', method: 'GET', path: '/widgets', parameters: [], hasRequestBody: false },
        ],
        [
          'updateUser',
          { operationId: 'updateUser', method: 'POST', path: '/me', parameters: [], hasRequestBody: true },
        ],
      ]),
    }),
  };
});
vi.mock('../../src/core/readTools.js', () => ({
  callReadOperation: vi.fn(),
}));

describe('read tool registry', () => {
  const prevDisable = process.env.VRCHAT_MCP_DISABLE_GENERATED_READ_TOOLS;
  const prevSkip = process.env.VRCHAT_MCP_GENERATED_READ_TOOL_SKIP;

  beforeEach(() => {
    delete process.env.VRCHAT_MCP_DISABLE_GENERATED_READ_TOOLS;
    delete process.env.VRCHAT_MCP_GENERATED_READ_TOOL_SKIP;
    vi.resetModules();
  });

  afterEach(() => {
    if (prevDisable === undefined) {
      delete process.env.VRCHAT_MCP_DISABLE_GENERATED_READ_TOOLS;
    } else {
      process.env.VRCHAT_MCP_DISABLE_GENERATED_READ_TOOLS = prevDisable;
    }
    if (prevSkip === undefined) {
      delete process.env.VRCHAT_MCP_GENERATED_READ_TOOL_SKIP;
    } else {
      process.env.VRCHAT_MCP_GENERATED_READ_TOOL_SKIP = prevSkip;
    }
  });

  it('skips tools in skip list and only registers GET', async () => {
    process.env.VRCHAT_MCP_GENERATED_READ_TOOL_SKIP = 'getConfig';
    const { registerGeneratedReadTools } = await import('../../src/core/readToolRegistry.js');

    const registered: string[] = [];
    const server = {
      registerTool: (name: string) => {
        registered.push(name);
      },
    };

    const count = await registerGeneratedReadTools(server as never, {
      readOptionsSchema: z.object({}),
      readOutputSchema: z.object({}),
      respond: () => ({ content: [], structuredContent: {} }),
    });

    expect(count).toBe(1);
    expect(registered).toEqual(['vrchat_read_getWidget']);
  });

  it('can be disabled entirely', async () => {
    process.env.VRCHAT_MCP_DISABLE_GENERATED_READ_TOOLS = 'true';
    const { registerGeneratedReadTools } = await import('../../src/core/readToolRegistry.js');
    const server = { registerTool: vi.fn() };

    const count = await registerGeneratedReadTools(server as never, {
      readOptionsSchema: z.object({}),
      readOutputSchema: z.object({}),
      respond: () => ({ content: [], structuredContent: {} }),
    });

    expect(count).toBe(0);
    expect(server.registerTool).not.toHaveBeenCalled();
  });

  it('returns toolError when read operation throws', async () => {
    const { registerGeneratedReadTools } = await import('../../src/core/readToolRegistry.js');
    const { callReadOperation } = await import('../../src/core/readTools.js');
    vi.mocked(callReadOperation).mockRejectedValueOnce(new Error('boom'));

    interface ToolResponse {
      isError?: boolean;
      structuredContent?: { error?: string };
    }
    const handlers: Record<string, (args: unknown) => Promise<ToolResponse>> = {};
    const server = {
      registerTool: (name: string, _meta: unknown, handler: (args: unknown) => Promise<any>) => {
        handlers[name] = handler;
      },
    };

    await registerGeneratedReadTools(server as never, {
      readOptionsSchema: z.object({}),
      readOutputSchema: z.object({}),
      respond: () => ({ content: [], structuredContent: {} }),
    });

    const response = await handlers.vrchat_read_getWidget?.({ params: {} });
    expect(callReadOperation).toHaveBeenCalledWith(
      'getWidget',
      {},
      expect.objectContaining({ includeMeta: undefined }),
    );
    expect(response?.isError).toBe(true);
    expect(response?.structuredContent?.error).toBe('boom');
  });
});
