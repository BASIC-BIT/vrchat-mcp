import { describe, it, expect } from 'vitest';
import { mapNotification, parseNotificationDetails } from '../../src/models/notifications.js';

describe('notification model helpers', () => {
  it('parses JSON details strings', () => {
    expect(parseNotificationDetails('{"foo":1}')).toEqual({ foo: 1 });
  });

  it('returns raw detail strings when not JSON', () => {
    expect(parseNotificationDetails('hello')).toBe('hello');
  });

  it('maps notification fields with parsed details', () => {
    const mapped = mapNotification({
      id: 'ntf_1',
      type: 'invite',
      message: 'Hi',
      created_at: '2025-12-22T00:00:00Z',
      senderUserId: 'usr_1',
      seen: false,
      details: '{"foo":"bar"}',
    });

    expect(mapped).toMatchObject({
      id: 'ntf_1',
      type: 'invite',
      message: 'Hi',
      createdAt: '2025-12-22T00:00:00Z',
      senderUserId: 'usr_1',
      seen: false,
      details: { foo: 'bar' },
    });
  });
});
