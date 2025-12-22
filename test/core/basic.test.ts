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

describe('callOperation', () => {
  it('builds URL for getConfig (dry run)', async () => {
    const res = await callOperation({ operationId: 'getConfig', options: { dryRun: true } });
    expect(res.dryRun).toBe(true);
    expect(res.url).toContain('/config');
  });
});
