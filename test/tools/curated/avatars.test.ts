import { describe, it, expect, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakeServer } from '../../helpers/fake-server.js';

vi.mock('../../../src/config/index.js', () => ({
  getConfig: vi.fn(() => ({
    vrcx: { enabled: true, databasePath: '', worldDbPath: '' },
  })),
}));

vi.mock('../../../src/core/readTools.js', () => ({
  shapeReadData: vi.fn((value: unknown) => value),
}));

vi.mock('../../../src/services/avatars/index.js', () => ({
  getAvatarProfile: vi.fn(),
}));

vi.mock('../../../src/services/vrcx/index.js', () => ({
  getVrcxAvatarMemo: vi.fn().mockResolvedValue({
    ok: false,
    status: 'disabled',
    reason: 'disabled',
  }),
}));

import { registerCuratedAvatarTools } from '../../../src/tools/curated/avatars.js';
import { getAvatarProfile } from '../../../src/services/avatars/index.js';
import { getVrcxAvatarMemo } from '../../../src/services/vrcx/index.js';

describe('curated avatar tools', () => {
  it('returns avatar profile and includes VRCX memo when available', async () => {
    vi.mocked(getAvatarProfile).mockResolvedValue({
      avatarId: 'avtr_1',
      stale: false,
      avatar: { id: 'avtr_1', name: 'Mock Avatar' },
    });
    vi.mocked(getVrcxAvatarMemo).mockResolvedValue({
      ok: true,
      avatarId: 'avtr_1',
      editedAt: '2026-01-01T00:00:00.000Z',
      memo: 'hello',
    });

    const server = new FakeServer();
    registerCuratedAvatarTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_avatar_profile');
    const result = await tool!.handler({ avatarId: 'avtr_1' });

    expect(result).toMatchObject({
      structuredContent: {
        avatarId: 'avtr_1',
        avatar: { id: 'avtr_1', name: 'Mock Avatar' },
        vrcxMemo: { memo: 'hello' },
      },
    });
  });
});
