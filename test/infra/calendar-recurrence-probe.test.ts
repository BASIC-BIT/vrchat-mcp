import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('calendar recurrence live probe recovery', () => {
  it('captures a created parent for every successful HTTP status', () => {
    const source = readFileSync('scripts/probes/calendar-recurrence.ts', 'utf8');
    expect(source).toMatch(
      /operationId === 'createGroupCalendarEvent' &&\s*result\.status >= 200 &&\s*result\.status < 300/
    );
  });
});
