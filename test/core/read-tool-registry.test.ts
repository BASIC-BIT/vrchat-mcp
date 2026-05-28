import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { z } from 'zod';
const mockConfig = {
  generatedReadTools: { enabled: true, operationIds: [] as string[] },
  generatedWriteTools: { enabled: true, operationIds: [] as string[] },
  logging: { level: 'info' },
};

vi.mock('../../src/core/generatedToolSkips.js', () => ({
  GENERATED_READ_SKIP_IDS: ['getHardSkipped'],
  GENERATED_WRITE_SKIP_IDS: [],
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
            '/hard-skip': { get: { operationId: 'getHardSkipped', summary: 'Hard Skipped' } },
            '/widgets': { get: { operationId: 'getWidget', summary: 'Get Widget' } },
            '/users/{userId}': {
              get: { operationId: 'getWidgetUser', summary: 'Get Widget User' },
            },
            '/curated-users/{userId}': { get: { operationId: 'getUser', summary: 'Get User' } },
            '/me': { post: { operationId: 'updateUser', summary: 'Update User' } },
          },
        },
        operations: new Map([
          [
            'getConfig',
            {
              operationId: 'getConfig',
              method: 'GET',
              path: '/config',
              parameters: [],
              hasRequestBody: false,
            },
          ],
          [
            'getHardSkipped',
            {
              operationId: 'getHardSkipped',
              method: 'GET',
              path: '/hard-skip',
              parameters: [],
              hasRequestBody: false,
            },
          ],
          [
            'getWidget',
            {
              operationId: 'getWidget',
              method: 'GET',
              path: '/widgets',
              parameters: [],
              hasRequestBody: false,
            },
          ],
          [
            'getWidgetUser',
            {
              operationId: 'getWidgetUser',
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
            'getUser',
            {
              operationId: 'getUser',
              method: 'GET',
              path: '/curated-users/{userId}',
              parameters: [],
              hasRequestBody: false,
            },
          ],
          [
            'updateUser',
            {
              operationId: 'updateUser',
              method: 'POST',
              path: '/me',
              parameters: [],
              hasRequestBody: true,
            },
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
    mockConfig.generatedReadTools = { enabled: true, operationIds: [] };
    mockConfig.generatedWriteTools = { enabled: true, operationIds: [] };
    vi.resetModules();
  });

  afterEach(() => {
    mockConfig.generatedReadTools = { enabled: true, operationIds: [] };
    mockConfig.generatedWriteTools = { enabled: true, operationIds: [] };
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

    expect(count).toBe(1);
    expect(registered).toEqual(['vrchat_read']);
  });

  it('uses compact params schema and leaves required params to runtime validation', async () => {
    const { registerGeneratedReadTools } = await import('../../src/core/readToolRegistry.js');
    const metas: Record<
      string,
      { inputSchema: { safeParse: (value: unknown) => { success: boolean } } }
    > = {};
    const server = {
      registerTool: (
        name: string,
        meta: { inputSchema: { safeParse: (value: unknown) => { success: boolean } } }
      ) => {
        metas[name] = meta;
      },
    };

    await registerGeneratedReadTools(server as never, {
      readOptionsSchema: z.object({}),
      readOutputSchema: z.object({}),
      respond: () => ({ content: [], structuredContent: {} }),
    });

    const schema = metas.vrchat_read?.inputSchema;
    expect(schema).toBeDefined();
    expect(schema?.safeParse({}).success).toBe(false);
    expect(schema?.safeParse({ operationId: 'getWidgetUser' }).success).toBe(true);
    expect(
      schema?.safeParse({ operationId: 'getWidgetUser', params: { userId: 'usr_123' } }).success
    ).toBe(true);
    expect(
      schema?.safeParse({ operationId: 'getWidgetUser', params: { unknown: 1 } }).success
    ).toBe(true);
    expect(schema?.safeParse({ params: 'bad' }).success).toBe(false);
  });

  it('can be disabled entirely', async () => {
    mockConfig.generatedReadTools = { enabled: false, operationIds: [] };
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

  it('can be allowlisted by operationId', async () => {
    mockConfig.generatedReadTools = { enabled: true, operationIds: ['getWidgetUser'] };
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
    expect(registered).toEqual(['vrchat_read']);
  });

  it('skips operations that have curated replacements even when allowlisted', async () => {
    mockConfig.generatedReadTools = { enabled: true, operationIds: ['getUser'] };
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
      content: { type: string; text?: string }[];
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

    const response = await handlers.vrchat_read?.({ operationId: 'getWidget', params: {} });
    expect(callReadOperation).toHaveBeenCalledWith(
      'getWidget',
      {},
      expect.objectContaining({ includeMeta: undefined })
    );
    expect(response?.isError).toBe(true);
    expect(response?.content[0]?.text).toBe('boom');
  });
});
