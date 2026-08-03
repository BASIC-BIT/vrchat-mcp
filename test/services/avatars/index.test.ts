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
      avatar: 'avtr_1',
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

    await updateAvatarMetadata({ avatar: 'avtr_1', clearContentTags: true } as never);

    expect(callWriteOperationParsed).toHaveBeenCalledWith(
      'updateAvatar',
      { avatarId: 'avtr_1' },
      { tags: ['author_tag_dnb'] }
    );
  });

  it('never writes asset fields even though the endpoint accepts them', async () => {
    mockAvatar([], { description: 'old' });

    await updateAvatarMetadata({ avatar: 'avtr_1', description: 'new' } as never);

    const body = vi.mocked(callWriteOperationParsed).mock.calls[0][2] as Record<string, unknown>;
    expect(Object.keys(body)).toEqual(['description']);
    for (const forbidden of ['assetUrl', 'unityPackageUrl', 'unityVersion', 'version', 'id']) {
      expect(body).not.toHaveProperty(forbidden);
    }
  });

  it('reports unchanged and skips the write when nothing differs', async () => {
    mockAvatar(['content_sex']);

    const result = await updateAvatarMetadata({
      avatar: 'avtr_1',
      addTags: ['content_sex'],
    } as never);

    expect(result.status).toBe('unchanged');
    expect(callWriteOperationParsed).not.toHaveBeenCalled();
  });

  it('returns the avatar name so results stay identifiable when targeted by ID', async () => {
    mockAvatar([]);

    const result = await updateAvatarMetadata({
      avatar: 'avtr_1',
      addTags: ['content_sex'],
      dryRun: true,
    } as never);

    expect(result).toMatchObject({ avatarId: 'avtr_1', name: 'Cutie' });
  });

  it('resolves an avatar by name, and refuses when the name is ambiguous', async () => {
    const owned = [
      { id: 'avtr_a', name: 'Cutie' },
      { id: 'avtr_b', name: 'Other' },
    ];
    vi.mocked(callReadOperationParsed)
      .mockResolvedValueOnce({ data: owned } as never)
      .mockResolvedValueOnce({ data: { id: 'avtr_a', name: 'Cutie', tags: [] } } as never);

    await updateAvatarMetadata({ avatar: 'Cutie', addTags: ['content_sex'] } as never);
    expect(callWriteOperationParsed).toHaveBeenCalledWith(
      'updateAvatar',
      { avatarId: 'avtr_a' },
      { tags: ['content_sex'] }
    );

    // Duplicate names must not silently mutate whichever one came back first.
    vi.mocked(callReadOperationParsed).mockResolvedValueOnce({
      data: [
        { id: 'avtr_a', name: 'Twin' },
        { id: 'avtr_b', name: 'Twin' },
      ],
    } as never);
    await expect(
      updateAvatarMetadata({ avatar: 'Twin', addTags: ['content_sex'] } as never)
    ).rejects.toThrow('matches 2 of your avatars');

    vi.mocked(callReadOperationParsed).mockResolvedValueOnce({ data: owned } as never);
    await expect(
      updateAvatarMetadata({ avatar: 'Nope', addTags: ['content_sex'] } as never)
    ).rejects.toThrow('No avatar of yours is exactly named');
  });

  it('refuses a differently-cased name rather than guessing', async () => {
    vi.mocked(callReadOperationParsed).mockResolvedValueOnce({
      data: [{ id: 'avtr_a', name: 'Cutie' }],
    } as never);

    await expect(
      updateAvatarMetadata({ avatar: 'cutie', addTags: ['content_sex'] } as never)
    ).rejects.toThrow('No avatar of yours is exactly named');
    expect(callWriteOperationParsed).not.toHaveBeenCalled();
  });

  it('pages through owned avatars before deciding a name is unambiguous', async () => {
    // The dangerous case: a full first page hides a same-named avatar on the second, so a
    // single-page read would think the name is unique and write to the wrong avatar.
    const page1 = Array.from({ length: 100 }, (_, i) => ({
      id: `avtr_p1_${i}`,
      name: i === 0 ? 'Twin' : `Filler${i}`,
    }));
    vi.mocked(callReadOperationParsed)
      .mockResolvedValueOnce({ data: page1 } as never)
      .mockResolvedValueOnce({ data: [{ id: 'avtr_b', name: 'Twin' }] } as never);

    await expect(
      updateAvatarMetadata({ avatar: 'Twin', addTags: ['content_sex'] } as never)
    ).rejects.toThrow('matches 2 of your avatars');
    expect(callWriteOperationParsed).not.toHaveBeenCalled();
  });

  it('computes the change but does not write on dryRun', async () => {
    mockAvatar(['content_sex']);

    const result = await updateAvatarMetadata({
      avatar: 'avtr_1',
      removeTags: ['content_sex'],
      dryRun: true,
    } as never);

    expect(result).toMatchObject({ status: 'updated', dryRun: true, tags: [] });
    expect(callWriteOperationParsed).not.toHaveBeenCalled();
  });
});
