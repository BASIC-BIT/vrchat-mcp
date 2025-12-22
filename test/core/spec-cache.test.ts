import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import { clearSpecCache, getSpecIndex } from '../../src/core/spec.js';

const fixtureSpecPath = path.join(process.cwd(), 'test', 'fixtures', 'spec.yaml');

describe('spec cache', () => {
  beforeEach(() => {
    process.env.VRCHAT_MCP_SPEC_URL = fixtureSpecPath;
    clearSpecCache();
  });

  afterEach(() => {
    delete process.env.VRCHAT_MCP_SPEC_URL;
    clearSpecCache();
  });

  it('caches spec index until cleared', async () => {
    const first = await getSpecIndex();
    const second = await getSpecIndex();
    expect(first).toBe(second);
    clearSpecCache();
    const third = await getSpecIndex();
    expect(third).not.toBe(first);
    expect(third.operations.has('getConfig')).toBe(true);
  });
});
