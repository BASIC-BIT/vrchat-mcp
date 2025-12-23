import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('undici', () => ({
  fetch: vi.fn(),
}));

import { fetch as undiciFetch } from 'undici';

describe('spec fetch', () => {
  const prevSpec = process.env.VRCHAT_MCP_SPEC_URL;

  beforeEach(() => {
    process.env.VRCHAT_MCP_SPEC_URL = 'https://example.test/spec.yaml';
    vi.mocked(undiciFetch).mockReset();
    vi.resetModules();
  });

  afterEach(async () => {
    if (prevSpec === undefined) {
      delete process.env.VRCHAT_MCP_SPEC_URL;
    } else {
      process.env.VRCHAT_MCP_SPEC_URL = prevSpec;
    }
    const { clearSpecCache } = await import('../../src/core/spec.js');
    clearSpecCache();
  });

  it('throws when spec fetch is not ok', async () => {
    vi.mocked(undiciFetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve(''),
    } as Response);

    const { getSpecIndex, clearSpecCache } = await import('../../src/core/spec.js');
    clearSpecCache();
    await expect(getSpecIndex()).rejects.toThrow(
      'Failed to fetch OpenAPI spec (500) from https://example.test/spec.yaml',
    );
  });
});
