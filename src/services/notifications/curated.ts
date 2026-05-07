import { callReadOperationParsed } from '../api/client.js';
import { buildCacheKey, cacheConfig, cacheManager } from '../cache.js';
import { mapNotification, type NotificationSummary } from '../../models/notifications.js';
import { nonEmptyString } from '../../utils/strings.js';

const DEFAULT_PAGE_SIZE = 50;
const DEFAULT_MAX_PAGES = 5;

export async function listRecentNotifications(input: {
  type?: string;
  unreadOnly?: boolean;
  pageSize?: number;
  maxPages?: number;
  maxItems?: number;
  after?: string;
}): Promise<{
  notifications: NotificationSummary[];
  page?: {
    pages: number;
    items: number;
    pageSize: number;
    offsetStart: number;
    truncated: boolean;
  };
  truncated: boolean;
  stale: boolean;
  pageSize: number;
  maxPages: number;
}> {
  const pageSize =
    typeof input.pageSize === 'number' ? Math.floor(input.pageSize) : DEFAULT_PAGE_SIZE;
  const maxPages =
    typeof input.maxPages === 'number' ? Math.floor(input.maxPages) : DEFAULT_MAX_PAGES;
  const maxItems =
    typeof input.maxItems === 'number' ? Math.floor(input.maxItems) : pageSize * maxPages;
  const type = nonEmptyString(input.type);
  const unreadOnly = input.unreadOnly === true;
  const after = nonEmptyString(input.after);

  const cacheKey = buildCacheKey('notifications:recent', {
    type,
    unreadOnly,
    pageSize,
    maxPages,
    maxItems,
    after,
  });
  const tags = ['notifications'];
  const { value, stale } = await cacheManager.getOrSetStale(
    cacheKey,
    cacheConfig.notificationsTtlMs,
    cacheConfig.notificationsStaleTtlMs,
    tags,
    async () => {
      const result = await callReadOperationParsed(
        'getNotifications',
        {
          type,
          after,
        },
        {
          page: {
            enabled: true,
            size: pageSize,
            maxPages,
            maxItems,
          },
        },
      );
      const notifications = result.data
        .map(mapNotification)
        .filter((notification): notification is NotificationSummary => Boolean(notification))
        .filter((notification) => (unreadOnly ? notification.seen === false : true));
      return {
        notifications,
        page: result.page,
        truncated: result.page?.truncated ?? false,
      };
    },
  );

  return {
    notifications: value.notifications,
    page: value.page,
    truncated: value.truncated,
    stale,
    pageSize,
    maxPages,
  };
}
