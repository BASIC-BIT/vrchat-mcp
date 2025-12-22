import { describe, it, expect } from 'vitest';
import { searchFriendsByName, findFriendByNameOrId } from '../../../src/services/friends/index.js';

describe('friend search helpers', () => {
  const friends = [
    { id: '1', displayName: 'Nakk', location: 'offline', status: 'offline' },
    { id: '2', displayName: 'nak', location: 'offline', status: 'offline' },
    { id: '3', displayName: 'Anak', location: 'private', status: 'active' },
    { id: '4', displayName: 'Zed' },
  ];

  it('ranks exact over prefix over contains', () => {
    const results = searchFriendsByName(friends, 'nak');
    expect(results.map((r) => r.userId)).toEqual(['2', '1', '3']);
    expect(results[0].matchType).toBe('exact');
    expect(results[1].matchType).toBe('prefix');
    expect(results[2].matchType).toBe('contains');
  });

  it('finds friend by name or id (case-insensitive)', () => {
    const byName = findFriendByNameOrId(friends, { name: 'NAKK' });
    expect(byName?.id).toBe('1');
    const byId = findFriendByNameOrId(friends, { userId: '3' });
    expect(byId?.displayName).toBe('Anak');
  });
});
