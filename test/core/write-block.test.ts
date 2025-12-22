import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'node:path';
import { clearSpecCache } from '../../src/core/spec.js';

const fixtureSpecPath = path.join(process.cwd(), 'test', 'fixtures', 'spec.yaml');

describe('write blocking', () => {
  beforeEach(() => {
    process.env.VRCHAT_MCP_SPEC_URL = fixtureSpecPath;
    delete process.env.VRCHAT_MCP_ALLOW_WRITES;
    clearSpecCache();
    vi.resetModules();
  });

  afterEach(() => {
    delete process.env.VRCHAT_MCP_SPEC_URL;
    delete process.env.VRCHAT_MCP_ALLOW_WRITES;
    clearSpecCache();
    vi.resetModules();
  });

  it('blocks non-GET operations when writes disabled', async () => {
    const { callOperation } = await import('../../src/core/client.js');
    await expect(
      callOperation({
        operationId: 'createThing',
        body: { name: 'test' },
        options: { dryRun: true },
      }),
    ).rejects.toThrow(/Write operations are disabled/);
  });
});
