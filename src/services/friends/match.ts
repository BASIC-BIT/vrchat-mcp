export interface LocationInfo {
  raw: string | null;
  type: 'instance' | 'offline' | 'private' | 'traveling' | 'unknown';
  worldId?: string;
  instanceId?: string;
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
    const [worldId, instanceId] = raw.split(':');
    return { raw, type: 'instance', worldId, instanceId };
  }
  return { raw, type: 'unknown' };
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
