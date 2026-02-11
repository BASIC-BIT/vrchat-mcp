import { CookieJar } from 'tough-cookie';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { randomBytes } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { URL } from 'node:url';
import { fetch, Headers } from 'undici';
import { logger } from '../infra/logger.js';
import { getConfig } from '../config/index.js';
import type { CookieStore } from '../auth/cookieStore.js';
import { getVrctlCookieStore } from '../auth/cookieStore.js';
import { parseTimelineBootstrap } from './timelineBootstrap.js';

export interface VrctlAuthStatus extends Record<string, unknown> {
  loggedIn: boolean;
  verified: boolean;
  hasSessionCookie: boolean;
  message?: string;
}

export interface VrctlCookieInput {
  phpSessId: string;
  nss?: string;
}

export interface VrctlAuthManagerDeps {
  store?: CookieStore;
  fetchImpl?: typeof fetch;
  siteUrl?: string;
  userAgent?: string;
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function safeCookieValue(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  // Prevent header/cookie injection via delimiters.
  if (/[\r\n;]/.test(trimmed)) return '';
  return trimmed;
}

class VrctlAuthManager {
  private jar = new CookieJar();
  private store: CookieStore;
  private siteUrl: URL;
  private userAgent: string;
  private fetchImpl: typeof fetch;

  private server: ReturnType<typeof createServer> | null = null;
  private serverToken: string | null = null;
  private port: number | null = null;

  private status: VrctlAuthStatus = {
    loggedIn: false,
    verified: false,
    hasSessionCookie: false,
  };

  private events = new EventEmitter();

  constructor(deps: VrctlAuthManagerDeps = {}) {
    const config = getConfig();
    this.siteUrl = new URL(deps.siteUrl ?? config.vrctl.siteUrl);
    this.userAgent = deps.userAgent ?? config.vrctl.userAgent ?? config.api.userAgent;
    this.store = deps.store ?? getVrctlCookieStore();
    this.fetchImpl = deps.fetchImpl ?? fetch;
  }

  async init() {
    const loaded = await this.store.load();
    if (loaded) {
      this.jar = loaded;
    }
    const has = await this.hasSessionCookie();
    this.status = {
      loggedIn: has,
      verified: false,
      hasSessionCookie: has,
    };
    this.emitStatus();
  }

  getStatus(): VrctlAuthStatus {
    return { ...this.status };
  }

  onStatusChange(listener: (status: VrctlAuthStatus) => void): () => void {
    this.events.on('status', listener);
    return () => this.events.off('status', listener);
  }

  private emitStatus() {
    this.events.emit('status', this.getStatus());
  }

  private async persist() {
    await this.store.save(this.jar);
  }

  clearCookies() {
    this.jar = new CookieJar();
  }

  async logout() {
    this.status = { loggedIn: false, verified: false, hasSessionCookie: false };
    this.clearCookies();
    await this.store.clear();
    if (this.server) {
      this.server.close();
      this.server = null;
      this.port = null;
      this.serverToken = null;
    }
    this.emitStatus();
  }

  getCookieHeader(url: string): Promise<string> {
    return this.jar.getCookieString(url);
  }

  async setCookiesFromResponse(url: string, setCookieHeaders: string[]) {
    for (const setCookie of setCookieHeaders) {
      await this.jar.setCookie(setCookie, url);
    }
    await this.persist();
  }

  private async hasSessionCookie(): Promise<boolean> {
    const cookies = await this.jar.getCookies(this.siteUrl.toString());
    return cookies.some((c) => c.key === 'PHPSESSID' || c.key === '_nss');
  }

  async setSessionCookies(input: VrctlCookieInput): Promise<void> {
    const host = this.siteUrl.hostname;
    const phpSessId = safeCookieValue(input.phpSessId);
    const nss = input.nss ? safeCookieValue(input.nss) : '';

    if (!phpSessId) {
      throw new Error('PHPSESSID is required');
    }

    await this.jar.setCookie(
      `PHPSESSID=${phpSessId}; Domain=${host}; Path=/; Secure; HttpOnly; SameSite=Lax`,
      this.siteUrl.toString()
    );
    if (nss) {
      await this.jar.setCookie(
        `_nss=${nss}; Domain=${host}; Path=/; Secure; HttpOnly; SameSite=Strict`,
        this.siteUrl.toString()
      );
    }
    await this.persist();

    const has = await this.hasSessionCookie();
    this.status = {
      loggedIn: has,
      verified: false,
      hasSessionCookie: has,
      message: 'Session cookies saved. Run status to verify.',
    };
    this.emitStatus();
  }

  async verifyStatus(): Promise<VrctlAuthStatus> {
    const url = new URL('/', this.siteUrl).toString();
    const headers = new Headers();
    headers.set('user-agent', this.userAgent);
    const cookieHeader = await this.getCookieHeader(url);
    if (cookieHeader) headers.set('cookie', cookieHeader);

    try {
      const res = await this.fetchImpl(url, { method: 'GET', headers });

      const setCookieHeaders = res.headers.getSetCookie?.() ?? [];
      if (setCookieHeaders.length) {
        await this.setCookiesFromResponse(url, setCookieHeaders);
      }

      const html = await res.text();
      const parsed = parseTimelineBootstrap(html);
      const loggedIn = parsed?.loggedIn;
      const has = await this.hasSessionCookie();

      if (typeof loggedIn === 'boolean') {
        this.status = {
          loggedIn,
          verified: true,
          hasSessionCookie: has,
        };
      } else {
        this.status = {
          loggedIn: has,
          verified: false,
          hasSessionCookie: has,
          message: 'Unable to verify login state from vrc.tl HTML.',
        };
      }
      this.emitStatus();
      return this.getStatus();
    } catch (err) {
      const has = await this.hasSessionCookie();
      const message = err instanceof Error ? err.message : String(err);
      this.status = {
        loggedIn: has,
        verified: false,
        hasSessionCookie: has,
        message: `Status check failed: ${message}`,
      };
      this.emitStatus();
      return this.getStatus();
    }
  }

  async startLoginServer(): Promise<{ url: string; token: string }> {
    if (this.server) {
      return {
        url: `http://127.0.0.1:${this.port}/?token=${this.serverToken}`,
        token: this.serverToken!,
      };
    }
    const token = randomBytes(16).toString('hex');
    this.serverToken = token;

    this.server = createServer((req, res) => {
      this.handleRequest(req, res).catch((err) => {
        logger.error('vrctl auth server error', { message: (err as Error).message });
        res.statusCode = 500;
        res.end('Internal server error');
      });
    });

    await new Promise<void>((resolve) => {
      this.server!.listen(0, '127.0.0.1', () => resolve());
    });

    const address = this.server.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    this.port = port;
    return { url: `http://127.0.0.1:${port}/?token=${token}`, token };
  }

  private async parseBody(req: IncomingMessage): Promise<URLSearchParams> {
    const MAX_BODY_BYTES = 16_384; // 16 KB
    const chunks: Buffer[] = [];
    let totalBytes = 0;
    for await (const chunk of req) {
      const value: unknown = chunk;
      let buf: Buffer | undefined;
      if (Buffer.isBuffer(value)) {
        buf = value;
      } else if (value instanceof Uint8Array) {
        buf = Buffer.from(value);
      } else if (typeof value === 'string') {
        buf = Buffer.from(value, 'utf8');
      }
      if (buf) {
        totalBytes += buf.length;
        if (totalBytes > MAX_BODY_BYTES) {
          req.destroy();
          throw new Error('Request body too large');
        }
        chunks.push(buf);
      }
    }
    const body = Buffer.concat(chunks).toString('utf8');
    return new URLSearchParams(body);
  }

  private renderForm(res: ServerResponse, token: string, options: { error?: string } = {}) {
    const error = options.error;
    const loginUrl = new URL('/login', this.siteUrl).toString();
    const escapedError = error ? escapeHtml(error) : '';
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.end(`<!doctype html><html><body>
      <h3>VRC.TL Login</h3>
      <p>This flow stores your vrc.tl session cookies so the MCP server can make authenticated requests later.</p>
      <ol>
        <li>Open <a href="${loginUrl}" target="_blank" rel="noreferrer">${loginUrl}</a> and log in (Discord/X/Twitch/Mixcloud/Passkey).</li>
        <li>In your browser, open DevTools -&gt; Application/Storage -&gt; Cookies -&gt; <code>${this.siteUrl.origin}</code>.</li>
        <li>Copy the cookie values for <code>PHPSESSID</code> (required) and <code>_nss</code> (optional) and paste them below.</li>
      </ol>
      <p><strong>Warning:</strong> these cookie values grant access to your vrc.tl account. Keep them private.</p>
      ${escapedError ? `<p style="color:red;">${escapedError}</p>` : ''}
      <form method="POST" action="/submit?token=${token}">
        <label>PHPSESSID <input name="phpSessId" required /></label><br />
        <label>_nss <input name="nss" /></label><br />
        <button type="submit">Save cookies</button>
      </form>
    </body></html>`);
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse) {
    if (!this.serverToken || !this.port) {
      res.statusCode = 503;
      res.end('Auth server not ready');
      return;
    }
    const urlObj = new URL(req.url ?? '/', `http://127.0.0.1:${this.port}`);
    const token = urlObj.searchParams.get('token');
    if (!token || token !== this.serverToken) {
      res.statusCode = 403;
      res.end('Invalid token');
      return;
    }

    if (req.method === 'GET' && urlObj.pathname === '/') {
      this.renderForm(res, token);
      return;
    }

    if (req.method === 'POST' && urlObj.pathname === '/submit') {
      const params = await this.parseBody(req);
      const phpSessId = params.get('phpSessId') ?? '';
      const nss = params.get('nss') ?? '';
      try {
        await this.setSessionCookies({ phpSessId, nss });
        res.statusCode = 200;
        res.setHeader('content-type', 'text/html; charset=utf-8');
        res.end('<p>Cookies saved. You can close this window.</p>');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to save cookies';
        this.renderForm(res, token, { error: msg });
      }
      return;
    }

    res.statusCode = 404;
    res.end('Not found');
  }
}

export function createVrctlAuthManager(deps: VrctlAuthManagerDeps = {}): VrctlAuthManager {
  return new VrctlAuthManager(deps);
}

export const vrctlAuthManager = createVrctlAuthManager();
