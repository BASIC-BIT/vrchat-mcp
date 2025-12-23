import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../../src/config/index.js', () => ({
  getConfig: vi.fn(() => ({
    confirmations: { ttlMs: 10 },
  })),
}));

import {
  createConfirmation,
  consumeConfirmation,
  resetConfirmationsForTest,
} from '../../src/services/confirmations.js';

describe('confirmations service', () => {
  beforeEach(() => {
    resetConfirmationsForTest();
  });

  afterEach(() => {
    resetConfirmationsForTest();
    vi.useRealTimers();
  });

  it('accepts valid confirmations', () => {
    const payload = { id: 1, name: 'alpha' };
    const { confirmId } = createConfirmation('do-thing', payload);
    expect(consumeConfirmation(confirmId, 'do-thing', payload)).toEqual({ ok: true });
  });

  it('rejects action mismatches', () => {
    const payload = { id: 2 };
    const { confirmId } = createConfirmation('create', payload);
    expect(consumeConfirmation(confirmId, 'delete', payload)).toEqual({
      ok: false,
      reason: 'Confirmation token action mismatch.',
    });
  });

  it('rejects payload mismatches', () => {
    const payload = { id: 3 };
    const { confirmId } = createConfirmation('create', payload);
    expect(consumeConfirmation(confirmId, 'create', { id: 4 })).toEqual({
      ok: false,
      reason: 'Confirmation token payload mismatch.',
    });
  });

  it('rejects expired confirmations', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    const payload = { id: 5 };
    const { confirmId } = createConfirmation('create', payload);
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z').getTime() + 20);
    expect(consumeConfirmation(confirmId, 'create', payload)).toEqual({
      ok: false,
      reason: 'Confirmation token not found or expired.',
    });
  });
});
