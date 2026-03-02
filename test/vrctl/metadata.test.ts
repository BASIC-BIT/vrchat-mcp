import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cacheManager } from '../../src/services/cache.js';

vi.mock('../../src/vrctl/auth.js', () => ({
  vrctlAuthManager: {
    getStatus: vi.fn(),
  },
}));

import { createVrctlMetadataService } from '../../src/vrctl/metadata.js';
import { vrctlAuthManager } from '../../src/vrctl/auth.js';

interface VrctlAuthMock {
  getStatus: ReturnType<typeof vi.fn>;
}

function htmlBootstrap(loggedIn: boolean) {
  return `<!doctype html><html><body>
    <script>
      window.timeline={
        "misc":{
          "categories":[{"id":1,"name":"Music","urlName":"music"}],
          "tags":[{"id":2,"name":"Windows","visibleOnEvent":true,"visibleOnFilter":true}]
        },
        "personal":{"loggedIn":${loggedIn}}
      };
    </script>
  </body></html>`;
}

describe('vrctl metadata service', () => {
  beforeEach(() => {
    cacheManager.invalidateAll();
    const auth = vi.mocked(vrctlAuthManager, true) as unknown as VrctlAuthMock;
    auth.getStatus.mockReturnValue({
      loggedIn: false,
      verified: false,
      hasSessionCookie: false,
    });
  });

  afterEach(() => {
    cacheManager.invalidateAll();
  });

  it('parses window.timeline metadata and caches it', async () => {
    const getSiteHtml = vi.fn().mockResolvedValue(htmlBootstrap(false));
    const service = createVrctlMetadataService({ client: { getSiteHtml } });

    const first = await service.getBootstrapCached();
    expect(first.loggedIn).toBe(false);
    expect(first.categories[0].name).toBe('Music');
    expect(first.tags[0].name).toBe('Windows');

    const second = await service.getBootstrapCached();
    expect(second.loggedIn).toBe(false);
    expect(getSiteHtml).toHaveBeenCalledTimes(1);
  });
});
