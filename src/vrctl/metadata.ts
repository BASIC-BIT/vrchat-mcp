import { buildCacheKey, cacheManager } from '../services/cache.js';
import { vrctlAuthManager } from './auth.js';
import { createVrctlClient, type VrctlClient } from './client.js';
import { parseTimelineBootstrap, type VrctlCategory, type VrctlTag } from './timelineBootstrap.js';

export interface VrctlMetadata {
  loggedIn: boolean | null;
  categories: VrctlCategory[];
  tags: VrctlTag[];
}

export interface VrctlMetadataServiceDeps {
  client?: Pick<VrctlClient, 'getSiteHtml'>;
}

export class VrctlMetadataService {
  private client: Pick<VrctlClient, 'getSiteHtml'>;

  constructor(deps: VrctlMetadataServiceDeps = {}) {
    this.client = deps.client ?? createVrctlClient();
  }

  async getBootstrapCached(): Promise<VrctlMetadata> {
    const status = vrctlAuthManager.getStatus();
    const cacheKey = buildCacheKey('vrctl:bootstrap', {
      hasSessionCookie: status.hasSessionCookie,
    });
    const ttlMs = 60_000;

    return await cacheManager.getOrSet(cacheKey, ttlMs, ['vrctl'], async () => {
      const html = await this.client.getSiteHtml('/');
      const parsed = parseTimelineBootstrap(html);
      if (!parsed) {
        return { loggedIn: null, categories: [], tags: [] };
      }
      const categories = parsed.timeline.misc?.categories ?? [];
      const tags = parsed.timeline.misc?.tags ?? [];
      return {
        loggedIn: parsed.loggedIn,
        categories,
        tags,
      };
    });
  }
}

export function createVrctlMetadataService(
  deps: VrctlMetadataServiceDeps = {}
): VrctlMetadataService {
  return new VrctlMetadataService(deps);
}

export const vrctlMetadataService = createVrctlMetadataService();
