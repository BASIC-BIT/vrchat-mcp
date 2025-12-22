import { getConfig } from '../../config/index.js';

function getAllowlist(): Set<string> | null {
  const entries = getConfig().groups.allowlist;
  if (!entries || entries.length === 0) return null;
  return new Set(entries);
}

export function checkGroupAllowed(groupId: string): { ok: true } | { ok: false; reason: string } {
  const allowlist = getAllowlist();
  if (!allowlist) return { ok: true };
  if (allowlist.has(groupId)) return { ok: true };
  return {
    ok: false,
    reason: `Group ${groupId} is not in groups.allowlist.`,
  };
}
