import type { z } from 'zod';
import type { schemas } from '../../../src/generated/vrchat-schemas.js';
import { mockSchema } from './builders.js';
import { ids } from './ids.js';

type CalendarEventSchema = z.infer<typeof schemas.CalendarEvent>;

export const calendarEvents: CalendarEventSchema[] = [
  mockSchema<CalendarEventSchema>('CalendarEvent', {
    id: ids.calendar.publicEvent,
    title: 'Public Event',
    startsAt: '2025-12-30T12:00:00Z',
    endsAt: '2025-12-30T13:00:00Z',
    description: 'General event',
    category: 'social',
    accessType: 'public',
  }),
];

export const calendarFeatured: CalendarEventSchema[] = [
  mockSchema<CalendarEventSchema>('CalendarEvent', {
    id: ids.calendar.featured,
    title: 'Featured Event',
    startsAt: '2025-12-30T14:00:00Z',
    endsAt: '2025-12-30T15:00:00Z',
    description: 'Featured event',
    category: 'showcase',
    accessType: 'public',
  }),
];

export const calendarFollowed: CalendarEventSchema[] = [
  mockSchema<CalendarEventSchema>('CalendarEvent', {
    id: ids.calendar.followed,
    title: 'Followed Event',
    startsAt: '2025-12-30T16:00:00Z',
    endsAt: '2025-12-30T17:00:00Z',
    description: 'Followed event',
    category: 'social',
    accessType: 'public',
  }),
];

export const calendarGroupEvents: Record<string, CalendarEventSchema[]> = {
  [ids.groups.mock]: [
    mockSchema<CalendarEventSchema>('CalendarEvent', {
      id: ids.calendar.group,
      title: 'Group Event',
      groupId: ids.groups.mock,
      startsAt: '2025-12-30T18:00:00Z',
      endsAt: '2025-12-30T19:00:00Z',
      description: 'Group event description',
      category: 'meetup',
      accessType: 'group',
    }),
  ],
};
