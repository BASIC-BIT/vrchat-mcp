import { WebSocket, type ErrorEvent } from 'undici';
import { authManager } from '../../auth/index.js';
import { getConfig } from '../../config/index.js';
import { logger } from '../../infra/logger.js';
import {
  parsePipelineMessage,
  type PipelineEvent,
  type PipelineMessageData,
} from './events.js';

type PipelineError = ErrorEvent | Error | string;

function formatError(err: PipelineError): string {
  if (typeof err === 'string') return err;
  if ('error' in err && err.error instanceof Error) {
    return err.error.message || err.message;
  }
  if ('message' in err && typeof err.message === 'string') {
    return err.message;
  }
  return 'Unknown error';
}

export interface PipelineConfig {
  enabled: boolean;
  url: string;
  reconnectMs: number;
  userAgent: string;
}

function readPipelineConfig(): PipelineConfig {
  const pipeline = getConfig().pipeline;
  return {
    enabled: pipeline.enabled,
    url: pipeline.url,
    reconnectMs: pipeline.reconnectMs,
    userAgent: pipeline.userAgent,
  };
}

export type PipelineListener = (event: PipelineEvent) => void;

export class PipelineManager {
  private ws: WebSocket | null = null;
  private listeners = new Set<PipelineListener>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private started = false;
  private connecting = false;
  private config: PipelineConfig = readPipelineConfig();
  private unsubscribeAuth: (() => void) | null = null;

  onEvent(listener: PipelineListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  start(): void {
    if (this.started) return;
    this.started = true;
    this.config = readPipelineConfig();
    if (!this.config.enabled) {
      logger.info('Pipeline disabled via config.');
      return;
    }
    this.unsubscribeAuth = authManager.onStatusChange((status) => {
      if (!this.started) return;
      if (status.loggedIn) {
        void this.connectIfPossible();
      } else {
        this.disconnect();
      }
    });
    if (authManager.getStatus().loggedIn) {
      void this.connectIfPossible();
    }
  }

  stop(): void {
    this.started = false;
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
      this.unsubscribeAuth = null;
    }
    this.clearReconnect();
    this.disconnect();
  }

  private clearReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private scheduleReconnect() {
    if (!this.started || !this.config.enabled) return;
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.connectIfPossible();
    }, this.config.reconnectMs);
  }

  private disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private async connectIfPossible() {
    if (this.connecting || this.ws) return;
    if (!this.started || !this.config.enabled) return;
    if (!authManager.getStatus().loggedIn) return;
    this.connecting = true;
    try {
      const authToken =
        (await authManager.getCookieValue('auth', 'https://api.vrchat.cloud')) ??
        (await authManager.getCookieValue('twoFactorAuth', 'https://api.vrchat.cloud'));
      if (!authToken) {
        logger.warn('Pipeline auth token missing; waiting for login.');
        return;
      }
      const url = new URL(this.config.url);
      url.searchParams.set('authToken', authToken);
      const socket = new WebSocket(url.toString(), {
        headers: { 'user-agent': this.config.userAgent },
      });
      this.ws = socket;
      socket.onopen = () => {
        logger.info('Pipeline websocket connected.');
      };
      socket.onmessage = (message) => {
        const event = parsePipelineMessage(message.data as PipelineMessageData);
        if (!event) return;
        for (const listener of this.listeners) {
          listener(event);
        }
      };
      socket.onerror = (err) => {
        logger.warn('Pipeline websocket error', {
          message: formatError(err),
        });
      };
      socket.onclose = () => {
        logger.warn('Pipeline websocket closed');
        this.ws = null;
        if (this.started && this.config.enabled && authManager.getStatus().loggedIn) {
          this.scheduleReconnect();
        }
      };
    } finally {
      this.connecting = false;
    }
  }
}

export const pipelineManager = new PipelineManager();
