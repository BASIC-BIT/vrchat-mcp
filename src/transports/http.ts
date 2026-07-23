import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import type { Server as NodeHttpServer } from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { localhostHostValidation } from '@modelcontextprotocol/sdk/server/middleware/hostHeaderValidation.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import express, {
  type ErrorRequestHandler,
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import { logger } from '../infra/logger.js';

const HTTP_HOST = '127.0.0.1';
const MIN_BEARER_TOKEN_LENGTH = 32;

interface HttpSession {
  server: McpServer;
  transport: StreamableHTTPServerTransport;
}

export interface HttpTransportOptions {
  port: number;
  path: string;
  bearerToken: string;
  maxSessions: number;
  rateLimitPerMinute: number;
  serverFactory: () => Promise<McpServer>;
  releaseServer?: (server: McpServer) => void;
}

export interface HttpTransportHandle {
  host: typeof HTTP_HOST;
  port: number;
  path: string;
  url: string;
  sessionCount: () => number;
  close: () => Promise<void>;
}

function jsonRpcError(res: Response, status: number, message: string): void {
  res.status(status).json({
    jsonrpc: '2.0',
    error: { code: -32000, message },
    id: null,
  });
}

function validateOptions(options: HttpTransportOptions): void {
  if (!Number.isInteger(options.port) || options.port < 0 || options.port > 65535) {
    throw new Error('HTTP port must be an integer from 0 to 65535.');
  }
  if (
    options.path.length < 2 ||
    options.path.length > 128 ||
    !/^\/[A-Za-z0-9._~/-]*$/.test(options.path) ||
    /^\/healthz\/?$/i.test(options.path)
  ) {
    throw new Error('HTTP path must be a non-reserved URL path using safe characters.');
  }
  if (options.bearerToken.length < MIN_BEARER_TOKEN_LENGTH) {
    throw new Error(
      `VRCHAT_MCP_HTTP_BEARER_TOKEN must be at least ${MIN_BEARER_TOKEN_LENGTH} characters.`
    );
  }
  if (!Number.isInteger(options.maxSessions) || options.maxSessions < 1) {
    throw new Error('HTTP maxSessions must be a positive integer.');
  }
  if (!Number.isInteger(options.rateLimitPerMinute) || options.rateLimitPerMinute < 1) {
    throw new Error('HTTP rateLimitPerMinute must be a positive integer.');
  }
}

function tokenDigest(value: string): Buffer {
  return createHash('sha256').update(value, 'utf8').digest();
}

function bearerTokenMatches(header: string | undefined, expectedDigest: Buffer): boolean {
  if (!header?.startsWith('Bearer ')) return false;
  const candidate = header.slice('Bearer '.length);
  return timingSafeEqual(tokenDigest(candidate), expectedDigest);
}

function headerValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isRequestTooLarge(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  return (error as { status?: unknown }).status === 413;
}

function createRateLimiter(
  limit: number
): (req: Request, res: Response, next: NextFunction) => void {
  const windows = new Map<string, { startedAt: number; count: number }>();
  const windowMs = 60_000;

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip ?? 'loopback';
    const current = windows.get(key);
    if (!current || now - current.startedAt >= windowMs) {
      windows.set(key, { startedAt: now, count: 1 });
      next();
      return;
    }
    current.count += 1;
    if (current.count > limit) {
      res.setHeader('Retry-After', '60');
      jsonRpcError(res, 429, 'Too many requests');
      return;
    }
    next();
  };
}

async function listen(app: Express, port: number): Promise<NodeHttpServer> {
  return await new Promise<NodeHttpServer>((resolve, reject) => {
    const server = app.listen(port, HTTP_HOST);
    const onError = (error: Error) => {
      server.off('listening', onListening);
      reject(error);
    };
    const onListening = () => {
      server.off('error', onError);
      resolve(server);
    };
    server.once('error', onError);
    server.once('listening', onListening);
  });
}

export async function startHttpTransport(
  options: HttpTransportOptions
): Promise<HttpTransportHandle> {
  validateOptions(options);
  const expectedTokenDigest = tokenDigest(options.bearerToken);
  const sessions = new Map<string, HttpSession>();
  const app = express();
  let boundPort = options.port;
  let closing = false;
  let pendingInitializations = 0;

  app.disable('x-powered-by');
  app.use(localhostHostValidation());
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    const origin = req.headers.origin;
    if (!origin) {
      next();
      return;
    }
    try {
      const parsed = new URL(origin);
      const allowedHostname =
        parsed.hostname === '127.0.0.1' ||
        parsed.hostname === 'localhost' ||
        parsed.hostname === '[::1]';
      const allowedPort = Number(parsed.port || '80') === boundPort;
      if (parsed.protocol === 'http:' && allowedHostname && allowedPort) {
        next();
        return;
      }
    } catch {
      // Rejected below.
    }
    jsonRpcError(res, 403, 'Invalid Origin header');
  });

  app.get('/healthz', (_req, res) => {
    res.json({ status: closing ? 'stopping' : 'ok' });
  });

  app.use(options.path, createRateLimiter(options.rateLimitPerMinute));
  app.use(options.path, (req, res, next) => {
    if (!bearerTokenMatches(req.headers.authorization, expectedTokenDigest)) {
      res.setHeader('WWW-Authenticate', 'Bearer');
      jsonRpcError(res, 401, 'Unauthorized');
      return;
    }
    next();
  });
  app.use(options.path, express.json({ limit: '256kb', strict: true }));

  const releaseSession = (sessionId: string, session: HttpSession): void => {
    if (sessions.get(sessionId) !== session) return;
    sessions.delete(sessionId);
    options.releaseServer?.(session.server);
  };

  const handleSessionRequest = async (
    session: HttpSession,
    req: Request,
    res: Response,
    parsedBody?: unknown
  ): Promise<void> => {
    try {
      await session.transport.handleRequest(req, res, parsedBody);
    } catch (error) {
      logger.warn('Failed to handle an established MCP HTTP session.', {
        message: error instanceof Error ? error.message : String(error),
      });
      if (!res.headersSent) jsonRpcError(res, 500, 'Internal server error');
    }
  };

  const initializeSession = async (req: Request, res: Response): Promise<void> => {
    let server: McpServer | undefined;
    let session: HttpSession | undefined;
    let initializedSessionId: string | undefined;
    pendingInitializations += 1;
    try {
      server = await options.serverFactory();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sessionId) => {
          initializedSessionId = sessionId;
          if (session) sessions.set(sessionId, session);
        },
        onsessionclosed: (sessionId) => {
          if (session) releaseSession(sessionId, session);
        },
      });
      session = { server, transport };
      transport.onclose = () => {
        const sessionId = transport.sessionId ?? initializedSessionId;
        if (sessionId && session) releaseSession(sessionId, session);
      };
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      if (session) {
        const sessionId = session.transport.sessionId ?? initializedSessionId;
        if (sessionId) releaseSession(sessionId, session);
        else options.releaseServer?.(session.server);
        await session.transport.close().catch(() => undefined);
      } else if (server) {
        options.releaseServer?.(server);
      }
      logger.error('Failed to handle MCP HTTP initialization.', {
        message: error instanceof Error ? error.message : String(error),
      });
      if (!res.headersSent) jsonRpcError(res, 500, 'Internal server error');
    } finally {
      pendingInitializations -= 1;
    }
  };

  app.post(options.path, async (req, res) => {
    if (closing) {
      jsonRpcError(res, 503, 'Server is shutting down');
      return;
    }

    const requestedSessionId = headerValue(req.headers['mcp-session-id']);
    const existing = requestedSessionId ? sessions.get(requestedSessionId) : undefined;
    if (existing) {
      await handleSessionRequest(existing, req, res, req.body);
      return;
    }

    if (requestedSessionId) {
      jsonRpcError(res, 404, 'MCP session not found');
      return;
    }
    if (!isInitializeRequest(req.body)) {
      jsonRpcError(res, 400, 'Invalid or missing MCP session');
      return;
    }
    if (sessions.size + pendingInitializations >= options.maxSessions) {
      jsonRpcError(res, 429, 'Maximum MCP session count reached');
      return;
    }

    await initializeSession(req, res);
  });

  const handleEstablishedSession = async (req: Request, res: Response): Promise<void> => {
    const sessionId = headerValue(req.headers['mcp-session-id']);
    const session = sessionId ? sessions.get(sessionId) : undefined;
    if (!session) {
      jsonRpcError(
        res,
        sessionId ? 404 : 400,
        sessionId ? 'MCP session not found' : 'Missing MCP session'
      );
      return;
    }
    await handleSessionRequest(session, req, res);
  };

  app.get(options.path, handleEstablishedSession);
  app.delete(options.path, handleEstablishedSession);
  const jsonErrorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    void _next;
    const requestError: unknown = error;
    logger.warn('Rejected an invalid MCP HTTP request body.', {
      message: requestError instanceof Error ? requestError.message : String(requestError),
    });
    const status = isRequestTooLarge(requestError) ? 413 : 400;
    if (!res.headersSent) {
      jsonRpcError(
        res,
        status,
        status === 413 ? 'Request body too large' : 'Invalid JSON request body'
      );
    }
  };
  app.use(jsonErrorHandler);

  const httpServer = await listen(app, options.port);
  const address = httpServer.address();
  if (!address || typeof address === 'string') {
    await new Promise<void>((resolve) => httpServer.close(() => resolve()));
    throw new Error('Unable to determine HTTP listening port.');
  }
  boundPort = address.port;
  httpServer.headersTimeout = 10_000;
  httpServer.requestTimeout = 30_000;
  httpServer.keepAliveTimeout = 5_000;

  const close = async (): Promise<void> => {
    if (closing) return;
    closing = true;
    for (const [sessionId, session] of [...sessions]) {
      releaseSession(sessionId, session);
      await session.transport.close().catch((error: unknown) => {
        logger.warn('Failed to close an MCP HTTP session.', {
          message: error instanceof Error ? error.message : String(error),
        });
      });
    }
    await new Promise<void>((resolve, reject) => {
      httpServer.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  };

  return {
    host: HTTP_HOST,
    port: boundPort,
    path: options.path,
    url: `http://${HTTP_HOST}:${boundPort}${options.path}`,
    sessionCount: () => sessions.size,
    close,
  };
}
