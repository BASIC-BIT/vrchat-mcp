import { describe, expect, it } from 'vitest';
import { validateRecurrence } from '../../../src/services/events/recurrence.js';
const weekly = {
  frequency: 'weekly',
  interval: 1,
  timezone: 'America/Indiana/Indianapolis',
  daysOfWeek: ['FR'],
};
describe('recurrence contract', () => {
  it('preserves local end date and allows indefinite recurrence', () => {
    const end = { type: 'afterDate', date: '2026-12-31T23:59:00' };
    expect(validateRecurrence({ ...weekly, end }).end).toEqual(end);
    expect(validateRecurrence(weekly).end).toBeUndefined();
  });
  it.each([
    { ...weekly, timezone: 'not-a-timezone' },
    { ...weekly, end: { type: 'afterDate' } },
    { ...weekly, end: { type: 'afterOccurrences' } },
    { ...weekly, end: { type: 'afterOccurrences', count: 0 } },
    { ...weekly, end: { type: 'afterDate', date: '2026-02-30T12:00:00' } },
    { ...weekly, end: { type: 'afterDate', date: '2026-12-31T23:59:00Z' } },
    { ...weekly, frequency: 'daily' },
    { ...weekly, daysOfWeek: ['FR', 'FR'] },
  ])('rejects invalid schedule %j', (input) => {
    expect(() => validateRecurrence(input)).toThrow();
  });
});
