import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/core/readTools.js', () => ({
  callReadOperation: vi.fn(),
}));

import { callReadOperation } from '../../../src/core/readTools.js';
import { cacheManager } from '../../../src/services/cache.js';
import { listRecentNotifications } from '../../../src/services/notifications/curated.js';

describe('notifications curated service', () => {
  beforeEach(() => {
    cacheManager.invalidateAll();
    vi.mocked(callReadOperation).mockReset();
  });

  it('filters unread notifications and maps summary fields', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: [
        {
          id: 'ntf_1',
          type: 'invite',
          message: 'Hello',
          created_at: '2025-12-22T00:00:00Z',
          senderUserId: 'usr_1',
          seen: false,
        },
        {
          id: 'ntf_2',
          type: 'invite',
          message: 'Seen',
          created_at: '2025-12-22T00:05:00Z',
          senderUserId: 'usr_2',
          seen: true,
        },
      ],
      page: { pages: 1, items: 2, pageSize: 50, offsetStart: 0, truncated: false },
    });

    const result = await listRecentNotifications({ unreadOnly: true });

    expect(result.notifications).toHaveLength(1);
    expect(result.notifications[0]).toMatchObject({
      id: 'ntf_1',
      type: 'invite',
      message: 'Hello',
      createdAt: '2025-12-22T00:00:00Z',
      senderUserId: 'usr_1',
      seen: false,
    });
    expect(result.pageSize).toBe(50);
    expect(result.maxPages).toBe(5);
    expect(result.truncated).toBe(false);
  });

  it('omits empty optional filters', async () => {
    vi.mocked(callReadOperation).mockResolvedValueOnce({
      data: [],
      page: { pages: 1, items: 0, pageSize: 10, offsetStart: 0, truncated: false },
    });

    await listRecentNotifications({ type: '', after: ' ', pageSize: 10, maxPages: 1 });

    expect(callReadOperation).toHaveBeenCalledWith(
      'getNotifications',
      { type: undefined, after: undefined },
      expect.any(Object),
    );
  });
});
