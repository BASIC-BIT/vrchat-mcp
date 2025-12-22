import { z } from 'zod';

export const NotificationSummarySchema = z.object({
  id: z.string(),
  type: z.string().optional(),
  message: z.string().optional(),
  createdAt: z.string().optional(),
  senderUserId: z.string().optional(),
  seen: z.boolean().optional(),
  details: z.any().optional(),
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

export function parseNotificationDetails(raw: unknown): unknown {
  if (typeof raw !== 'string') return raw;
  const trimmed = raw.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return raw;
  try {
    return JSON.parse(trimmed);
  } catch {
    return raw;
  }
}

export function mapNotification(entry: unknown): NotificationSummary | null {
  if (!entry || typeof entry !== 'object') return null;
  const record = entry as Record<string, unknown>;
  const id = typeof record.id === 'string' ? record.id : '';
  if (!id) return null;
  const type = typeof record.type === 'string' ? record.type : undefined;
  const message = typeof record.message === 'string' ? record.message : undefined;
  const createdAt = typeof record.created_at === 'string' ? record.created_at : undefined;
  const senderUserId =
    typeof record.senderUserId === 'string' ? record.senderUserId : undefined;
  const seen = typeof record.seen === 'boolean' ? record.seen : undefined;
  const details = parseNotificationDetails(record.details);
  return { id, type, message, createdAt, senderUserId, seen, details };
}
