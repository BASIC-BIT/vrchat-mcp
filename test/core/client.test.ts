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

import { fetch as undiciFetch, Headers, Request } from 'undici';
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

async function loadUploadGalleryImageMultipart() {
  const mod = await import('../../src/core/client.js');
  return mod.uploadGalleryImageMultipart;
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
    await expect(callOperation({ operationId: 'getConfig' })).rejects.toThrow(
      'VRChat API returned 500'
    );
  });

  it('includes error details for 4xx responses', async () => {
    process.env.VRCHAT_MCP_ALLOW_WRITES = 'true';
    const headers = new Headers({ 'retry-after': '3', 'set-cookie': 'auth=secret' });
    const errorBody = {
      error: {
        message: 'Current Password required',
        status_code: 400,
      },
    };
    vi.mocked(undiciFetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers,
      text: () => Promise.resolve(JSON.stringify(errorBody)),
    } as Response);

    const callOperation = await loadCallOperation();
    let captured: unknown;
    try {
      await callOperation({ operationId: 'getConfig' });
    } catch (err) {
      captured = err;
    }

    expect(captured).toBeInstanceOf(Error);
    expect((captured as Error).message).toBe('VRChat API returned 400: Current Password required');
    expect(captured && typeof captured === 'object').toBe(true);
    const payload = (captured as { payload?: unknown }).payload as
      { status?: number; error?: unknown; headers?: unknown } | undefined;
    expect(payload?.status).toBe(400);
    expect(payload?.error).toEqual(errorBody);
    expect(payload?.headers).toBeUndefined();
    expect((captured as { retryAfter?: unknown }).retryAfter).toBe('3');
  });

  it('throws on write operations when writes are disabled', async () => {
    process.env.VRCHAT_MCP_ALLOW_WRITES = 'false';
    const callOperation = await loadCallOperation();
    await expect(
      callOperation({ operationId: 'createInstance', body: { worldId: 'wrld_1' } })
    ).rejects.toThrow('Write operations are disabled');
    expect(undiciFetch).not.toHaveBeenCalled();
  });

  it('blocks policy-disabled avatar/world content-management operations before fetch', async () => {
    process.env.VRCHAT_MCP_ALLOW_WRITES = 'true';
    const callOperation = await loadCallOperation();
    await expect(callOperation({ operationId: 'createWorld' })).rejects.toThrow(
      'avatar/world content-management endpoints are disabled by policy'
    );
    await expect(
      callOperation({ operationId: 'createWorld', body: { name: 'World' } })
    ).rejects.toThrow('avatar/world content-management endpoints are disabled by policy');
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

  it('builds the verified gallery multipart request without setting content-type manually', async () => {
    process.env.VRCHAT_MCP_ALLOW_WRITES = 'true';
    getCookieHeaderSpy.mockResolvedValue('auth=token');
    vi.mocked(undiciFetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: () => Promise.resolve('{"id":"file_1"}'),
    } as Response);

    const upload = await loadUploadGalleryImageMultipart();
    await upload('poster.png', Uint8Array.from([1, 2, 3]));

    const [url, init] = vi.mocked(undiciFetch).mock.calls[0] ?? [];
    expect(url).toContain('/api/1/file/image');
    expect(init?.method).toBe('POST');
    expect((init?.headers as Headers).get('content-type')).toBeNull();
    expect((init?.headers as Headers).get('cookie')).toBe('auth=token');
    const request = new Request(url, init);
    expect(request.headers.get('content-type')).toMatch(/^multipart\/form-data; boundary=/);
    const body = await request.text();
    expect(body).toContain('name="file"; filename="poster.png"');
    expect(body).toContain('Content-Type: image/png');
    expect(body).toContain('name="tag"');
    expect(body).toContain('gallery');
  });

  it('blocks gallery multipart before cookie or fetch when writes are disabled', async () => {
    process.env.VRCHAT_MCP_ALLOW_WRITES = 'false';
    const upload = await loadUploadGalleryImageMultipart();
    await expect(upload('poster.png', Uint8Array.from([1]))).rejects.toThrow(
      'Write operations are disabled'
    );
    expect(getCookieHeaderSpy).not.toHaveBeenCalled();
    expect(undiciFetch).not.toHaveBeenCalled();
  });

  it('treats an indeterminate gallery upload transport failure as non-retryable', async () => {
    process.env.VRCHAT_MCP_ALLOW_WRITES = 'true';
    vi.mocked(undiciFetch).mockRejectedValueOnce(new Error('socket closed'));

    const upload = await loadUploadGalleryImageMultipart();
    let captured: unknown;
    try {
      await upload('poster.png', Uint8Array.from([1, 2, 3]));
    } catch (err) {
      captured = err;
    }

    expect(captured).toBeInstanceOf(Error);
    expect((captured as Error).message).toContain('may have succeeded');
    expect((captured as { retryable?: unknown }).retryable).toBe(false);
  });

  it('uses the observed live instance-update route when the community spec lacks it', async () => {
    process.env.VRCHAT_MCP_ALLOW_WRITES = 'true';
    const headers = new Headers();
    vi.mocked(undiciFetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers,
      text: () => Promise.resolve('{"calendarEntryId":"cal_1"}'),
    } as Response);

    const callOperation = await loadCallOperation();
    await callOperation({
      operationId: 'updateInstance',
      params: { worldId: 'wrld_1', instanceId: '123~group(grp_1)' },
      body: { calendarEntryId: 'cal_1' },
    });

    const [url, init] = vi.mocked(undiciFetch).mock.calls[0] ?? [];
    if (typeof url !== 'string') throw new Error('Expected fetch URL to be a string.');
    expect(url).toContain('/instances/wrld_1:123~group(grp_1)');
    expect(init?.method).toBe('PUT');
    expect(init?.body).toBe(JSON.stringify({ calendarEntryId: 'cal_1' }));
  });

  it('throws on unknown operationId', async () => {
    process.env.VRCHAT_MCP_ALLOW_WRITES = 'true';
    const callOperation = await loadCallOperation();
    await expect(callOperation({ operationId: 'nope' })).rejects.toThrow(
      'Unknown operationId: nope'
    );
  });

  it('throws when required path params are missing', async () => {
    process.env.VRCHAT_MCP_ALLOW_WRITES = 'true';
    const callOperation = await loadCallOperation();
    await expect(callOperation({ operationId: 'getUser' })).rejects.toThrow(
      'Missing required path param: userId'
    );
  });

  it('throws when required query params are missing', async () => {
    process.env.VRCHAT_MCP_ALLOW_WRITES = 'true';
    const callOperation = await loadCallOperation();
    await expect(callOperation({ operationId: 'searchCalendarEvents' })).rejects.toThrow(
      'Missing required query param: searchTerm'
    );
    expect(undiciFetch).not.toHaveBeenCalled();
  });

  it('throws when a required request body is missing', async () => {
    process.env.VRCHAT_MCP_ALLOW_WRITES = 'true';
    const callOperation = await loadCallOperation();
    await expect(callOperation({ operationId: 'createThing' })).rejects.toThrow(
      'Missing required request body for createThing'
    );
    await expect(callOperation({ operationId: 'createThing', body: null })).rejects.toThrow(
      'Missing required request body for createThing'
    );
    expect(undiciFetch).not.toHaveBeenCalled();
  });

  it('throws when params are not declared by the operation', async () => {
    process.env.VRCHAT_MCP_ALLOW_WRITES = 'true';
    const callOperation = await loadCallOperation();
    await expect(
      callOperation({
        operationId: 'getGroupCalendarEvents',
        params: { groupId: 'grp_1', monthDate: '2025-12-01' },
      })
    ).rejects.toThrow('Unknown parameter(s) for getGroupCalendarEvents: monthDate');
    expect(undiciFetch).not.toHaveBeenCalled();
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
      })
    ).rejects.toThrow('blocked');
    expect(undiciFetch).not.toHaveBeenCalled();
  });

  it('blocks group writes when groupId is in body', async () => {
    process.env.VRCHAT_MCP_ALLOW_WRITES = 'true';
    vi.mocked(checkGroupAllowed).mockReturnValueOnce({ ok: false, reason: 'blocked' });
    const callOperation = await loadCallOperation();

    await expect(
      callOperation({
        operationId: 'createInstance',
        body: { type: 'group', groupId: 'grp_body', worldId: 'wrld_1' },
      })
    ).rejects.toThrow('blocked');
    expect(undiciFetch).not.toHaveBeenCalled();
  });

  it('wraps network errors', async () => {
    process.env.VRCHAT_MCP_ALLOW_WRITES = 'true';
    vi.mocked(undiciFetch).mockRejectedValueOnce(new Error('boom'));
    const callOperation = await loadCallOperation();
    await expect(callOperation({ operationId: 'getConfig' })).rejects.toThrow(
      'Network or fetch error'
    );
  });
});
