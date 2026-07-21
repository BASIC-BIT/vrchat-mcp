export interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  maxElapsedMs?: number;
}

interface RetryError {
  name?: unknown;
  payload?: unknown;
  retryable?: unknown;
  status?: unknown;
  retryAfter?: unknown;
}

export class RetryDeadlineError extends Error {
  constructor(maxElapsedMs: number) {
    super(`Operation exceeded its ${maxElapsedMs}ms retry deadline.`);
    this.name = 'RetryDeadlineError';
  }
}

function asRetryError(err: unknown): RetryError | null {
  return err && typeof err === 'object' ? (err as RetryError) : null;
}

export function errorStatus(err: unknown): number | undefined {
  const retryError = asRetryError(err);
  const status = retryError?.status;
  if (typeof status === 'number') return status;

  const payload = asRetryError(retryError?.payload);
  return typeof payload?.status === 'number' ? payload.status : undefined;
}

export function retryAfterMs(err: unknown, now = Date.now()): number | undefined {
  const retryAfter = asRetryError(err)?.retryAfter;
  if (typeof retryAfter !== 'string' || !retryAfter) return undefined;

  const seconds = Number(retryAfter);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1_000;

  const date = Date.parse(retryAfter);
  return Number.isNaN(date) ? undefined : Math.max(0, date - now);
}

export function isRetryableRequestError(err: unknown): boolean {
  const retryError = asRetryError(err);
  const status = errorStatus(err);
  if (status === 429 || (typeof status === 'number' && status >= 500)) return true;
  return status === undefined && retryError?.name === 'CallError' && retryError.retryable === true;
}

export function retryDelayMs(attempt: number, options: RetryOptions, err: unknown): number {
  const retryAfter = retryAfterMs(err);
  if (retryAfter !== undefined) return Math.min(retryAfter, options.maxDelayMs);

  const exponential = options.baseDelayMs * 2 ** Math.max(0, attempt - 1);
  const jitter = options.baseDelayMs > 0 ? Math.floor(Math.random() * options.baseDelayMs) : 0;
  return Math.min(exponential + jitter, options.maxDelayMs);
}

export async function sleep(ms: number): Promise<void> {
  if (ms <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function callWithinDeadline<T>(
  operation: () => Promise<T>,
  remainingMs: number | undefined,
  maxElapsedMs: number | undefined
): Promise<T> {
  if (remainingMs === undefined || maxElapsedMs === undefined) return operation();
  if (remainingMs <= 0) throw new RetryDeadlineError(maxElapsedMs);

  let timeout: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_resolve, reject) => {
    timeout = setTimeout(() => reject(new RetryDeadlineError(maxElapsedMs)), remainingMs);
  });

  try {
    return await Promise.race([operation(), deadline]);
  } finally {
    if (timeout !== undefined) clearTimeout(timeout);
  }
}

export async function callWithRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions,
  shouldRetry: (err: unknown) => boolean = isRetryableRequestError
): Promise<{ data: T; attempts: number }> {
  const startedAt = Date.now();
  let attempt = 1;

  for (;;) {
    try {
      const remainingMs =
        options.maxElapsedMs === undefined
          ? undefined
          : options.maxElapsedMs - (Date.now() - startedAt);
      const data = await callWithinDeadline(operation, remainingMs, options.maxElapsedMs);
      return { data, attempts: attempt };
    } catch (err) {
      if (attempt >= options.maxAttempts || !shouldRetry(err)) throw err;

      const delayMs = retryDelayMs(attempt, options, err);
      const elapsedMs = Date.now() - startedAt;
      if (options.maxElapsedMs !== undefined && elapsedMs + delayMs > options.maxElapsedMs) {
        throw err;
      }

      await sleep(delayMs);
      attempt += 1;
    }
  }
}
