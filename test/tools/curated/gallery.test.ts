import { beforeEach, expect, it, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakeServer } from '../../helpers/fake-server.js';

vi.mock('../../../src/core/client.js', () => ({
  callOperation: vi.fn(),
  assertWritesAllowed: vi.fn(),
  CallError: class CallError extends Error {},
}));
import { callOperation, assertWritesAllowed } from '../../../src/core/client.js';
import { registerCuratedGalleryTools } from '../../../src/tools/curated/gallery.js';

function tool(name: string) {
  const server = new FakeServer();
  registerCuratedGalleryTools(server as unknown as McpServer);
  return server.tools.find((entry) => entry.name === name)!;
}

beforeEach(() => vi.resetAllMocks());

it('deletes an exact owned gallery file after fresh ownership and type checks', async () => {
  vi.mocked(callOperation).mockImplementation(({ operationId }) =>
    Promise.resolve({
      url: '',
      data:
        operationId === 'getCurrentUser'
          ? { id: 'usr_me' }
          : operationId === 'getFile'
            ? { id: 'file_target', ownerId: 'usr_me', tags: ['gallery'] }
            : { success: { status_code: 200 } },
    })
  );
  expect(
    await tool('vrchat_gallery_image_delete').handler({ fileId: 'file_target' })
  ).toMatchObject({ structuredContent: { status: 'deleted', fileId: 'file_target' } });
  expect(callOperation).toHaveBeenLastCalledWith({
    operationId: 'deleteFile',
    params: { fileId: 'file_target' },
  });
  expect(assertWritesAllowed).toHaveBeenCalledWith('DELETE');
});

it('lists every image across pages with compact metadata and an exact total', async () => {
  vi.mocked(callOperation).mockImplementation(({ params }) =>
    Promise.resolve({
      url: '',
      data:
        params?.offset === 0
          ? Array.from({ length: 100 }, (_, i) => ({
              id: `file_${i}`,
              name: `Poster ${i}`,
              tags: ['gallery'],
              noisy: 'omit',
            }))
          : [{ id: 'file_last', name: 'Last poster', tags: ['gallery'] }],
    })
  );
  const result = await tool('vrchat_gallery_images').handler({});
  expect(result).toMatchObject({ structuredContent: { total: 101 } });
  expect(JSON.stringify(result)).toContain('Last poster');
  expect(JSON.stringify(result)).not.toContain('noisy');
  expect(callOperation).toHaveBeenLastCalledWith({
    operationId: 'getFiles',
    params: { tag: 'gallery', n: 100, offset: 100 },
  });
  expect(assertWritesAllowed).not.toHaveBeenCalled();
});

it.each([
  { id: 'file_target', ownerId: 'usr_other', tags: ['gallery'] },
  { id: 'file_target', ownerId: 'usr_me', tags: ['icon'] },
  { id: 'file_different', ownerId: 'usr_me', tags: ['gallery'] },
  { id: 'file_target', tags: ['gallery'] },
])('refuses deletion when ownership or gallery identity cannot be verified: %j', async (file) => {
  vi.mocked(callOperation).mockImplementation(({ operationId }) =>
    Promise.resolve({
      url: '',
      data: operationId === 'getCurrentUser' ? { id: 'usr_me' } : file,
    })
  );
  expect(
    await tool('vrchat_gallery_image_delete').handler({ fileId: 'file_target' })
  ).toMatchObject({ isError: true });
  expect(
    vi.mocked(callOperation).mock.calls.some(([input]) => input.operationId === 'deleteFile')
  ).toBe(false);
});

it('blocks deletion before any upstream reads when writes are disabled', async () => {
  vi.mocked(assertWritesAllowed).mockImplementation(() => {
    throw new Error('Writes disabled');
  });
  expect(
    await tool('vrchat_gallery_image_delete').handler({ fileId: 'file_target' })
  ).toMatchObject({ isError: true });
  expect(callOperation).not.toHaveBeenCalled();
});

it('does not report success or retry when deletion fails', async () => {
  vi.mocked(callOperation).mockImplementation(({ operationId }) => {
    if (operationId === 'deleteFile') return Promise.reject(new Error('Connection lost'));
    return {
      url: '',
      data:
        operationId === 'getCurrentUser'
          ? { id: 'usr_me' }
          : { id: 'file_target', ownerId: 'usr_me', tags: ['gallery'] },
    };
  });
  expect(
    await tool('vrchat_gallery_image_delete').handler({ fileId: 'file_target' })
  ).toMatchObject({ isError: true });
  expect(
    vi.mocked(callOperation).mock.calls.filter(([input]) => input.operationId === 'deleteFile')
  ).toHaveLength(1);
});

it('returns an empty gallery without requiring write access', async () => {
  vi.mocked(callOperation).mockResolvedValue({ url: '', data: [] });
  expect(await tool('vrchat_gallery_images').handler({})).toMatchObject({
    structuredContent: { images: [], total: 0 },
  });
});

it('fails explicitly when pagination repeats instead of silently truncating', async () => {
  vi.mocked(callOperation).mockResolvedValue({
    url: '',
    data: Array.from({ length: 100 }, (_, i) => ({ id: `file_${i}`, tags: ['gallery'] })),
  });
  expect(await tool('vrchat_gallery_images').handler({})).toMatchObject({ isError: true });
  expect(callOperation).toHaveBeenCalledTimes(2);
});

it('returns the latest usable image URL and omits deleted versions', async () => {
  vi.mocked(callOperation).mockResolvedValue({
    url: '',
    data: [
      {
        id: 'file_image',
        tags: ['gallery'],
        versions: [
          { version: 1, file: { url: 'https://example.com/old', status: 'complete' } },
          { version: 2, file: { url: 'https://example.com/current', status: 'complete' } },
          {
            version: 3,
            deleted: true,
            file: { url: 'https://example.com/deleted', status: 'complete' },
          },
        ],
      },
    ],
  });
  expect(await tool('vrchat_gallery_images').handler({})).toMatchObject({
    structuredContent: {
      images: [{ fileId: 'file_image', imageUrl: 'https://example.com/current' }],
      total: 1,
    },
  });
});

it.each([
  ['vrchat_gallery_images', { offset: 100 }],
  ['vrchat_gallery_image_delete', { fileId: '../file_target' }],
  ['vrchat_gallery_image_delete', { fileId: 'file_target', groupId: 'grp_other' }],
])('rejects unsupported inputs for %s', async (name, args) => {
  expect(await tool(name as string).handler(args)).toMatchObject({ isError: true });
  expect(callOperation).not.toHaveBeenCalled();
});
