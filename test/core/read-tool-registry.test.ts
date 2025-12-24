import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { z } from 'zod';
const mockConfig = {
  generatedReadTools: { disable: false },
  logging: { level: 'info' },
};

vi.mock('../../src/core/generatedToolSkips.js', () => ({
  GENERATED_READ_SKIP_IDS: ['getConfig'],
}));

vi.mock('../../src/config/index.js', () => ({
  getConfig: () => mockConfig,
}));
vi.mock('../../src/core/client.js', () => {
  class CallError extends Error {
    payload?: Record<string, unknown>;
  }
  return { CallError };
});

vi.mock('../../src/core/spec.js', () => {
  return {
    getSpecIndex: () =>
      Promise.resolve({
      raw: {
        paths: {
          '/config': { get: { operationId: 'getConfig', summary: 'Get Config' } },
          '/widgets': { get: { operationId: 'getWidget', summary: 'Get Widget' } },
          '/users/{userId}': {
            get: { operationId: 'getUser', summary: 'Get User' },
          },
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
          'getUser',
          {
            operationId: 'getUser',
            method: 'GET',
            path: '/users/{userId}',
            parameters: [
              {
                name: 'userId',
                in: 'path',
                required: true,
                schema: { type: 'string' },
              },
            ],
            hasRequestBody: false,
          },
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
  beforeEach(() => {
    mockConfig.generatedReadTools = { disable: false };
    vi.resetModules();
  });

  afterEach(() => {
    mockConfig.generatedReadTools = { disable: false };
  });

  it('skips tools in skip list and only registers GET', async () => {
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

    expect(count).toBe(2);
    expect(registered).toEqual(['vrchat_read_getWidget', 'vrchat_read_getUser']);
  });

  it('marks required params as required in the schema', async () => {
    const { registerGeneratedReadTools } = await import('../../src/core/readToolRegistry.js');
    const metas: Record<string, { inputSchema: { safeParse: (value: unknown) => { success: boolean } } }> = {};
    const server = {
      registerTool: (name: string, meta: { inputSchema: { safeParse: (value: unknown) => { success: boolean } } }) => {
        metas[name] = meta;
      },
    };

    await registerGeneratedReadTools(server as never, {
      readOptionsSchema: z.object({}),
      readOutputSchema: z.object({}),
      respond: () => ({ content: [], structuredContent: {} }),
    });

    const schema = metas.vrchat_read_getUser?.inputSchema;
    expect(schema).toBeDefined();
    expect(schema?.safeParse({}).success).toBe(false);
    expect(schema?.safeParse({ params: { userId: 'usr_123' } }).success).toBe(true);
  });

  it('can be disabled entirely', async () => {
    mockConfig.generatedReadTools = { disable: true };
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
