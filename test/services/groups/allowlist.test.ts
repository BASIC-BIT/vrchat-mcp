import { describe, it, expect, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { resetConfigCacheForTest } from '../../../src/config/index.js';

let tempDir: string | null = null;

function setGroupAllowlist(allowlist: string[]) {
  expect(tempDir).toBeNull();
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vrchat-mcp-config-'));
  const filePath = path.join(tempDir, 'config.json');
  fs.writeFileSync(filePath, JSON.stringify({ groups: { allowlist } }), 'utf8');
  process.env.VRCHAT_MCP_CONFIG_FILE = filePath;
  resetConfigCacheForTest();
}

describe('group allowlist', () => {
  afterEach(() => {
    delete process.env.VRCHAT_MCP_CONFIG_FILE;
    resetConfigCacheForTest();
    if (tempDir) fs.rmSync(tempDir, { recursive: true, force: true });
    tempDir = null;
  });

  it('allows all when unset', async () => {
    const mod = await import('../../../src/services/groups/allowlist.js');
    const result = mod.checkGroupAllowed('grp_any');
    expect(result.ok).toBe(true);
  });

  it('blocks when not in allowlist', async () => {
    setGroupAllowlist(['grp_allowed', 'grp_two']);
    const mod = await import('../../../src/services/groups/allowlist.js');
    const result = mod.checkGroupAllowed('grp_blocked');
    expect(result.ok).toBe(false);
  });

  it('allows when in allowlist', async () => {
    setGroupAllowlist(['grp_allowed', 'grp_two']);
    const mod = await import('../../../src/services/groups/allowlist.js');
    const result = mod.checkGroupAllowed('grp_two');
    expect(result.ok).toBe(true);
  });
});
