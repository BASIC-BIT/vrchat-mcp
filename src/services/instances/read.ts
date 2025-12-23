import { callReadOperation } from '../../core/readTools.js';
import { buildCacheKey, cacheConfig, cacheManager } from '../cache.js';

const INSTANCE_TTL_MS = cacheConfig.notificationsTtlMs;
const INSTANCE_STALE_TTL_MS = cacheConfig.notificationsStaleTtlMs;

export async function getInstanceDetails(worldId: string, instanceId: string) {
  const cacheKey = buildCacheKey('instances:get', { worldId, instanceId });
  const tags = ['instances', `instances:${worldId}`];
  const { value, stale } = await cacheManager.getOrSetStale(
    cacheKey,
    INSTANCE_TTL_MS,
    INSTANCE_STALE_TTL_MS,
    tags,
    async () => {
      const result = await callReadOperation('getInstance', { worldId, instanceId });
      return result.data ?? null;
    },
  );
  return { instance: value, stale };
}
