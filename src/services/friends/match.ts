export interface LocationInfo {
  raw: string | null;
  type: 'instance' | 'offline' | 'private' | 'traveling' | 'unknown';
  worldId?: string;
  instanceId?: string;
  groupId?: string;
  accessType?: string;
  region?: string;
}

export interface FriendRecordLite {
  id?: string;
  displayName?: string;
  location?: string;
  status?: string;
}

export interface FriendMatch {
  userId: string;
  displayName: string;
  location?: string;
  status?: string;
  matchScore: number;
  matchType: 'exact' | 'prefix' | 'contains';
}

export function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

export function scoreNameMatch(
  query: string,
  candidate: string,
): { score: number; type: 'exact' | 'prefix' | 'contains' } | null {
  if (!query || !candidate) return null;
  if (candidate === query) return { score: 100, type: 'exact' };
  if (candidate.startsWith(query)) return { score: 80, type: 'prefix' };
  if (candidate.includes(query)) return { score: 60, type: 'contains' };
  return null;
}

export function parseLocation(raw?: string): LocationInfo {
  if (!raw) return { raw: null, type: 'unknown' };
  if (raw === 'offline') return { raw, type: 'offline' };
  if (raw === 'private') return { raw, type: 'private' };
  if (raw === 'traveling') return { raw, type: 'traveling' };
  if (raw.startsWith('wrld_') && raw.includes(':')) {
    const [worldId, rest] = raw.split(':');
    const instanceId = rest?.split('~')[0] ?? rest;
    const info: LocationInfo = { raw, type: 'instance', worldId, instanceId };
    const groupId = extractGroupId(raw);
    const accessType = extractAccessType(raw);
    const region = extractRegion(raw);
    if (groupId) info.groupId = groupId;
    if (accessType) info.accessType = accessType;
    if (region) info.region = region;
    return info;
  }
  return { raw, type: 'unknown' };
}

function extractGroupId(raw: string): string | undefined {
  const match = /~group\(([^)]+)\)/i.exec(raw);
  if (!match) return undefined;
  return match[1];
}

function extractAccessType(raw: string): string | undefined {
  if (raw.includes('~group(') || raw.includes('~groupAccessType')) return 'group';
  if (raw.includes('~private')) return 'private';
  if (raw.includes('~friends')) return 'friends';
  if (raw.includes('~hidden')) return 'hidden';
  if (raw.includes('~public')) return 'public';
  return raw.includes('~') ? 'custom' : undefined;
}

function extractRegion(raw: string): string | undefined {
  const match = /~region\(([^)]+)\)/i.exec(raw);
  if (!match) return undefined;
  return match[1];
}

export function findFriendByNameOrId<T extends FriendRecordLite>(
  friends: T[],
  options: { name?: string; userId?: string },
): T | undefined {
  const { name, userId } = options;
  if (userId) {
    return friends.find((friend) => String(friend.id ?? '') === userId);
  }
  if (!name) return undefined;
  const targetName = normalizeName(name);
  return friends.find((friend) => normalizeName(String(friend.displayName ?? '')) === targetName);
}

export function searchFriendsByName(friends: FriendRecordLite[], query: string): FriendMatch[] {
  const normalizedQuery = normalizeName(query);
  if (!normalizedQuery) return [];

  const matches: FriendMatch[] = [];
  for (const friend of friends) {
    const displayName = typeof friend.displayName === 'string' ? friend.displayName : '';
    const score = scoreNameMatch(normalizedQuery, normalizeName(displayName));
    if (!score) continue;
    matches.push({
      userId: String(friend.id ?? ''),
      displayName,
      location: typeof friend.location === 'string' ? friend.location : undefined,
      status: typeof friend.status === 'string' ? friend.status : undefined,
      matchScore: score.score,
      matchType: score.type,
    });
  }

  matches.sort((a, b) => b.matchScore - a.matchScore || a.displayName.localeCompare(b.displayName));
  return matches;
}
