import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { z } from 'zod';

const mockConfig = {
  generatedWriteTools: { disable: false },
  logging: { level: 'info' },
};

vi.mock('../../src/core/generatedToolSkips.js', () => ({
  GENERATED_WRITE_SKIP_IDS: ['updateUser'],
}));

vi.mock('../../src/config/index.js', () => ({
  getConfig: () => mockConfig,
}));

vi.mock('../../src/core/spec.js', () => {
  return {
    getSpecIndex: () =>
      Promise.resolve({
        raw: {
          paths: {
            '/config': { get: { operationId: 'getConfig', summary: 'Get Config' } },
            '/widgets': {
              post: { operationId: 'createWidget', summary: 'Create Widget' },
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
            'createWidget',
            {
              operationId: 'createWidget',
              method: 'POST',
              path: '/widgets',
              parameters: [],
              hasRequestBody: true,
              requestBodySchema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                },
                required: ['name'],
              },
              requestBodyRequired: true,
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

vi.mock('../../src/core/client.js', () => {
  class CallError extends Error {
    payload?: Record<string, unknown>;
  }
  return {
    CallError,
    callOperation: vi.fn(),
  };
});

describe('write tool registry', () => {
  beforeEach(() => {
    mockConfig.generatedWriteTools = { disable: false };
    vi.resetModules();
  });

  afterEach(() => {
    mockConfig.generatedWriteTools = { disable: false };
  });

  it('skips tools in skip list and only registers non-GET', async () => {
    const { registerGeneratedWriteTools } = await import('../../src/core/writeToolRegistry.js');

    const registered: string[] = [];
    const server = {
      registerTool: (name: string) => {
        registered.push(name);
      },
    };

    const count = await registerGeneratedWriteTools(server as never, {
      writeOptionsSchema: z.object({}),
      writeOutputSchema: z.object({}),
      respond: () => ({ content: [], structuredContent: {} }),
    });

    expect(count).toBe(1);
    expect(registered).toEqual(['vrchat_write_createWidget']);
  });

  it('can be disabled entirely', async () => {
    mockConfig.generatedWriteTools = { disable: true };
    const { registerGeneratedWriteTools } = await import('../../src/core/writeToolRegistry.js');
    const server = { registerTool: vi.fn() };

    const count = await registerGeneratedWriteTools(server as never, {
      writeOptionsSchema: z.object({}),
      writeOutputSchema: z.object({}),
      respond: () => ({ content: [], structuredContent: {} }),
    });

    expect(count).toBe(0);
    expect(server.registerTool).not.toHaveBeenCalled();
  });

  it('returns toolError when write operation throws', async () => {
    const { registerGeneratedWriteTools } = await import('../../src/core/writeToolRegistry.js');
    const { callOperation } = await import('../../src/core/client.js');
    vi.mocked(callOperation).mockRejectedValueOnce(new Error('boom'));

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

    await registerGeneratedWriteTools(server as never, {
      writeOptionsSchema: z.object({}),
      writeOutputSchema: z.object({}),
      respond: () => ({ content: [], structuredContent: {} }),
    });

    const response = await handlers.vrchat_write_createWidget?.({ body: {} });
    expect(callOperation).toHaveBeenCalledWith({
      operationId: 'createWidget',
      params: {},
      body: {},
      options: undefined,
    });
    expect(response?.isError).toBe(true);
    expect(response?.structuredContent?.error).toBe('boom');
  });

  it('marks required body as required in the schema', async () => {
    const { registerGeneratedWriteTools } = await import('../../src/core/writeToolRegistry.js');
    const metas: Record<string, { inputSchema: { safeParse: (value: unknown) => { success: boolean } } }> = {};
    const server = {
      registerTool: (
        name: string,
        meta: { inputSchema: { safeParse: (value: unknown) => { success: boolean } } },
      ) => {
        metas[name] = meta;
      },
    };

    await registerGeneratedWriteTools(server as never, {
      writeOptionsSchema: z.object({}),
      writeOutputSchema: z.object({}),
      respond: () => ({ content: [], structuredContent: {} }),
    });

    const schema = metas.vrchat_write_createWidget?.inputSchema;
    expect(schema).toBeDefined();
    expect(schema?.safeParse({}).success).toBe(false);
    expect(schema?.safeParse({ body: { name: 'Widget' } }).success).toBe(true);
  });
});
