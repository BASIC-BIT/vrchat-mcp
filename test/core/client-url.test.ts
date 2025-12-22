import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { callOperation } from '../../src/core/client.js';
import { clearSpecCache } from '../../src/core/spec.js';
import path from 'node:path';

const fixtureSpecPath = path.join(process.cwd(), 'test', 'fixtures', 'spec.yaml');

beforeAll(() => {
  process.env.VRCHAT_MCP_SPEC_URL = fixtureSpecPath;
  clearSpecCache();
});

afterAll(() => {
  delete process.env.VRCHAT_MCP_SPEC_URL;
  clearSpecCache();
});

describe('callOperation url building', () => {
  it('builds URL with path + query params', async () => {
    const res = await callOperation({
      operationId: 'getUserFriends',
      params: { userId: 'usr_123', n: 2, tags: ['a', 'b'] },
      options: { dryRun: true },
    });
    const url = new URL(res.url);
    expect(url.pathname).toContain('/users/usr_123/friends');
    expect(url.searchParams.get('n')).toBe('2');
    expect(url.searchParams.getAll('tags')).toEqual(['a', 'b']);
  });

  it('throws when required path param missing', async () => {
    await expect(
      callOperation({
        operationId: 'getUserFriends',
        params: {},
        options: { dryRun: true },
      }),
    ).rejects.toThrow('Missing required path param: userId');
  });
});
