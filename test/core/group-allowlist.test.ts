import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

let tempDir: string | null = null;

function setGroupAllowlist(allowlist: string[]) {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vrchat-mcp-config-'));
  const filePath = path.join(tempDir, 'config.json');
  fs.writeFileSync(filePath, JSON.stringify({ groups: { allowlist } }), 'utf8');
  process.env.VRCHAT_MCP_CONFIG_FILE = filePath;
}

describe('group allowlist guard', () => {
  beforeEach(() => {
    delete process.env.VRCHAT_MCP_ALLOW_WRITES;
    delete process.env.VRCHAT_MCP_CONFIG_FILE;
    vi.resetModules();
  });

  afterEach(() => {
    delete process.env.VRCHAT_MCP_ALLOW_WRITES;
    delete process.env.VRCHAT_MCP_CONFIG_FILE;
    if (tempDir) fs.rmSync(tempDir, { recursive: true, force: true });
    tempDir = null;
    vi.resetModules();
  });

  it('blocks non-GET group operations when group not allowlisted', async () => {
    process.env.VRCHAT_MCP_ALLOW_WRITES = 'true';
    setGroupAllowlist(['grp_allowed']);

    vi.doMock('../../src/core/spec.js', () => ({
      getSpecIndex: () => ({
        operations: new Map([
          [
            'createGroupThing',
            {
              method: 'POST',
              path: '/groups/{groupId}/things',
              parameters: [{ name: 'groupId', in: 'path', required: true }],
              hasRequestBody: true,
            },
          ],
        ]),
      }),
    }));

    const { callOperation } = await import('../../src/core/client.js');
    await expect(
      callOperation({
        operationId: 'createGroupThing',
        params: { groupId: 'grp_blocked' },
        body: { name: 'test' },
        options: { dryRun: true },
      })
    ).rejects.toThrow(/not in groups\.allowlist/);
  });

  it('allows non-GET group operations when group allowlisted', async () => {
    process.env.VRCHAT_MCP_ALLOW_WRITES = 'true';
    setGroupAllowlist(['grp_allowed']);

    vi.doMock('../../src/core/spec.js', () => ({
      getSpecIndex: () => ({
        operations: new Map([
          [
            'createGroupThing',
            {
              method: 'POST',
              path: '/groups/{groupId}/things',
              parameters: [{ name: 'groupId', in: 'path', required: true }],
              hasRequestBody: true,
            },
          ],
        ]),
      }),
    }));

    const { callOperation } = await import('../../src/core/client.js');
    const result = await callOperation({
      operationId: 'createGroupThing',
      params: { groupId: 'grp_allowed' },
      body: { name: 'test' },
      options: { dryRun: true },
    });
    expect(result.dryRun).toBe(true);
  });

  it('blocks raw group instance creation when ownerId is not allowlisted', async () => {
    process.env.VRCHAT_MCP_ALLOW_WRITES = 'true';
    setGroupAllowlist(['grp_allowed']);

    vi.doMock('../../src/core/spec.js', () => ({
      getSpecIndex: () => ({
        operations: new Map([
          [
            'createInstance',
            {
              operationId: 'createInstance',
              method: 'POST',
              path: '/instances',
              parameters: [],
              hasRequestBody: true,
            },
          ],
        ]),
      }),
    }));

    const { callOperation } = await import('../../src/core/client.js');
    await expect(
      callOperation({
        operationId: 'createInstance',
        body: { type: 'group', ownerId: 'grp_blocked', worldId: 'wrld_test', region: 'us' },
        options: { dryRun: true },
      })
    ).rejects.toThrow(/not in groups\.allowlist/);
  });

  it('allows raw group instance creation when ownerId is allowlisted', async () => {
    process.env.VRCHAT_MCP_ALLOW_WRITES = 'true';
    setGroupAllowlist(['grp_allowed']);

    vi.doMock('../../src/core/spec.js', () => ({
      getSpecIndex: () => ({
        operations: new Map([
          [
            'createInstance',
            {
              operationId: 'createInstance',
              method: 'POST',
              path: '/instances',
              parameters: [],
              hasRequestBody: true,
            },
          ],
        ]),
      }),
    }));

    const { callOperation } = await import('../../src/core/client.js');
    const result = await callOperation({
      operationId: 'createInstance',
      body: { type: 'group', ownerId: 'grp_allowed', worldId: 'wrld_test', region: 'us' },
      options: { dryRun: true },
    });
    expect(result.dryRun).toBe(true);
  });
});
