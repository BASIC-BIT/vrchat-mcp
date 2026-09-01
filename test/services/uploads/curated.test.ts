import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/core/client.js', () => ({
  CallError: class CallError extends Error {},
  uploadGalleryImageMultipart: vi.fn(),
}));
vi.mock('../../../src/services/uploads/localPng.js', () => ({
  readValidatedStaticPng: vi.fn(),
}));

import { uploadGalleryImageMultipart } from '../../../src/core/client.js';
import { uploadGalleryImage } from '../../../src/services/uploads/curated.js';
import { readValidatedStaticPng } from '../../../src/services/uploads/localPng.js';

describe('gallery image upload service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(readValidatedStaticPng).mockResolvedValue({
      bytes: Buffer.from('png'),
      byteSize: 3,
      fileName: 'poster.png',
      width: 1024,
      height: 512,
    });
  });

  it('validates the local PNG before upload and returns only bounded metadata', async () => {
    vi.mocked(uploadGalleryImageMultipart).mockResolvedValue({
      url: 'https://api.vrchat.cloud/api/1/file/image',
      data: {
        id: 'file_1',
        ownerId: 'usr_1',
        name: 'poster.png',
        mimeType: 'image/png',
        extension: '.png',
        versions: [{ version: 1 }, { version: 2 }],
        arbitraryUpstreamField: 'not returned',
      },
    });

    const result = await uploadGalleryImage({ imagePath: 'C:\\uploads\\poster.png' }, [
      'C:\\uploads',
    ]);

    expect(readValidatedStaticPng).toHaveBeenCalledWith('C:\\uploads\\poster.png', ['C:\\uploads']);
    expect(uploadGalleryImageMultipart).toHaveBeenCalledWith('poster.png', Buffer.from('png'));
    expect(result.file).toEqual({
      id: 'file_1',
      ownerId: 'usr_1',
      name: 'poster.png',
      mimeType: 'image/png',
      extension: '.png',
      version: 2,
    });
    expect(result.file).not.toHaveProperty('arbitraryUpstreamField');
  });

  it('treats a successful response without a file ID as indeterminate', async () => {
    vi.mocked(uploadGalleryImageMultipart).mockResolvedValue({
      url: 'https://api.vrchat.cloud/api/1/file/image',
      data: { name: 'poster.png' },
    });

    await expect(
      uploadGalleryImage({ imagePath: 'C:\\uploads\\poster.png' }, ['C:\\uploads'])
    ).rejects.toThrow('may have succeeded; do not retry automatically');
  });
});
