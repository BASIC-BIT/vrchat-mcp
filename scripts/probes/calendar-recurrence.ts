/** Opt-in protocol probe. Requires separately authorized disposable draft mutations. */
import { writeFileSync } from 'node:fs';
import { CalendarEventCreateSchema } from '../../src/models/events.js';
import {
  buildCalendarCreateRequest,
  updateCalendarEvent,
} from '../../src/services/events/curated.js';
import { schemas } from '../../src/generated/vrchat-schemas.js';
import { authManager } from '../../src/auth/index.js';
import { callOperation } from '../../src/core/client.js';
const [groupId, expectedOwner, receipt, mode] = process.argv.slice(2);
const curated = mode === '--curated';
if (!groupId?.startsWith('grp_') || !expectedOwner?.startsWith('usr_') || !receipt) {
  throw new Error(
    'Pass authorized group ID, expected owner ID, and external recovery receipt path.'
  );
}
type RecordData = Record<string, unknown>;
function record(value: unknown): RecordData {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Expected object');
  return value as RecordData;
}
const observations: unknown[] = [];
const ids = new Set<string>();
let parentId: string | undefined;
let halted = false;
function save() {
  writeFileSync(
    receipt,
    JSON.stringify({ groupId, parentId, ids: [...ids], observations }, null, 2)
  );
}
function selected(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(selected);
  if (!value || typeof value !== 'object') return value;
  const data = record(value);
  if (Array.isArray(data.results)) return { results: selected(data.results) };
  return Object.fromEntries(
    [
      'id',
      'ownerId',
      'memberCount',
      'occurrenceKind',
      'seriesId',
      'title',
      'description',
      'startsAt',
      'endsAt',
      'recurrence',
      'isDraft',
      'deletedAt',
    ]
      .filter((k) => k in data)
      .map((k) => [k, data[k]])
  );
}
async function call(operationId: string, params: RecordData, body?: unknown): Promise<unknown> {
  const write = /^(create|update|delete)/.test(operationId);
  if (write) await new Promise((resolve) => setTimeout(resolve, 2000));
  try {
    const result = await callOperation({
      operationId,
      params,
      body,
      options: { rawResponse: true },
    });
    // Save the returned creation identity before later assertions or parsing.
    if (operationId === 'createGroupCalendarEvent' && result.status >= 200 && result.status < 300) {
      const id = record(result.data).id;
      if (typeof id === 'string') {
        parentId = id;
        ids.add(id);
        save();
      }
    }
    observations.push({
      at: new Date().toISOString(),
      operationId,
      status: result.status,
      data: selected(result.data),
    });
    save();
    if (!result.status || result.status < 200 || result.status >= 300)
      throw Object.assign(new Error('Unexpected status'), { status: result.status });
    return result.data;
  } catch (error) {
    const status = error instanceof Error && 'status' in error ? error.status : undefined;
    halted = [401, 403, 429].includes(Number(status)) || (write && status === undefined);
    observations.push({ operationId, errorStatus: status ?? 'indeterminate' });
    save();
    throw new Error(
      `${operationId} failed (${typeof status === 'number' ? status : 'indeterminate'}); no mutation retry`
    );
  }
}
const read = (id: string) => call('getGroupCalendarEvent', { groupId, calendarId: id });
async function children(date = '2026-11-01T00:00:00Z') {
  const response = record(
    await call('getGroupCalendarEvents', {
      groupId,
      date,
      n: 100,
      offset: 0,
    })
  );
  if (!Array.isArray(response.results)) throw new Error('Expected calendar results');
  const matches = response.results.map(record).filter((e) => e.seriesId === parentId);
  for (const child of matches)
    if (typeof child.id === 'string') {
      ids.add(child.id);
      save();
    }
  return matches;
}
await authManager.init();
const user = record(await call('getCurrentUser', {}));
const group = record(await call('getGroup', { groupId }));
if (
  user.id !== expectedOwner ||
  group.ownerId !== user.id ||
  group.id !== groupId ||
  group.memberCount !== 1
)
  throw new Error('Ownership/member count precondition failed');
try {
  if (curated) {
    const rawCreated = await call(
      'createGroupCalendarEvent',
      { groupId },
      buildCalendarCreateRequest(
        CalendarEventCreateSchema.parse({
          groupId,
          accessType: 'group',
          category: 'other',
          isDraft: true,
          title: 'TEMP curated recurrence contract',
          description: 'Disposable validation.',
          startsAt: '2026-10-31T13:00:00Z',
          endsAt: '2026-10-31T13:30:00Z',
          sendCreationNotification: false,
          occurrenceKind: 'series',
          recurrence: {
            frequency: 'daily',
            interval: 1,
            timezone: 'America/Indiana/Indianapolis',
            end: { type: 'afterOccurrences', count: 2 },
          },
        })
      )
    );
    const created = schemas.CalendarEvent.partial().parse(rawCreated);
    if (!parentId) throw new Error('Created ID unavailable');
    const parent = record(await read(parentId));
    if (
      created.id !== parentId ||
      parent.id !== parentId ||
      parent.ownerId !== groupId ||
      parent.isDraft !== true ||
      parent.occurrenceKind !== 'series'
    )
      throw new Error('Unexpected created parent provenance');
    const rows = [...(await children('2026-10-01T00:00:00Z')), ...(await children())];
    const unique = [...new Map(rows.map((row) => [row.id, row])).values()];
    const expectedStarts = ['2026-10-31T13:00:00.000Z', '2026-11-01T14:00:00.000Z'];
    const actualStarts = unique.map((row) => new Date(String(row.startsAt)).toISOString()).sort();
    if (
      unique.length !== 2 ||
      unique.some(
        (row) =>
          row.ownerId !== groupId ||
          row.isDraft !== true ||
          row.occurrenceKind !== 'occurrence' ||
          row.seriesId !== parentId
      )
    )
      throw new Error('DST child scope differs from the required two verified draft occurrences');
    observations.push({
      dstStarts: actualStarts,
      expectedStarts,
      dstMatchesExpected: JSON.stringify(actualStarts) === JSON.stringify(expectedStarts),
      intendedLocalTime: '09:00',
      expectedUtcOffsets: ['-04:00', '-05:00'],
    });
    save();
    await new Promise((resolve) => setTimeout(resolve, 2000));
    try {
      await updateCalendarEvent(
        groupId,
        parentId,
        { title: 'TEMP curated verified', sendCreationNotification: false },
        'series'
      );
    } catch (error) {
      const status = error instanceof Error && 'status' in error ? error.status : undefined;
      halted = status === undefined || [401, 403, 429].includes(Number(status));
      throw error;
    }
    const edited = record(await read(parentId));
    if (edited.title !== 'TEMP curated verified')
      throw new Error('Curated title update not stored');
    try {
      await updateCalendarEvent(groupId, parentId, { recurrence: null }, 'series');
      throw new Error('Unexpected null acceptance');
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('clearing')) {
        const status = error instanceof Error && 'status' in error ? error.status : undefined;
        halted = status === undefined || [401, 403, 429].includes(Number(status));
        throw error;
      }
      observations.push({ localNullRejected: true });
      save();
    }
  } else {
    await call(
      'createGroupCalendarEvent',
      { groupId },
      {
        accessType: 'group',
        category: 'other',
        isDraft: true,
        title: 'TEMP recurrence contract',
        description: 'Disposable API validation.',
        startsAt: '2026-11-01T14:00:00Z',
        endsAt: '2026-11-01T14:30:00Z',
        sendCreationNotification: false,
        occurrenceKind: 'series',
        recurrence: {
          frequency: 'daily',
          interval: 1,
          timezone: 'America/Indiana/Indianapolis',
          end: { type: 'afterOccurrences', count: 3 },
        },
      }
    );
    if (!parentId) throw new Error('Created parent ID unavailable; recover from receipt');
    const parent = record(await read(parentId));
    if (parent.occurrenceKind !== 'series' || parent.ownerId !== groupId || parent.isDraft !== true)
      throw new Error('Unexpected created parent');
    const rows = await children();
    if (rows.length < 2)
      throw new Error('Draft lacks children; do not publish without separate authorization');
    if (
      rows.some(
        (row) =>
          typeof row.id !== 'string' ||
          row.ownerId !== groupId ||
          row.isDraft !== true ||
          row.occurrenceKind !== 'occurrence'
      )
    )
      throw new Error('Unexpected child provenance');
    const childId = String(rows[0].id),
      siblingId = String(rows[1].id);
    const update = (id: string, body: RecordData) =>
      call(
        'updateGroupCalendarEvent',
        { groupId, calendarId: id },
        { ...body, sendCreationNotification: false }
      );
    await update(childId, { title: 'TEMP edited child' });
    await read(childId);
    await read(siblingId);
    await read(parentId);
    await update(parentId, { description: 'TEMP edited parent' });
    await read(parentId);
    await read(childId);
    await read(siblingId);
    await update(parentId, { title: 'TEMP omitted recurrence' });
    await read(parentId);
    await update(parentId, {
      recurrence: {
        frequency: 'daily',
        interval: 1,
        timezone: 'America/Indiana/Indianapolis',
        end: { type: 'afterDate', date: '2026-11-03T09:00:00' },
      },
    });
    await read(parentId);
    await children();
    try {
      await update(parentId, { recurrence: null });
    } catch (error) {
      if (!halted) await read(parentId);
      throw error;
    }
    await read(parentId);
  }
} catch (error) {
  if (curated) {
    const status = error instanceof Error && 'status' in error ? error.status : undefined;
    observations.push({ curatedFailureStatus: status ?? 'indeterminate' });
    save();
  }
  throw error;
} finally {
  if (!halted && parentId) {
    await children();
    const parent = record(await read(parentId));
    if (parent.id !== parentId || parent.ownerId !== groupId || parent.isDraft !== true)
      await Promise.reject(new Error('Cleanup owner/draft verification failed'));
    await call('deleteGroupCalendarEvent', { groupId, calendarId: parentId });
    const active = [...(await children()), ...(await children('2026-10-01T00:00:00Z'))].filter(
      (e) => !e.deletedAt
    );
    observations.push({ cleanupRemaining: active.length });
    save();
    if (active.length)
      await Promise.reject(new Error('Active children remain; stop for explicit recovery'));
  }
  console.error(JSON.stringify({ parentId, receipt, halted }));
}
