import type { z } from 'zod';
import type { schemas } from '../../generated/vrchat-schemas.js';
import type { AvatarUpdateInput, AvatarUpdateOutput } from '../../models/avatars.js';
import {
  callReadOperationParsed,
  callWriteOperationParsed,
  type ReadOperationData,
} from '../api/client.js';
import { callWithRetry, sleep, type RetryOptions } from '../../core/retry.js';
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

const CONTENT_TAG_PREFIX = 'content_';

/** Full avtr_ + UUID shape. A bare `avtr_` prefix test would misread an avatar *named* that. */
const AVATAR_ID_PATTERN =
  /^avtr_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Serializes read-modify-write per avatar. Two overlapping updates would otherwise both read the
 * same tag list and each PUT a complete array, so the later write would silently drop the
 * earlier one's addition — breaking the merge guarantee this tool advertises.
 */
const avatarLocks = new Map<string, Promise<unknown>>();

function withAvatarLock<T>(avatarId: string, run: () => Promise<T>): Promise<T> {
  const prior = avatarLocks.get(avatarId) ?? Promise.resolve();
  const result = prior.then(run, run);
  const settled = result.then(
    () => undefined,
    () => undefined
  );
  avatarLocks.set(avatarId, settled);
  void settled.then(() => {
    if (avatarLocks.get(avatarId) === settled) avatarLocks.delete(avatarId);
  });
  return result;
}

const AVATAR_PAGE_DELAY_MS = 250;
const AVATAR_PAGE_RETRY: RetryOptions = {
  maxAttempts: 4,
  baseDelayMs: 1_000,
  maxDelayMs: 30_000,
};

function nextTagsFor(existing: string[], input: AvatarUpdateInput): string[] {
  let tags = existing;
  if (input.clearContentTags) {
    tags = tags.filter((tag) => !tag.startsWith(CONTENT_TAG_PREFIX));
  }
  if (input.removeTags?.length) {
    tags = tags.filter((tag) => !input.removeTags!.includes(tag as never));
  }
  if (input.addTags?.length) {
    // Dedupe against the accumulating list, not the pre-addition snapshot, so a caller passing
    // the same tag twice cannot write it twice.
    tags = [...new Set([...tags, ...input.addTags])];
  }
  return tags;
}

/**
 * Carries the structured payload the tool layer needs to return actionable guidance rather
 * than a bare string, so a client can follow the recovery path programmatically.
 */
export class AvatarLookupError extends Error {
  constructor(
    message: string,
    readonly status: 'not_found' | 'ambiguous' | 'too_many_to_search',
    readonly nextSteps: string[]
  ) {
    super(message);
    this.name = 'AvatarLookupError';
  }
}

/** Accepts an avtr_ ID or the exact name of one of the caller's own avatars. */
async function resolveAvatarId(avatar: string): Promise<string> {
  if (AVATAR_ID_PATTERN.test(avatar)) return avatar;

  // Must see every owned avatar before deciding. Reading one page would report a later avatar
  // as missing, and — worse — if two same-named avatars straddle a page boundary the ambiguity
  // guard would see only one and write to it.
  const pageSize = 100;
  const maxPages = 20;
  const owned: { id?: string; name?: string }[] = [];
  let page = 0;
  for (; page < maxPages; page += 1) {
    // Retried and paced like the group-member snapshot: a transient 429 on page 7 should not
    // discard six good pages and abort a resolution the caller cannot easily retry.
    const { data: result } = await callWithRetry(
      () =>
        callReadOperationParsed('searchAvatars', {
          user: 'me',
          n: pageSize,
          offset: page * pageSize,
          releaseStatus: 'all',
        }),
      AVATAR_PAGE_RETRY
    );
    const batch = (result.data ?? []) as { id?: string; name?: string }[];
    owned.push(...batch);
    if (batch.length < pageSize) break;
    await sleep(AVATAR_PAGE_DELAY_MS);
  }
  if (page === maxPages) {
    throw new AvatarLookupError(
      `Could not list all of your avatars within ${maxPages * pageSize} results, so a name cannot be resolved safely.`,
      'too_many_to_search',
      ['Call this tool again with the avtr_ ID.']
    );
  }
  // Exact only. A case-insensitive fallback would let a mistyped "cutie" mutate "Cutie",
  // and the schema advertises an exact name.
  const matches = owned.filter((a) => a.name === avatar);

  if (matches.length === 0) {
    throw new AvatarLookupError(`No avatar of yours is exactly named "${avatar}".`, 'not_found', [
      'List your avatars with vrchat_read using operationId searchAvatars and user="me".',
      'Then call this tool again with the avtr_ ID.',
    ]);
  }
  if (matches.length > 1) {
    const ids = matches.map((m) => m.id).join(', ');
    throw new AvatarLookupError(
      `"${avatar}" matches ${matches.length} of your avatars.`,
      'ambiguous',
      [`Call this tool again with one of these avtr_ IDs: ${ids}.`]
    );
  }
  return matches[0].id!;
}

/** Only fields that actually differ, so an unchanged request never issues a write. */
function changedFieldsOnly(
  current: { name?: unknown; description?: unknown; releaseStatus?: unknown },
  input: AvatarUpdateInput,
  existing: string[],
  tags: string[]
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined && input.name !== current.name) {
    body.name = input.name;
  }
  if (input.description !== undefined && input.description !== current.description) {
    body.description = input.description;
  }
  if (input.releaseStatus !== undefined && input.releaseStatus !== current.releaseStatus) {
    body.releaseStatus = input.releaseStatus;
  }
  if (tags.length !== existing.length || tags.some((tag, i) => tag !== existing[i])) {
    body.tags = tags;
  }
  return body;
}

/**
 * Edit avatar metadata. Only name, description, releaseStatus and content tags are reachable —
 * assetUrl, unityPackageUrl, unityVersion and version are never written, because a bad value
 * there points an avatar at the wrong build with no undo.
 *
 * Tags are merged against a freshly-read list rather than replaced, so unrelated tags (author
 * tags in particular) survive. `updateAvatar` overwrites the whole array otherwise.
 */
export async function updateAvatarMetadata(
  input: AvatarUpdateInput
): Promise<AvatarUpdateOutput> {
  const avatarId = await resolveAvatarId(input.avatar);
  return await withAvatarLock(avatarId, () => applyAvatarUpdate(avatarId, input));
}

async function applyAvatarUpdate(
  avatarId: string,
  input: AvatarUpdateInput
): Promise<AvatarUpdateOutput> {
  const dryRun = input.dryRun ?? false;

  // Read uncached — a stale tag list would silently drop tags on write.
  const current = await callReadOperationParsed('getAvatar', { avatarId });
  if (!current.data) throw new Error('Avatar not found.');

  const existing = (current.data.tags ?? []) as string[];
  const tags = nextTagsFor(existing, input);
  const body = changedFieldsOnly(current.data, input, existing, tags);

  // Chainable output: callers targeting by ID still get the human-readable name back.
  const name = (body.name as string | undefined) ?? (current.data.name as string | undefined);

  if (Object.keys(body).length === 0) {
    return { avatarId, name, dryRun, status: 'unchanged', tags: existing };
  }
  if (dryRun) {
    return { avatarId, name, dryRun, status: 'updated', changes: body, tags };
  }

  // finally, not after: VRChat may apply the update and still return a body the generated
  // parser rejects. Skipping invalidation there would leave a stale cached profile that a
  // retry cannot repair, because the fresh merge read then reports "unchanged".
  let updated;
  try {
    updated = await callWriteOperationParsed('updateAvatar', { avatarId }, body);
  } finally {
    cacheManager.invalidateByTag('avatars:profile');
  }
  return {
    avatarId,
    name: (updated.data?.name as string | undefined) ?? name,
    dryRun,
    status: 'updated',
    changes: body,
    tags: (updated.data?.tags ?? tags) as string[],
  };
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
