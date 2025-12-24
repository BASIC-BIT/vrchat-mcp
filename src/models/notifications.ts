import { z } from 'zod';
import { schemas } from '../generated/vrchat-schemas.js';
import {
  JsonValueSchema,
  isJsonValue,
  parseJsonText,
  type JsonValue,
} from '../utils/json.js';

export const NotificationSummarySchema = z.object({
  id: schemas.NotificationID,
  type: z.string().optional(),
  message: z.string().optional(),
  createdAt: z.string().optional(),
  senderUserId: schemas.UserID.optional(),
  seen: z.boolean().optional(),
  details: JsonValueSchema.optional(),
});

export const NotificationPageSchema = z.object({
  pages: z.number().int().min(0),
  items: z.number().int().min(0),
  pageSize: z.number().int().min(1),
  offsetStart: z.number().int().min(0),
  truncated: z.boolean(),
});

export const NotificationsRecentInputSchema = z.object({
  type: z.string().optional(),
  unreadOnly: z.boolean().optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  maxPages: z.number().int().min(1).max(50).optional(),
  maxItems: z.number().int().min(1).optional(),
  after: z.string().optional(),
});

export const NotificationsRecentOutputSchema = z.object({
  pageSize: z.number().int().min(1),
  maxPages: z.number().int().min(1),
  totalNotifications: z.number().int().min(0),
  truncated: z.boolean(),
  stale: z.boolean(),
  page: NotificationPageSchema.optional(),
  notifications: z.array(NotificationSummarySchema),
});

export type NotificationSummary = z.infer<typeof NotificationSummarySchema>;

export function parseNotificationDetails(raw: JsonValue): JsonValue {
  if (typeof raw !== 'string') return raw;
  const trimmed = raw.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return raw;
  const parsed = parseJsonText(trimmed);
  return parsed ?? raw;
}

export function mapNotification(
  notification: Partial<z.infer<typeof schemas.Notification>>,
): NotificationSummary | null {
  const id = notification.id ?? '';
  if (!id) return null;
  return {
    id,
    type: notification.type ?? undefined,
    message: notification.message ?? undefined,
    createdAt: notification.created_at ?? undefined,
    senderUserId: notification.senderUserId ?? undefined,
    seen: notification.seen ?? undefined,
    details: isJsonValue(notification.details)
      ? parseNotificationDetails(notification.details)
      : undefined,
  };
}
