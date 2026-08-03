import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/services/api/client.js', () => ({
  callReadOperationParsed: vi.fn(),
  callWriteOperationParsed: vi.fn(),
}));

vi.mock('../../../src/services/cache.js', () => ({
  buildCacheKey: vi.fn(() => 'key'),
  cacheConfig: { groupsTtlMs: 1000, groupsStaleTtlMs: 2000 },
  cacheManager: { getOrSetStale: vi.fn(), invalidateByTag: vi.fn() },
}));

import {
  callReadOperationParsed,
  callWriteOperationParsed,
} from '../../../src/services/api/client.js';
import { updateAvatarMetadata } from '../../../src/services/avatars/index.js';

function mockAvatar(tags: string[], extra: Record<string, unknown> = {}) {
  vi.mocked(callReadOperationParsed).mockResolvedValue({
    data: { id: 'avtr_1', name: 'Cutie', tags, ...extra },
  } as never);
}

describe('updateAvatarMetadata', () => {
  beforeEach(() => {
    vi.mocked(callReadOperationParsed).mockReset();
    vi.mocked(callWriteOperationParsed).mockReset();
    vi.mocked(callWriteOperationParsed).mockResolvedValue({ data: null } as never);
  });

  it('adds content tags without dropping unrelated tags', async () => {
    mockAvatar(['author_tag_dnb', 'content_horror']);

    await updateAvatarMetadata({
      avatarId: 'avtr_1',
      addTags: ['content_sex', 'content_adult'],
    } as never);

    // A blind replace here would wipe author_tag_dnb — that's the whole point of the merge.
    expect(callWriteOperationParsed).toHaveBeenCalledWith(
      'updateAvatar',
      { avatarId: 'avtr_1' },
      { tags: ['author_tag_dnb', 'content_horror', 'content_sex', 'content_adult'] }
    );
  });

  it('clears content tags this build does not know about, keeping author tags', async () => {
    mockAvatar(['author_tag_dnb', 'content_sex', 'content_somethingnew']);

    await updateAvatarMetadata({ avatarId: 'avtr_1', clearContentTags: true } as never);

    expect(callWriteOperationParsed).toHaveBeenCalledWith(
      'updateAvatar',
      { avatarId: 'avtr_1' },
      { tags: ['author_tag_dnb'] }
    );
  });

  it('never writes asset fields even though the endpoint accepts them', async () => {
    mockAvatar([], { description: 'old' });

    await updateAvatarMetadata({ avatarId: 'avtr_1', description: 'new' } as never);

    const body = vi.mocked(callWriteOperationParsed).mock.calls[0][2] as Record<string, unknown>;
    expect(Object.keys(body)).toEqual(['description']);
    for (const forbidden of ['assetUrl', 'unityPackageUrl', 'unityVersion', 'version', 'id']) {
      expect(body).not.toHaveProperty(forbidden);
    }
  });

  it('reports unchanged and skips the write when nothing differs', async () => {
    mockAvatar(['content_sex']);

    const result = await updateAvatarMetadata({
      avatarId: 'avtr_1',
      addTags: ['content_sex'],
    } as never);

    expect(result.status).toBe('unchanged');
    expect(callWriteOperationParsed).not.toHaveBeenCalled();
  });

  it('computes the change but does not write on dryRun', async () => {
    mockAvatar(['content_sex']);

    const result = await updateAvatarMetadata({
      avatarId: 'avtr_1',
      removeTags: ['content_sex'],
      dryRun: true,
    } as never);

    expect(result).toMatchObject({ status: 'updated', dryRun: true, tags: [] });
    expect(callWriteOperationParsed).not.toHaveBeenCalled();
  });
});
