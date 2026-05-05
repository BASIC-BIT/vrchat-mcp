import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakeServer } from '../../helpers/fake-server.js';

vi.mock('../../../src/services/notifications/index.js', () => ({
  listRecentNotifications: vi.fn(),
}));

import { registerCuratedNotificationTools } from '../../../src/tools/curated/notifications.js';
import { listRecentNotifications } from '../../../src/services/notifications/index.js';

describe('curated notification tools', () => {
  beforeEach(() => {
    vi.mocked(listRecentNotifications).mockReset();
  });

  it('lists recent notifications', async () => {
    vi.mocked(listRecentNotifications).mockResolvedValue({
      notifications: [
        {
          id: 'not_1',
          type: 'invite',
          message: 'Invite',
          createdAt: '2025-12-22T00:00:00Z',
          senderUserId: 'usr_1',
          seen: false,
          details: { worldId: 'wrld_1' },
        },
      ],
      page: { pages: 1, items: 1, pageSize: 50, offsetStart: 0, truncated: false },
      truncated: false,
      stale: false,
      pageSize: 50,
      maxPages: 5,
    });
    const server = new FakeServer();
    registerCuratedNotificationTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_notifications_recent');
    const result = await tool!.handler({});

    expect(result).toMatchObject({
      structuredContent: {
        totalNotifications: 1,
        notifications: [
          {
            id: 'not_1',
            type: 'invite',
            message: 'Invite',
            createdAt: '2025-12-22T00:00:00Z',
            senderUserId: 'usr_1',
            seen: false,
            details: { worldId: 'wrld_1' },
          },
        ],
      },
    });
  });

  it('returns tool error on failure', async () => {
    vi.mocked(listRecentNotifications).mockRejectedValue(new Error('No access'));
    const server = new FakeServer();
    registerCuratedNotificationTools(server as unknown as McpServer);
    const tool = server.tools.find((entry) => entry.name === 'vrchat_notifications_recent');
    const result = await tool!.handler({});

    expect(result).toMatchObject({
      isError: true,
    });
    const content = (result as { content: { text?: string }[] }).content;
    expect(content[0]?.text).toContain('No access');
  });
});
