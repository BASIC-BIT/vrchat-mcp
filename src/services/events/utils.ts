import type { z } from 'zod';
import { schemas } from '../../generated/vrchat-schemas.js';
import { parseWithSchema } from '../../utils/schema.js';

const CalendarEventSchema = schemas.CalendarEvent.partial();
export type CalendarEventRecord = z.infer<typeof CalendarEventSchema>;
const CalendarEventArraySchema = CalendarEventSchema.array();
const PaginatedCalendarEventListSchema = schemas.PaginatedCalendarEventList.extend({
  results: CalendarEventArraySchema.optional(),
});

export function parseIsoDate(value: string | null | undefined): Date | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return new Date(`${value}T00:00:00`);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return null;
  return parsed;
}

export function toMonthKey(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}

export function getMonthKeys(start: Date, end: Date): string[] {
  const keys: string[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cursor <= endMonth) {
    keys.push(toMonthKey(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return keys;
}

export function parseEventTime(
  value: string | number | Date | null | undefined,
): number | null {
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.floor(value);
  }
  if (value instanceof Date) return value.valueOf();
  return null;
}

export function parseCalendarEvents(value: unknown): CalendarEventRecord[] {
  if (Array.isArray(value)) {
    return parseWithSchema(CalendarEventArraySchema, value, 'calendarEvents');
  }
  const parsed = parseWithSchema(
    PaginatedCalendarEventListSchema,
    value ?? {},
    'calendarEvents',
  );
  if (Array.isArray(parsed.results)) {
    return parseWithSchema(
      CalendarEventArraySchema,
      parsed.results,
      'calendarEvents.results',
    );
  }
  return [];
}
