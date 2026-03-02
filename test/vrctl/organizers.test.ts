import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resetConfigCacheForTest } from '../../src/config/index.js';
import { cacheManager } from '../../src/services/cache.js';
import { createVrctlOrganizersService } from '../../src/vrctl/organizers.js';

const touchedEnvKeys = new Set<string>();

function setEnv(key: string, value?: string) {
  touchedEnvKeys.add(key);
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

function resetEnv() {
  for (const key of touchedEnvKeys) {
    delete process.env[key];
  }
  touchedEnvKeys.clear();
}

describe('vrctl organizers service', () => {
  beforeEach(() => {
    resetConfigCacheForTest();
    cacheManager.invalidateAll();
    setEnv('VRCHAT_MCP_VRCTL_ENABLED', '1');
  });

  afterEach(() => {
    resetEnv();
    resetConfigCacheForTest();
    cacheManager.invalidateAll();
  });

  it('searches organizers by name and group id', async () => {
    const groupId = 'grp_11111111-1111-1111-1111-111111111111';
    const getApiJson = <T = unknown>(pathname: string): Promise<T> => {
      if (pathname !== '/organizers') throw new Error('unexpected');
      return Promise.resolve([
        {
          id: 1,
          name: 'Club A',
          slug: 'club-a',
          shortCode: 'A.0001',
          vrcGroup: `https://vrchat.com/home/group/${groupId}`,
          isSupporter: true,
        },
        { id: 2, name: 'Other Club', slug: 'other', shortCode: 'B.0001' },
      ] as unknown as T);
    };

    const service = createVrctlOrganizersService({ client: { getApiJson } });

    const byName = await service.searchOrganizers('Club A', 5);
    expect(byName.matches[0].vrchatGroupId).toBe(groupId);

    const byGroup = await service.searchOrganizers(groupId, 5);
    expect(byGroup.matches[0].name).toBe('Club A');

    const profile = await service.getOrganizerProfile({ vrchatGroupId: groupId });
    expect(profile?.slug).toBe('club-a');
  });
});
