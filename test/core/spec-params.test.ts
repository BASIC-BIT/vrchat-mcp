import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import { clearSpecCache, getSpecIndex } from '../../src/core/spec.js';

const fixtureSpecPath = path.join(process.cwd(), 'test', 'fixtures', 'spec.yaml');

describe('spec parameters', () => {
  beforeEach(() => {
    process.env.VRCHAT_MCP_SPEC_URL = fixtureSpecPath;
    clearSpecCache();
  });

  afterEach(() => {
    delete process.env.VRCHAT_MCP_SPEC_URL;
    clearSpecCache();
  });

  it('dereferences parameters from components', async () => {
    const index = await getSpecIndex();
    const op = index.operations.get('getUserFriends');
    expect(op).toBeDefined();
    const params = op!.parameters;
    const userId = params.find((p) => p.name === 'userId' && p.in === 'path');
    const limit = params.find((p) => p.name === 'n' && p.in === 'query');
    expect(userId?.required).toBe(true);
    expect(limit?.required).toBe(false);
  });
});
