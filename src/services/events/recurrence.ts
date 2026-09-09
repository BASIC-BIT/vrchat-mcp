import type { z } from 'zod';
import { schemas } from '../../generated/vrchat-schemas.js';
function isLocalDateTime(value: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?$/.exec(value);
  if (!m) return false;
  const [year, month, day, hour, minute, second] = m.slice(1).map(Number);
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(hour, minute, second, 0);
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    date.getUTCHours() === hour &&
    date.getUTCMinutes() === minute &&
    date.getUTCSeconds() === second
  );
}
export function validateRecurrence(
  input: unknown
): z.infer<typeof schemas.CalendarEventRecurrence> {
  const value = schemas.CalendarEventRecurrence.parse(input);
  if (!(value.timezone.includes('/') || value.timezone === 'UTC'))
    throw new Error('Use a named timezone such as America/Indiana/Indianapolis.');
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value.timezone });
  } catch {
    throw new Error('The recurrence timezone is not recognized.');
  }
  if (value.daysOfWeek !== undefined && value.frequency !== 'weekly')
    throw new Error('daysOfWeek is only supported for weekly recurrence.');
  if (value.daysOfWeek && new Set(value.daysOfWeek).size !== value.daysOfWeek.length)
    throw new Error('daysOfWeek must not contain duplicates.');
  if (value.end?.type === 'afterOccurrences' && value.end.count === undefined)
    throw new Error('afterOccurrences requires a positive count.');
  if (value.end?.type === 'afterDate' && (!value.end.date || !isLocalDateTime(value.end.date)))
    throw new Error('afterDate requires a real local datetime without Z or an offset.');
  return value;
}
