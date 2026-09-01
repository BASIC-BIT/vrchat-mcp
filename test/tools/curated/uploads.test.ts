import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakeServer } from '../../helpers/fake-server.js';

vi.mock('../../../src/config/index.js', () => ({
  getConfig: vi.fn(() => ({ uploads: { allowedRoots: ['C:\\uploads'] } })),
}));
vi.mock('../../../src/core/client.js', () => ({
  assertWritesAllowed: vi.fn(),
  CallError: class CallError extends Error {
    payload?: Record<string, unknown>;
  },
}));
vi.mock('../../../src/services/uploads/index.js', () => ({ uploadGalleryImage: vi.fn() }));

import { assertWritesAllowed } from '../../../src/core/client.js';
import { uploadGalleryImage } from '../../../src/services/uploads/index.js';
import { registerCuratedUploadTools } from '../../../src/tools/curated/uploads.js';

function registerTools() {
  const server = new FakeServer();
  registerCuratedUploadTools(server as unknown as McpServer);
  return server;
}

function tool() {
  return registerTools().tools.find((entry) => entry.name === 'vrchat_gallery_image_upload')!;
}

describe('curated gallery image upload tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(assertWritesAllowed).mockImplementation(() => undefined);
    vi.mocked(uploadGalleryImage).mockReset();
    vi.mocked(uploadGalleryImage).mockResolvedValue({
      image: {
        bytes: Buffer.from('png'),
        byteSize: 3,
        fileName: 'poster.png',
        width: 2048,
        height: 1152,
      },
      file: {
        id: 'file_1',
        ownerId: 'usr_1',
        name: 'poster.png',
        mimeType: 'image/png',
        extension: '.png',
        version: 1,
      },
    });
  });

  it('registers only the account-gallery tool with a strict path-only schema', () => {
    const server = registerTools();
    expect(server.tools.map((entry) => entry.name)).toEqual(['vrchat_gallery_image_upload']);

    const registered = server.tools[0]!;
    expect(registered.config.annotations).toEqual({ readOnlyHint: false });
    const schema = registered.config.inputSchema as {
      shape: { imagePath: { description?: string } };
      parse: (value: unknown) => unknown;
    };
    expect(Object.keys(schema.shape)).toEqual(['imagePath']);
    expect(schema.shape.imagePath.description).toContain('Absolute path');
    expect(() => schema.parse({ imagePath: 'C:\\uploads\\x.png', groupId: 'grp_1' })).toThrow();
  });

  it('uploads without resolving, fetching, or authorizing a group', async () => {
    const result = await tool().handler({ imagePath: 'C:\\uploads\\poster.png' });

    expect(assertWritesAllowed).toHaveBeenCalledWith('POST');
    expect(uploadGalleryImage).toHaveBeenCalledWith({ imagePath: 'C:\\uploads\\poster.png' }, [
      'C:\\uploads',
    ]);
    expect(result).toMatchObject({
      structuredContent: {
        fileId: 'file_1',
        ownerId: 'usr_1',
        name: 'poster.png',
        mimeType: 'image/png',
        extension: '.png',
        version: 1,
        image: {
          fileName: 'poster.png',
          byteSize: 3,
          width: 2048,
          height: 1152,
        },
      },
    });
    expect(JSON.stringify(result)).not.toContain('C:\\\\uploads');
    const structured = (result as { structuredContent?: Record<string, unknown> })
      .structuredContent;
    expect(structured).not.toHaveProperty('groupId');
  });

  it('refuses writes before file access or an upstream request', async () => {
    vi.mocked(assertWritesAllowed).mockImplementation(() => {
      throw new Error('Write operations are disabled');
    });

    const result = await tool().handler({ imagePath: 'C:\\uploads\\x.png' });

    expect(result).toMatchObject({ isError: true });
    expect(uploadGalleryImage).not.toHaveBeenCalled();
  });

  it.each([
    ['groupId', { imagePath: 'C:\\uploads\\x.png', groupId: 'grp_1' }],
    ['shortCode', { imagePath: 'C:\\uploads\\x.png', shortCode: 'TEST' }],
    ['tag', { imagePath: 'C:\\uploads\\x.png', tag: 'icon' }],
    ['purpose', { imagePath: 'C:\\uploads\\x.png', purpose: 'sticker' }],
    ['unknown field', { imagePath: 'C:\\uploads\\x.png', arbitrary: true }],
  ])('rejects %s before file access or an upstream request', async (_label, args) => {
    const result = await tool().handler(args);

    expect(result).toMatchObject({ isError: true });
    expect(uploadGalleryImage).not.toHaveBeenCalled();
  });
});
