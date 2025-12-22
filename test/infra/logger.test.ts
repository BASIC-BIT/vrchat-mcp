import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('logger', () => {
  const prevLevel = process.env.VRCHAT_MCP_LOG_LEVEL;

  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    if (prevLevel === undefined) {
      delete process.env.VRCHAT_MCP_LOG_LEVEL;
    } else {
      process.env.VRCHAT_MCP_LOG_LEVEL = prevLevel;
    }
    vi.restoreAllMocks();
  });

  it('honors log level', async () => {
    process.env.VRCHAT_MCP_LOG_LEVEL = 'warn';
    const { logger } = await import('../../src/infra/logger.js');
    logger.info('nope');
    logger.warn('yes');
    const calls = (console.error as unknown as { mock: { calls: unknown[] } }).mock.calls;
    expect(calls.length).toBe(1);
    expect(String(calls[0][0])).toContain('WARN');
  });
});
