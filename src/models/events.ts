import { z } from 'zod';

export const EventListShapeSchema = z.object({
  fields: z.array(z.string()).optional(),
  compact: z.boolean().optional(),
  maxArrayLength: z.number().int().positive().optional(),
});

export const EventsUpcomingInputSchema = EventListShapeSchema.extend({
  from: z.string().optional(),
  windowHours: z.number().int().min(1).max(168).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  maxPages: z.number().int().min(1).max(20).optional(),
  maxItems: z.number().int().min(1).optional(),
});

export const EventsPageSchema = z.object({
  pages: z.number().int().min(0),
  items: z.number().int().min(0),
  pageSize: z.number().int().min(1),
  offsetStart: z.number().int().min(0),
  truncated: z.boolean(),
});

export const EventsUpcomingOutputSchema = z.object({
  from: z.string(),
  to: z.string(),
  windowHours: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  maxPages: z.number().int().min(1),
  maxItems: z.number().int().min(1),
  totalEvents: z.number().int().min(0),
  truncated: z.boolean(),
  segments: z.array(
    z.object({
      date: z.string(),
      page: EventsPageSchema.optional(),
    }),
  ),
  events: z.array(z.any()),
});

export const EventsSearchInputSchema = EventListShapeSchema.extend({
  searchTerm: z.string(),
  utcOffset: z.number().int().optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  maxPages: z.number().int().min(1).max(20).optional(),
  maxItems: z.number().int().min(1).optional(),
});

export const EventsSearchOutputSchema = z.object({
  searchTerm: z.string(),
  utcOffset: z.number().int().optional(),
  pageSize: z.number().int().min(1),
  maxPages: z.number().int().min(1),
  totalEvents: z.number().int().min(0),
  truncated: z.boolean(),
  page: EventsPageSchema.optional(),
  events: z.array(z.any()),
});

export const CalendarEventCreateSchema = z.object({
  groupId: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  accessType: z.enum(['group', 'public']).optional(),
  sendCreationNotification: z.boolean().optional(),
  imageId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  platforms: z.array(z.string()).optional(),
  roleIds: z.array(z.string()).optional(),
  parentId: z.string().optional(),
  isDraft: z.boolean().optional(),
  featured: z.boolean().optional(),
  guestEarlyJoinMinutes: z.number().int().optional(),
  hostEarlyJoinMinutes: z.number().int().optional(),
  closeInstanceAfterEndMinutes: z.number().int().optional(),
  usesInstanceOverflow: z.boolean().optional(),
  confirmId: z.string().optional(),
});

export const CalendarEventUpdateSchema = z.object({
  groupId: z.string(),
  calendarId: z.string(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  startsAt: z.string().min(1).optional(),
  endsAt: z.string().min(1).optional(),
  accessType: z.enum(['group', 'public']).optional(),
  sendCreationNotification: z.boolean().optional(),
  imageId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  platforms: z.array(z.string()).optional(),
  roleIds: z.array(z.string()).optional(),
  parentId: z.string().optional(),
  isDraft: z.boolean().optional(),
  featured: z.boolean().optional(),
  guestEarlyJoinMinutes: z.number().int().optional(),
  hostEarlyJoinMinutes: z.number().int().optional(),
  closeInstanceAfterEndMinutes: z.number().int().optional(),
  usesInstanceOverflow: z.boolean().optional(),
  confirmId: z.string().optional(),
});

export const CalendarEventDeleteSchema = z.object({
  groupId: z.string(),
  calendarId: z.string(),
  confirmId: z.string().optional(),
});

export const CalendarEventWriteOutputSchema = z.object({
  status: z.enum(['confirm_required', 'created', 'updated', 'deleted']),
  confirmId: z.string().optional(),
  expiresAt: z.string().optional(),
  event: z.any().optional(),
  result: z.any().optional(),
});

export type EventsUpcomingInput = z.infer<typeof EventsUpcomingInputSchema>;
export type EventsSearchInput = z.infer<typeof EventsSearchInputSchema>;
export type CalendarEventCreateInput = z.infer<typeof CalendarEventCreateSchema>;
export type CalendarEventUpdateInput = z.infer<typeof CalendarEventUpdateSchema>;
export type CalendarEventDeleteInput = z.infer<typeof CalendarEventDeleteSchema>;
