import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'node:path';
import { callReadOperation, shapeReadData } from '../../src/core/readTools.js';
import { clearSpecCache } from '../../src/core/spec.js';

vi.mock('../../src/core/client.js', () => ({
  callOperation: vi.fn(),
}));

import { callOperation } from '../../src/core/client.js';

const fixtureSpecPath = path.join(process.cwd(), 'test', 'fixtures', 'spec.yaml');

describe('read tools', () => {
  beforeEach(() => {
    process.env.VRCHAT_MCP_SPEC_URL = fixtureSpecPath;
    clearSpecCache();
  });

  afterEach(() => {
    delete process.env.VRCHAT_MCP_SPEC_URL;
    clearSpecCache();
    vi.resetAllMocks();
  });

  it('shapeReadData selects fields', () => {
    const data = [{ id: '1', name: 'A' }, { id: '2', name: 'B', extra: true }];
    const shaped = shapeReadData(data, { fields: ['id'] });
    expect(shaped).toEqual([{ id: '1' }, { id: '2' }]);
  });

  it('shapeReadData compacts arrays', () => {
    const data = { items: [1, 2, 3], nested: { items: [4, 5, 6] } };
    const shaped = shapeReadData(data, { compact: true, maxArrayLength: 2 });
    expect(shaped).toEqual({ items: [1, 2], nested: { items: [4, 5] } });
  });

  it('paginates offset+n endpoints', async () => {
    const mock = vi.mocked(callOperation);
    mock.mockImplementation(({ operationId, params }) => {
      expect(operationId).toBe('getFriends');
      const offset = Number(params?.offset ?? 0);
      const n = Number(params?.n ?? 2);
      const all = [1, 2, 3, 4, 5];
      const slice = all.slice(offset, offset + n);
      return Promise.resolve({ url: 'https://api.vrchat.cloud/api/1/friends', data: slice });
    });

    const result = await callReadOperation(
      'getFriends',
      {},
      { page: { enabled: true, size: 2, maxPages: 5 } },
    );

    expect(result.data).toEqual([1, 2, 3, 4, 5]);
    expect(result.page).toEqual({
      pages: 3,
      items: 5,
      pageSize: 2,
      offsetStart: 0,
      truncated: false,
    });
  });

  it('marks pagination truncated when maxItems reached', async () => {
    const mock = vi.mocked(callOperation);
    mock.mockResolvedValue({ url: 'https://api.vrchat.cloud/api/1/friends', data: [1, 2] });

    const result = await callReadOperation(
      'getFriends',
      {},
      { page: { enabled: true, size: 2, maxPages: 5, maxItems: 3 } },
    );

    expect(result.data).toEqual([1, 2, 1]);
    expect(result.page).toEqual({
      pages: 2,
      items: 3,
      pageSize: 2,
      offsetStart: 0,
      truncated: true,
    });
  });

  it('paginates object responses with posts arrays', async () => {
    const mock = vi.mocked(callOperation);
    mock.mockImplementation(({ params }) => {
      const offset = Number(params?.offset ?? 0);
      const posts = [{ id: `post_${offset}` }];
      return Promise.resolve({ url: 'https://api.vrchat.cloud/api/1/friends', data: { posts } });
    });

    const result = await callReadOperation(
      'getFriends',
      {},
      { page: { enabled: true, size: 1, maxPages: 2 } },
    );

    expect(result.data).toEqual([{ id: 'post_0' }, { id: 'post_1' }]);
    expect(result.page).toMatchObject({ pages: 2, items: 2, truncated: true });
  });

  it('maps number to n in params', async () => {
    const mock = vi.mocked(callOperation);
    mock.mockResolvedValue({ url: 'https://api.vrchat.cloud/api/1/friends', data: [] });
    await callReadOperation('getFriends', { number: 3 }, { page: { enabled: false } });
    expect(mock).toHaveBeenCalledWith({
      operationId: 'getFriends',
      params: { n: 3 },
    });
  });

  it('includes meta when requested', async () => {
    const mock = vi.mocked(callOperation);
    mock.mockResolvedValue({ url: 'https://api.vrchat.cloud/api/1/config', data: { ok: true } });
    const result = await callReadOperation('getConfig', {}, { includeMeta: true });
    expect(result.url).toBe('https://api.vrchat.cloud/api/1/config');
  });

  it('throws on pagination for non-offset endpoints', async () => {
    const mock = vi.mocked(callOperation);
    mock.mockResolvedValue({ url: 'https://api.vrchat.cloud/api/1/config', data: { ok: true } });
    await expect(
      callReadOperation('getConfig', {}, { page: { enabled: true } }),
    ).rejects.toThrow(/Pagination not supported/);
  });
});
