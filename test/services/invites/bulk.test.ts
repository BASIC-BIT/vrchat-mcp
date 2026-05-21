import { afterEach, describe, expect, it, vi } from 'vitest';
import { executeResolvedUserWrites } from '../../../src/services/invites/bulk.js';

describe('bulk invite writes', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('waits once between two actual sends', async () => {
    vi.useFakeTimers();
    const send = vi.fn().mockResolvedValue({ id: 'ntf_1' });

    const pending = executeResolvedUserWrites({
      targets: [
        { target: 'usr_1', userId: 'usr_1' },
        { target: 'usr_2', userId: 'usr_2' },
      ],
      dryRun: false,
      continueOnError: true,
      retry: { maxAttempts: 1, baseDelayMs: 0, maxDelayMs: 0 },
      interRequestDelayMs: 500,
      send,
    });

    await Promise.resolve();
    await Promise.resolve();
    expect(send).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(499);
    expect(send).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    const result = await pending;

    expect(send).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({ totalTargets: 2, sent: 2, failed: 0 });
  });
});
