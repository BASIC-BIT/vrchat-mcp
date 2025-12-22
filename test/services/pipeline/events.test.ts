import { describe, it, expect } from 'vitest';
import { parsePipelineMessage } from '../../../src/services/pipeline/events.js';

describe('pipeline events', () => {
  it('parses double-encoded content', () => {
    const payload = JSON.stringify({
      type: 'friend-online',
      content: JSON.stringify({ userId: 'usr_1', location: 'offline' }),
    });
    const event = parsePipelineMessage(payload);
    expect(event).toBeTruthy();
    expect(event?.type).toBe('friend-online');
    expect(event?.content).toEqual({ userId: 'usr_1', location: 'offline' });
  });

  it('accepts buffer and preserves string content', () => {
    const payload = JSON.stringify({ type: 'friend-active', content: 'hello' });
    const event = parsePipelineMessage(Buffer.from(payload, 'utf8'));
    expect(event?.type).toBe('friend-active');
    expect(event?.content).toBe('hello');
  });

  it('accepts ArrayBuffer views', () => {
    const payload = JSON.stringify({ type: 'friend-update', content: { userId: 'usr_2' } });
    const bytes = new TextEncoder().encode(payload);
    const event = parsePipelineMessage(bytes);
    expect(event?.type).toBe('friend-update');
  });

  it('returns null when missing type', () => {
    const payload = JSON.stringify({ content: {} });
    const event = parsePipelineMessage(payload);
    expect(event).toBeNull();
  });

  it('returns null on invalid JSON', () => {
    const event = parsePipelineMessage('{not-json');
    expect(event).toBeNull();
  });
});
