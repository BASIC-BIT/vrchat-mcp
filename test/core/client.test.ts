import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'node:path';

vi.mock('undici', async () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await vi.importActual<typeof import('undici')>('undici');
  return {
    ...actual,
    fetch: vi.fn(),
  };
});

vi.mock('../../src/auth/index.js', () => ({
  authManager: {
    getCookieHeader: vi.fn(),
    setCookiesFromResponse: vi.fn(),
  },
}));

vi.mock('../../src/services/groups/index.js', () => ({
  checkGroupAllowed: vi.fn(() => ({ ok: true })),
}));

import { fetch as undiciFetch, Headers } from 'undici';
import { authManager } from '../../src/auth/index.js';
import { checkGroupAllowed } from '../../src/services/groups/index.js';

const fixtureSpecPath = path.join(process.cwd(), 'test', 'fixtures', 'spec.yaml');

const getCookieHeaderSpy = vi.spyOn(authManager, 'getCookieHeader');
const setCookiesFromResponseSpy = vi.spyOn(authManager, 'setCookiesFromResponse');

async function loadCallOperation() {
  const { clearSpecCache } = await import('../../src/core/spec.js');
  clearSpecCache();
  const mod = await import('../../src/core/client.js');
  return mod.callOperation;
}

describe('callOperation behavior', () => {
  const prevSpec = process.env.VRCHAT_MCP_SPEC_URL;
  const prevWrites = process.env.VRCHAT_MCP_ALLOW_WRITES;

  beforeEach(() => {
    vi.resetModules();
    vi.mocked(undiciFetch).mockReset();
    getCookieHeaderSpy.mockReset();
    setCookiesFromResponseSpy.mockReset();
    process.env.VRCHAT_MCP_SPEC_URL = fixtureSpecPath;
  });

  afterEach(() => {
    if (prevSpec === undefined) {
      delete process.env.VRCHAT_MCP_SPEC_URL;
    } else {
      process.env.VRCHAT_MCP_SPEC_URL = prevSpec;
    }
    if (prevWrites === undefined) {
      delete process.env.VRCHAT_MCP_ALLOW_WRITES;
    } else {
      process.env.VRCHAT_MCP_ALLOW_WRITES = prevWrites;
    }
  });

  it('returns raw response and stores cookies', async () => {
    process.env.VRCHAT_MCP_ALLOW_WRITES = 'true';
    const headers = new Headers({ 'content-type': 'application/json' });
    (headers as Headers & { getSetCookie?: () => string[] }).getSetCookie = () => [
      'auth=token; Domain=vrchat.cloud; Path=/',
    ];
    vi.mocked(undiciFetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers,
      text: () => Promise.resolve('{"hello":1}'),
    } as Response);
    getCookieHeaderSpy.mockResolvedValue('auth=token');

    const callOperation = await loadCallOperation();
    const result = await callOperation({
      operationId: 'getConfig',
      options: { rawResponse: true },
    });

    expect(result.status).toBe(200);
    expect(result.data).toEqual({ hello: 1 });
    expect(setCookiesFromResponseSpy).toHaveBeenCalled();
    const init = vi.mocked(undiciFetch).mock.calls[0]?.[1];
    if (init?.headers instanceof Headers) {
      expect(init.headers.get('cookie')).toBe('auth=token');
    }
  });

  it('throws when response is not ok', async () => {
    process.env.VRCHAT_MCP_ALLOW_WRITES = 'true';
    const headers = new Headers();
    vi.mocked(undiciFetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers,
      text: () => Promise.resolve('fail'),
    } as Response);

    const callOperation = await loadCallOperation();
    await expect(
      callOperation({ operationId: 'getConfig' }),
    ).rejects.toThrow('VRChat API returned 500');
  });

  it('throws on write operations when writes are disabled', async () => {
    process.env.VRCHAT_MCP_ALLOW_WRITES = 'false';
    const callOperation = await loadCallOperation();
    await expect(
      callOperation({ operationId: 'createInstance', body: { worldId: 'wrld_1' } }),
    ).rejects.toThrow('Write operations are disabled');
    expect(undiciFetch).not.toHaveBeenCalled();
  });

  it('sends JSON body for write operations', async () => {
    process.env.VRCHAT_MCP_ALLOW_WRITES = 'true';
    const headers = new Headers();
    vi.mocked(undiciFetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers,
      text: () => Promise.resolve('{"id":"inst_1"}'),
    } as Response);

    const callOperation = await loadCallOperation();
    await callOperation({
      operationId: 'createInstance',
      body: { worldId: 'wrld_1' },
    });

    const init = vi.mocked(undiciFetch).mock.calls[0]?.[1];
    expect(init?.method).toBe('POST');
    if (init?.headers instanceof Headers) {
      expect(init.headers.get('content-type')).toBe('application/json');
    }
    expect(init?.body).toBe(JSON.stringify({ worldId: 'wrld_1' }));
  });

  it('throws on unknown operationId', async () => {
    process.env.VRCHAT_MCP_ALLOW_WRITES = 'true';
    const callOperation = await loadCallOperation();
    await expect(callOperation({ operationId: 'nope' })).rejects.toThrow(
      'Unknown operationId: nope',
    );
  });

  it('throws when required path params are missing', async () => {
    process.env.VRCHAT_MCP_ALLOW_WRITES = 'true';
    const callOperation = await loadCallOperation();
    await expect(callOperation({ operationId: 'getUser' })).rejects.toThrow(
      'Missing required path param: userId',
    );
  });

  it('builds URLs with array query params in dry run', async () => {
    process.env.VRCHAT_MCP_ALLOW_WRITES = 'true';
    const callOperation = await loadCallOperation();
    const result = await callOperation({
      operationId: 'searchUsers',
      params: { search: ['alpha', 'beta'], offset: 2 },
      options: { dryRun: true },
    });

    expect(result.dryRun).toBe(true);
    expect(result.url).toContain('/users');
    expect(result.url).toContain('search=alpha');
    expect(result.url).toContain('search=beta');
    expect(result.url).toContain('offset=2');
  });

  it('blocks group writes when allowlist rejects', async () => {
    process.env.VRCHAT_MCP_ALLOW_WRITES = 'true';
    vi.mocked(checkGroupAllowed).mockReturnValueOnce({ ok: false, reason: 'blocked' });
    const callOperation = await loadCallOperation();

    await expect(
      callOperation({
        operationId: 'createGroupCalendarEvent',
        params: { groupId: 'grp_blocked' },
        body: { title: 'Test' },
      }),
    ).rejects.toThrow('blocked');
    expect(undiciFetch).not.toHaveBeenCalled();
  });

  it('blocks group writes when groupId is in body', async () => {
    process.env.VRCHAT_MCP_ALLOW_WRITES = 'true';
    vi.mocked(checkGroupAllowed).mockReturnValueOnce({ ok: false, reason: 'blocked' });
    const callOperation = await loadCallOperation();

    await expect(
      callOperation({
        operationId: 'createGroupCalendarEvent',
        body: { groupId: 'grp_body', title: 'Test' },
      }),
    ).rejects.toThrow('blocked');
    expect(undiciFetch).not.toHaveBeenCalled();
  });

  it('wraps network errors', async () => {
    process.env.VRCHAT_MCP_ALLOW_WRITES = 'true';
    vi.mocked(undiciFetch).mockRejectedValueOnce(new Error('boom'));
    const callOperation = await loadCallOperation();
    await expect(callOperation({ operationId: 'getConfig' })).rejects.toThrow(
      'Network or fetch error',
    );
  });
});
