import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/auth/index.js', () => ({
  authManager: {
    onStatusChange: vi.fn(),
    getStatus: vi.fn(),
    getCookieValue: vi.fn(),
  },
}));

vi.mock('../../../src/config/index.js', () => ({
  getConfig: vi.fn(() => ({
    pipeline: {
      enabled: false,
      url: 'wss://example.test',
      reconnectMs: 1000,
      userAgent: 'ua',
    },
  })),
}));

vi.mock('../../../src/infra/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

type FakeWebSocketCtor = {
  new (url: string, options?: unknown): {
    url: string;
    options: unknown;
    onopen: (() => void) | null;
    onmessage: ((message: { data: unknown }) => void) | null;
    onerror: ((err: unknown) => void) | null;
    onclose: (() => void) | null;
    close: () => void;
  };
  instances: Array<{
    url: string;
    options: unknown;
    onopen: (() => void) | null;
    onmessage: ((message: { data: unknown }) => void) | null;
    onerror: ((err: unknown) => void) | null;
    onclose: (() => void) | null;
    close: () => void;
  }>;
};

const { fakeWebSocketRef } = vi.hoisted(() => ({
  fakeWebSocketRef: { current: null as FakeWebSocketCtor | null },
}));

const getFakeWebSocket = () => {
  const ws = fakeWebSocketRef.current;
  if (!ws) {
    throw new Error('FakeWebSocket not initialized');
  }
  return ws;
};

vi.mock('undici', () => {
  class WS {
    static instances: WS[] = [];
    url: string;
    options: unknown;
    onopen: (() => void) | null = null;
    onmessage: ((message: { data: unknown }) => void) | null = null;
    onerror: ((err: unknown) => void) | null = null;
    onclose: (() => void) | null = null;
    close = vi.fn();

    constructor(url: string, options?: unknown) {
      this.url = url;
      this.options = options;
      WS.instances.push(this);
    }
  }
  fakeWebSocketRef.current = WS;
  return { WebSocket: WS };
});

import { authManager } from '../../../src/auth/index.js';
import { getConfig } from '../../../src/config/index.js';
import { logger } from '../../../src/infra/logger.js';
import { PipelineManager } from '../../../src/services/pipeline/manager.js';

describe('pipeline manager', () => {
  beforeEach(() => {
    vi.mocked(authManager.onStatusChange).mockReset();
    vi.mocked(authManager.getStatus).mockReset();
    vi.mocked(authManager.getCookieValue).mockReset();
    vi.mocked(getConfig).mockReset();
    vi.mocked(logger.info).mockReset();
    vi.mocked(logger.warn).mockReset();
    getFakeWebSocket().instances = [];
  });

  it('does not start when disabled', () => {
    vi.mocked(getConfig).mockReturnValue({
      pipeline: {
        enabled: false,
        url: 'wss://example.test',
        reconnectMs: 1000,
        userAgent: 'ua',
      },
    });

    const manager = new PipelineManager();
    manager.start();

    expect(logger.info).toHaveBeenCalledWith('Pipeline disabled via config.');
    expect(authManager.onStatusChange).not.toHaveBeenCalled();
  });

  it('subscribes to auth changes and stops cleanly when enabled', () => {
    const unsubscribe = vi.fn();
    vi.mocked(getConfig).mockReturnValue({
      pipeline: {
        enabled: true,
        url: 'wss://example.test',
        reconnectMs: 1000,
        userAgent: 'ua',
      },
    });
    vi.mocked(authManager.onStatusChange).mockReturnValue(unsubscribe);
    vi.mocked(authManager.getStatus).mockReturnValue({ loggedIn: false });

    const manager = new PipelineManager();
    manager.start();
    expect(authManager.onStatusChange).toHaveBeenCalled();

    manager.stop();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it('warns when auth token missing', async () => {
    const unsubscribe = vi.fn();
    vi.mocked(getConfig).mockReturnValue({
      pipeline: {
        enabled: true,
        url: 'wss://example.test',
        reconnectMs: 1000,
        userAgent: 'ua',
      },
    });
    vi.mocked(authManager.onStatusChange).mockReturnValue(unsubscribe);
    vi.mocked(authManager.getStatus).mockReturnValue({ loggedIn: true });
    vi.mocked(authManager.getCookieValue).mockResolvedValue(undefined);

    const manager = new PipelineManager();
    manager.start();

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(logger.warn).toHaveBeenCalledWith('Pipeline auth token missing; waiting for login.');
  });

  it('connects websocket and dispatches messages', async () => {
    vi.mocked(getConfig).mockReturnValue({
      pipeline: {
        enabled: true,
        url: 'wss://example.test/pipeline',
        reconnectMs: 1000,
        userAgent: 'ua',
      },
    });
    vi.mocked(authManager.onStatusChange).mockReturnValue(() => {});
    vi.mocked(authManager.getStatus).mockReturnValue({ loggedIn: true });
    vi.mocked(authManager.getCookieValue).mockResolvedValue('token');

    const manager = new PipelineManager();
    const listener = vi.fn();
    manager.onEvent(listener);
    manager.start();

    await new Promise((resolve) => setTimeout(resolve, 0));
    const socket = getFakeWebSocket().instances[0];
    expect(socket).toBeTruthy();
    expect(socket.url).toContain('authToken=token');
    socket.onopen?.();
    expect(logger.info).toHaveBeenCalledWith('Pipeline websocket connected.');

    socket.onmessage?.({
      data: JSON.stringify({ type: 'friend-online', content: { userId: 'usr_1' } }),
    });
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'friend-online', content: { userId: 'usr_1' } }),
    );
  });

  it('reconnects after close when enabled', async () => {
    vi.useFakeTimers();
    vi.mocked(getConfig).mockReturnValue({
      pipeline: {
        enabled: true,
        url: 'wss://example.test/pipeline',
        reconnectMs: 10,
        userAgent: 'ua',
      },
    });
    vi.mocked(authManager.onStatusChange).mockReturnValue(() => {});
    vi.mocked(authManager.getStatus).mockReturnValue({ loggedIn: true });
    vi.mocked(authManager.getCookieValue).mockResolvedValue('token');

    const manager = new PipelineManager();
    manager.start();
    await Promise.resolve();
    expect(getFakeWebSocket().instances).toHaveLength(1);

    getFakeWebSocket().instances[0]?.onclose?.();
    vi.advanceTimersByTime(11);
    await Promise.resolve();
    expect(getFakeWebSocket().instances.length).toBeGreaterThan(1);
    vi.useRealTimers();
  });
});
