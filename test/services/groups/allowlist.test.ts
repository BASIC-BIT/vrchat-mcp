import { describe, it, expect } from 'vitest';

describe('group allowlist', () => {
  it('allows all when unset', async () => {
    delete process.env.VRCHAT_MCP_GROUP_ALLOWLIST;
    const mod = await import('../../../src/services/groups/allowlist.js');
    const result = mod.checkGroupAllowed('grp_any');
    expect(result.ok).toBe(true);
  });

  it('blocks when not in allowlist', async () => {
    process.env.VRCHAT_MCP_GROUP_ALLOWLIST = 'grp_allowed,grp_two';
    const mod = await import('../../../src/services/groups/allowlist.js');
    const result = mod.checkGroupAllowed('grp_blocked');
    expect(result.ok).toBe(false);
  });

  it('allows when in allowlist', async () => {
    process.env.VRCHAT_MCP_GROUP_ALLOWLIST = 'grp_allowed,grp_two';
    const mod = await import('../../../src/services/groups/allowlist.js');
    const result = mod.checkGroupAllowed('grp_two');
    expect(result.ok).toBe(true);
  });
});
