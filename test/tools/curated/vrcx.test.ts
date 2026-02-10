import { describe, it, expect, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakeServer } from '../../helpers/fake-server.js';

vi.mock('../../../src/services/vrcx/index.js', () => ({
  getVrcxStatus: vi.fn(),
  getVrcxUserMemo: vi.fn(),
  getVrcxWorldMemo: vi.fn(),
  getVrcxAvatarMemo: vi.fn(),
  listRecentWorldVisits: vi.fn(),
  listRecentInstanceSessionsForActiveUser: vi.fn(),
  getUserRelationshipSummary: vi.fn(),
  listUserRelationshipSessions: vi.fn(),
}));

import { registerCuratedVrcxTools } from '../../../src/tools/curated/vrcx/index.js';
import {
  getUserRelationshipSummary,
  getVrcxAvatarMemo,
  getVrcxStatus,
  getVrcxUserMemo,
  getVrcxWorldMemo,
  listRecentInstanceSessionsForActiveUser,
  listRecentWorldVisits,
  listUserRelationshipSessions,
} from '../../../src/services/vrcx/index.js';

describe('curated vrcx tools', () => {
  it('returns status payload', async () => {
    vi.mocked(getVrcxStatus).mockResolvedValue({
      enabled: true,
      available: false,
      paths: {
        db: { path: null, exists: false, source: 'default' },
        worldDb: { path: null, exists: false, source: 'default' },
        vrcxJson: { path: null, exists: false },
      },
      activeUserId: null,
      userPrefix: null,
      databaseVersion: null,
      warnings: ['VRCX database not found'],
    });

    const server = new FakeServer();
    registerCuratedVrcxTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrcx_db_status');

    const result = await Promise.resolve(tool!.handler({}));
    expect(result).toMatchObject({
      structuredContent: {
        enabled: true,
        available: false,
      },
    });
  });

  it('returns user memo', async () => {
    vi.mocked(getVrcxUserMemo).mockResolvedValue({
      ok: true,
      userId: 'usr_00000000-0000-0000-0000-000000000000',
      editedAt: '2026-01-01T00:00:00.000Z',
      memo: 'hello',
    });

    const server = new FakeServer();
    registerCuratedVrcxTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrcx_memos_user_get');

    const result = await Promise.resolve(
      tool!.handler({ userId: 'usr_00000000-0000-0000-0000-000000000000' })
    );
    expect(result).toMatchObject({
      structuredContent: {
        memo: 'hello',
      },
    });
  });

  it('returns world memo', async () => {
    vi.mocked(getVrcxWorldMemo).mockResolvedValue({
      ok: true,
      worldId: 'wrld_00000000-0000-0000-0000-000000000000',
      editedAt: '2026-01-01T00:00:00.000Z',
      memo: 'world memo',
    });

    const server = new FakeServer();
    registerCuratedVrcxTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrcx_memos_world_get');

    const result = await Promise.resolve(
      tool!.handler({ worldId: 'wrld_00000000-0000-0000-0000-000000000000' })
    );
    expect(result).toMatchObject({
      structuredContent: {
        memo: 'world memo',
      },
    });
  });

  it('returns avatar memo', async () => {
    vi.mocked(getVrcxAvatarMemo).mockResolvedValue({
      ok: true,
      avatarId: 'avtr_00000000-0000-0000-0000-000000000000',
      editedAt: '2026-01-01T00:00:00.000Z',
      memo: 'avatar memo',
    });

    const server = new FakeServer();
    registerCuratedVrcxTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrcx_memos_avatar_get');

    const result = await Promise.resolve(
      tool!.handler({ avatarId: 'avtr_00000000-0000-0000-0000-000000000000' })
    );
    expect(result).toMatchObject({
      structuredContent: {
        memo: 'avatar memo',
      },
    });
  });

  it('returns relationship summary', async () => {
    vi.mocked(getUserRelationshipSummary).mockResolvedValue({
      ok: true,
      query: { userId: 'usr_00000000-0000-0000-0000-000000000000' },
      resolvedBy: 'userId',
      resolvedUserId: 'usr_00000000-0000-0000-0000-000000000000',
      displayName: 'Test',
      lastSeen: '2026-01-01T00:00:00.000Z',
      joinCount: 2,
      timeSpentMs: 3600000,
      timeSpentHours: 1,
      hasData: true,
    });

    const server = new FakeServer();
    registerCuratedVrcxTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrcx_user_relationship_summary');

    const result = await Promise.resolve(
      tool!.handler({ userId: 'usr_00000000-0000-0000-0000-000000000000' })
    );
    expect(result).toMatchObject({
      structuredContent: {
        joinCount: 2,
        timeSpentHours: 1,
      },
    });
  });

  it('returns recent world visits', async () => {
    vi.mocked(listRecentWorldVisits).mockResolvedValue({
      ok: true,
      from: '2026-01-01T00:00:00.000Z',
      limit: 10,
      total: 1,
      truncated: false,
      visits: [
        {
          rowId: 1,
          createdAt: '2026-01-02T00:00:00.000Z',
          location: 'wrld_1:1',
          worldId: 'wrld_1',
          worldName: 'World',
          groupName: null,
          timeMs: 1000,
        },
      ],
    });

    const server = new FakeServer();
    registerCuratedVrcxTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrcx_gamelog_world_visits_recent');

    const result = await Promise.resolve(tool!.handler({ limit: 10, daysBack: 7 }));
    expect(result).toMatchObject({ structuredContent: { total: 1 } });
  });

  it('returns recent instance sessions', async () => {
    vi.mocked(listRecentInstanceSessionsForActiveUser).mockResolvedValue({
      ok: true,
      from: '2026-01-01T00:00:00.000Z',
      limit: 10,
      total: 1,
      truncated: false,
      activeUserId: 'usr_00000000-0000-0000-0000-000000000000',
      sessions: [
        {
          rowId: 1,
          location: 'wrld_1:1',
          joinTime: '2026-01-01T00:00:00.000Z',
          leaveTime: '2026-01-01T01:00:00.000Z',
          durationMs: 3600000,
          worldId: 'wrld_1',
          worldName: 'World',
          groupName: null,
        },
      ],
    });

    const server = new FakeServer();
    registerCuratedVrcxTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrcx_instances_recent');

    const result = await Promise.resolve(tool!.handler({ limit: 10, daysBack: 7 }));
    expect(result).toMatchObject({ structuredContent: { total: 1 } });
  });

  it('returns relationship sessions', async () => {
    vi.mocked(listUserRelationshipSessions).mockResolvedValue({
      ok: true,
      query: { userId: 'usr_00000000-0000-0000-0000-000000000000' },
      resolvedBy: 'userId',
      resolvedUserId: 'usr_00000000-0000-0000-0000-000000000000',
      total: 1,
      limit: 50,
      truncated: false,
      sessions: [
        {
          rowId: 1,
          location: 'wrld_1:1',
          joinTime: '2026-01-01T00:00:00.000Z',
          leaveTime: '2026-01-01T01:00:00.000Z',
          durationMs: 3600000,
          worldId: 'wrld_1',
          worldName: 'World',
          groupName: null,
          displayName: 'Friend',
        },
      ],
    });

    const server = new FakeServer();
    registerCuratedVrcxTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrcx_user_relationship_sessions');

    const result = await Promise.resolve(
      tool!.handler({ userId: 'usr_00000000-0000-0000-0000-000000000000', limit: 50 })
    );
    expect(result).toMatchObject({ structuredContent: { total: 1 } });
  });
});
