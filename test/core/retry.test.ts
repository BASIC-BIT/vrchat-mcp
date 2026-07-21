import { afterEach, describe, expect, it, vi } from 'vitest';
import { CallError } from '../../src/core/client.js';
import {
  callWithRetry,
  isRetryableRequestError,
  RetryDeadlineError,
} from '../../src/core/retry.js';

describe('request retry policy', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not retry deterministic status-less CallErrors', async () => {
    const operation = vi.fn().mockRejectedValue(new CallError('Missing required path param'));

    await expect(
      callWithRetry(operation, { maxAttempts: 4, baseDelayMs: 0, maxDelayMs: 0 })
    ).rejects.toThrow('Missing required path param');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('retries status-less CallErrors explicitly marked as transient', async () => {
    const networkError = new CallError(
      'Network or fetch error',
      undefined,
      undefined,
      undefined,
      true
    );
    const operation = vi.fn().mockRejectedValueOnce(networkError).mockResolvedValueOnce('ok');

    await expect(
      callWithRetry(operation, { maxAttempts: 4, baseDelayMs: 0, maxDelayMs: 0 })
    ).resolves.toEqual({ data: 'ok', attempts: 2 });
    expect(isRetryableRequestError(networkError)).toBe(true);
  });

  it('enforces maxElapsedMs while an attempt is still in flight', async () => {
    vi.useFakeTimers();
    const operation = vi.fn(() => new Promise<string>(() => undefined));
    const result = callWithRetry(operation, {
      maxAttempts: 4,
      baseDelayMs: 1_000,
      maxDelayMs: 30_000,
      maxElapsedMs: 100,
    });

    const rejection = expect(result).rejects.toBeInstanceOf(RetryDeadlineError);
    await vi.advanceTimersByTimeAsync(100);

    await rejection;
    expect(operation).toHaveBeenCalledTimes(1);
  });
});
