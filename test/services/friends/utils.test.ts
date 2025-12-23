import { describe, it, expect } from 'vitest';
import { normalizeName, parseLocation, scoreNameMatch } from '../../../src/services/friends/index.js';

describe('friends helpers', () => {
  it('normalizes names', () => {
    expect(normalizeName('  NaKk ')).toBe('nakk');
  });

  it('scores name matches', () => {
    expect(scoreNameMatch('nakk', 'nakk')).toEqual({ score: 100, type: 'exact' });
    expect(scoreNameMatch('nak', 'nakk')).toEqual({ score: 80, type: 'prefix' });
    expect(scoreNameMatch('akk', 'nakk')).toEqual({ score: 60, type: 'contains' });
    expect(scoreNameMatch('zzz', 'nakk')).toBeNull();
  });

  it('parses locations', () => {
    expect(parseLocation('offline')).toEqual({ raw: 'offline', type: 'offline' });
    expect(parseLocation('private')).toEqual({ raw: 'private', type: 'private' });
    expect(parseLocation('traveling')).toEqual({ raw: 'traveling', type: 'traveling' });
    expect(parseLocation('wrld_abc:123')).toEqual({
      raw: 'wrld_abc:123',
      type: 'instance',
      worldId: 'wrld_abc',
      instanceId: '123',
    });
    expect(
      parseLocation('wrld_abc:123~group(grp_456)~region(use)'),
    ).toEqual({
      raw: 'wrld_abc:123~group(grp_456)~region(use)',
      type: 'instance',
      worldId: 'wrld_abc',
      instanceId: '123',
      groupId: 'grp_456',
      accessType: 'group',
      region: 'use',
    });
    expect(parseLocation('weird')).toEqual({ raw: 'weird', type: 'unknown' });
    expect(parseLocation()).toEqual({ raw: null, type: 'unknown' });
  });
});
