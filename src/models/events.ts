import { z } from 'zod';
import { schemas } from '../generated/vrchat-schemas.js';

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
  events: z.array(schemas.CalendarEvent.partial()),
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
  events: z.array(schemas.CalendarEvent.partial()),
});

export const CalendarEventCreateSchema = schemas.CreateCalendarEventRequest.extend({
  groupId: schemas.GroupID,
  accessType: schemas.CreateCalendarEventRequest.shape.accessType
    .optional()
    .default('group'),
  sendCreationNotification:
    schemas.CreateCalendarEventRequest.shape.sendCreationNotification
      .optional()
      .default(false),
});

export const CalendarEventUpdateSchema = schemas.UpdateCalendarEventRequest.extend({
  groupId: schemas.GroupID,
  calendarId: schemas.CalendarID,
  sendCreationNotification:
    schemas.UpdateCalendarEventRequest.shape.sendCreationNotification.optional(),
});

export const CalendarEventDeleteSchema = z.object({
  groupId: schemas.GroupID,
  calendarId: schemas.CalendarID,
});

export const CalendarEventWriteOutputSchema = z.object({
  status: z.enum(['created', 'updated', 'deleted']),
  event: schemas.CalendarEvent.optional(),
  result: schemas.Success.optional(),
});

export type EventsUpcomingInput = z.infer<typeof EventsUpcomingInputSchema>;
export type EventsSearchInput = z.infer<typeof EventsSearchInputSchema>;
export type CalendarEventCreateInput = z.infer<typeof CalendarEventCreateSchema>;
export type CalendarEventUpdateInput = z.infer<typeof CalendarEventUpdateSchema>;
export type CalendarEventDeleteInput = z.infer<typeof CalendarEventDeleteSchema>;
