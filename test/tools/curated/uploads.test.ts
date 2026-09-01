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
vi.mock('../../../src/services/groups/index.js', () => ({
  checkGroupAllowed: vi.fn(() => ({ ok: true })),
  resolveGroupId: vi.fn(),
}));
vi.mock('../../../src/services/uploads/index.js', () => ({ uploadGroupImage: vi.fn() }));

import { assertWritesAllowed } from '../../../src/core/client.js';
import { checkGroupAllowed, resolveGroupId } from '../../../src/services/groups/index.js';
import { uploadGroupImage } from '../../../src/services/uploads/index.js';
import { registerCuratedUploadTools } from '../../../src/tools/curated/uploads.js';

function tool() {
  const server = new FakeServer();
  registerCuratedUploadTools(server as unknown as McpServer);
  return server.tools.find((entry) => entry.name === 'vrchat_group_image_upload')!;
}

describe('curated group image upload tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(assertWritesAllowed).mockImplementation(() => undefined);
    vi.mocked(checkGroupAllowed).mockReturnValue({ ok: true });
    vi.mocked(resolveGroupId).mockResolvedValue({ ok: true, groupId: 'grp_1', resolvedBy: 'id' });
    vi.mocked(uploadGroupImage).mockReset();
    vi.mocked(uploadGroupImage).mockResolvedValue({
      image: {
        bytes: Buffer.from('png'),
        byteSize: 3,
        fileName: 'poster.png',
        width: 2048,
        height: 1152,
      },
      file: { id: 'file_1', name: 'poster.png', mimeType: 'image/png', version: 1 },
    });
  });

  it('guards writes, resolves and allowlists the group before reading the image', async () => {
    const order: string[] = [];
    vi.mocked(assertWritesAllowed).mockImplementation(() => order.push('writes'));
    vi.mocked(resolveGroupId).mockImplementation(() => {
      order.push('resolve');
      return Promise.resolve({ ok: true, groupId: 'grp_1', resolvedBy: 'shortCode' });
    });
    vi.mocked(checkGroupAllowed).mockImplementation(() => {
      order.push('allowlist');
      return { ok: true };
    });
    vi.mocked(uploadGroupImage).mockImplementation(() => {
      order.push('file');
      return Promise.resolve({
        image: { bytes: Buffer.from('x'), byteSize: 1, fileName: 'x.png', width: 65, height: 65 },
        file: { id: 'file_1' },
      });
    });

    const result = await tool().handler({ shortCode: 'TEST', imagePath: 'C:\\uploads\\x.png' });

    expect(order).toEqual(['writes', 'resolve', 'allowlist', 'file']);
    expect(result).toMatchObject({
      structuredContent: { status: 'uploaded', groupId: 'grp_1', fileId: 'file_1' },
    });
  });

  it('does not resolve, read, or upload when writes are disabled', async () => {
    vi.mocked(assertWritesAllowed).mockImplementation(() => {
      throw new Error('Write operations are disabled');
    });
    const result = await tool().handler({ groupId: 'grp_1', imagePath: 'C:\\uploads\\x.png' });
    expect(result).toMatchObject({ isError: true });
    expect(resolveGroupId).not.toHaveBeenCalled();
    expect(uploadGroupImage).not.toHaveBeenCalled();
  });

  it('does not read or upload when the resolved group is denied', async () => {
    vi.mocked(checkGroupAllowed).mockReturnValue({ ok: false, reason: 'not allowed' });
    const result = await tool().handler({ groupId: 'grp_1', imagePath: 'C:\\uploads\\x.png' });
    expect(result).toMatchObject({ isError: true });
    expect(uploadGroupImage).not.toHaveBeenCalled();
  });

  it('registers one write tool with a described strict path input', () => {
    const registered = tool();
    expect(registered.config.annotations).toEqual({ readOnlyHint: false });
    const schema = registered.config.inputSchema as {
      shape: { imagePath: { description?: string } };
    };
    expect(schema.shape.imagePath.description).toContain('Absolute path');
  });
});
