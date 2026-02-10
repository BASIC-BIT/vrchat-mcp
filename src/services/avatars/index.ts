import type { z } from 'zod';
import type { schemas } from '../../generated/vrchat-schemas.js';
import { callReadOperationParsed, type ReadOperationData } from '../api/client.js';
import { buildCacheKey, cacheConfig, cacheManager } from '../cache.js';

const CACHE_TTL_MS = cacheConfig.groupsTtlMs;
const CACHE_STALE_TTL_MS = cacheConfig.groupsStaleTtlMs;

type AvatarRecord = Partial<z.infer<typeof schemas.Avatar>>;
type AvatarProfileRecord = NonNullable<ReadOperationData<'getAvatar'>>;

async function fetchAvatarProfileCached(
  avatarId: string,
  ttlMs = CACHE_TTL_MS,
  staleTtlMs = CACHE_STALE_TTL_MS
): Promise<{ value: AvatarProfileRecord; stale: boolean }> {
  const cacheKey = buildCacheKey('avatars:profile', { avatarId });
  return await cacheManager.getOrSetStale(
    cacheKey,
    ttlMs,
    staleTtlMs,
    ['avatars', 'avatars:profile'],
    async () => {
      const result = await callReadOperationParsed('getAvatar', { avatarId });
      const avatar = result.data;
      if (!avatar) {
        throw new Error('Avatar not found.');
      }
      return avatar;
    }
  );
}

export async function getAvatarProfile(avatarId: string): Promise<{
  avatarId: string;
  avatar: AvatarRecord;
  stale: boolean;
}> {
  const { value, stale } = await fetchAvatarProfileCached(avatarId);
  return {
    avatarId,
    avatar: value,
    stale,
  };
}
