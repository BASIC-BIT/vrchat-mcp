import { CookieJar } from 'tough-cookie';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { randomBytes } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { URL } from 'node:url';
import { logger } from '../infra/logger.js';
import { getCookieStore } from './cookieStore.js';

export interface AuthStatus extends Record<string, unknown> {
  loggedIn: boolean;
}

class AuthError extends Error {
  kind?: 'totp' | 'emailOtp' | 'unknown';
  constructor(message: string, kind?: 'totp' | 'emailOtp' | 'unknown') {
    super(message);
    this.name = 'AuthError';
    this.kind = kind;
  }
}

class AuthManager {
  private jar = new CookieJar();
  private server: ReturnType<typeof createServer> | null = null;
  private serverToken: string | null = null;
  private port: number | null = null;
  private loggedIn = false;
  private pendingCreds: { username: string; password: string } | null = null;
  private store = getCookieStore();
  private events = new EventEmitter();

  async init() {
    const loaded = await this.store.load();
    if (loaded) {
      this.jar = loaded;
      this.loggedIn = await this.hasAuthCookie();
    }
    this.emitStatus();
  }

  private async hasAuthCookie(): Promise<boolean> {
    const cookies = await this.jar.getCookies('https://api.vrchat.cloud');
    return cookies.some((c) => c.key === 'auth' || c.key === 'twoFactorAuth');
  }

  clearCookies() {
    this.jar = new CookieJar();
  }

  getCookieHeader(url: string): Promise<string> {
    return this.jar.getCookieString(url);
  }

  async getCookieValue(name: string, url = 'https://api.vrchat.cloud'): Promise<string | undefined> {
    const cookies = await this.jar.getCookies(url);
    const match = cookies.find((cookie) => cookie.key === name);
    return match?.value;
  }

  async setCookiesFromResponse(url: string, setCookieHeaders: string[]) {
    for (const setCookie of setCookieHeaders) {
      await this.jar.setCookie(setCookie, url);
    }
    await this.persist();
  }

  getStatus(): AuthStatus {
    return { loggedIn: this.loggedIn };
  }

  onStatusChange(listener: (status: AuthStatus) => void): () => void {
    this.events.on('status', listener);
    return () => this.events.off('status', listener);
  }

  private emitStatus() {
    this.events.emit('status', this.getStatus());
  }

  async logout() {
    this.loggedIn = false;
    this.clearCookies();
    this.pendingCreds = null;
    await this.store.clear();
    if (this.server) {
      this.server.close();
      this.server = null;
      this.port = null;
    }
    this.emitStatus();
  }

  async startLoginServer(): Promise<{ url: string; token: string }> {
    if (this.server) {
      return { url: `http://127.0.0.1:${this.port}/?token=${this.serverToken}`, token: this.serverToken! };
    }
    const token = randomBytes(16).toString('hex');
    this.serverToken = token;

    this.server = createServer((req, res) => {
      this.handleRequest(req, res).catch((err) => {
        logger.error('auth server error', { message: (err as Error).message });
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
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      chunks.push(buf);
    }
    const body = Buffer.concat(chunks).toString('utf8');
    return new URLSearchParams(body);
  }

  private renderForm(
    res: ServerResponse,
    token: string,
    options: {
      error?: string;
      stage?: 'initial' | 'totp' | 'emailOtp';
      usernameHint?: string;
    } = {},
  ) {
    const stage = options.stage ?? 'initial';
    const showOtp = stage === 'totp' || stage === 'emailOtp';
    const otpLabel = stage === 'emailOtp' ? 'TOTP (auth app, if prompted)' : 'TOTP (auth app, required)';
    const emailLabel = stage === 'emailOtp' ? 'Email OTP (required)' : 'Email OTP (if prompted)';
    const usernameHint = options.usernameHint ? ` (using ${options.usernameHint})` : '';
    const error = options.error;
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.end(`<!doctype html><html><body>
      <h3>VRChat Login</h3>
      ${error ? `<p style="color:red;">${error}</p>` : ''}
      ${showOtp ? `<p>2FA required${usernameHint}. Enter the code below.</p>` : ''}
      <form method="POST" action="/submit?token=${token}">
        <label>Username <input name="username" ${showOtp ? '' : 'required'} /></label><br />
        <label>Password <input name="password" type="password" ${showOtp ? '' : 'required'} /></label><br />
        <label>${otpLabel} <input name="totp" ${stage === 'totp' ? 'required' : ''} /></label><br />
        <label>${emailLabel} <input name="emailOtp" ${stage === 'emailOtp' ? 'required' : ''} /></label><br />
        <button type="submit">Login</button>
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
      const usernameInput = params.get('username') ?? '';
      const passwordInput = params.get('password') ?? '';
      const totp = params.get('totp') ?? undefined;
      const emailOtp = params.get('emailOtp') ?? undefined;
      if (usernameInput || passwordInput) {
        this.pendingCreds = { username: usernameInput, password: passwordInput };
      }
      const creds = this.pendingCreds ?? { username: usernameInput, password: passwordInput };
      if (!creds.username || !creds.password) {
        this.renderForm(res, token, { error: 'Username and password are required.' });
        return;
      }
      try {
        await this.performLogin(creds.username, creds.password, totp, emailOtp);
        this.loggedIn = true;
        this.pendingCreds = null;
        await this.persist();
        this.emitStatus();
        res.statusCode = 200;
        res.setHeader('content-type', 'text/html; charset=utf-8');
        res.end('<p>Login successful. You can close this window.</p>');
      } catch (err) {
        this.loggedIn = false;
        if (err instanceof AuthError && err.kind && err.kind !== 'unknown') {
          this.renderForm(res, token, {
            error: err.message,
            stage: err.kind === 'totp' ? 'totp' : 'emailOtp',
            usernameHint: creds.username,
          });
          return;
        }
        this.clearCookies();
        this.pendingCreds = null;
        const msg = err instanceof Error ? err.message : 'Login failed';
        this.renderForm(res, token, { error: msg });
      }
      return;
    }

    res.statusCode = 404;
    res.end('Not found');
  }

  private async performLogin(username: string, password: string, totp?: string, emailOtp?: string) {
    const basic = Buffer.from(`${username}:${password}`).toString('base64');
    const res1 = await fetch('https://api.vrchat.cloud/api/1/auth/user', {
      method: 'GET',
      headers: {
        authorization: `Basic ${basic}`,
        'user-agent': 'vrchat-mcp-login',
      },
    });

    const setCookies1 = res1.headers.getSetCookie?.() ?? [];
    await this.setCookiesFromResponse('https://api.vrchat.cloud', setCookies1);
    const body1 = (await res1.json().catch(() => ({}))) as any;
    const requires2fa = Array.isArray(body1?.requiresTwoFactorAuth)
      ? (body1.requiresTwoFactorAuth as string[])
      : [];

    if (requires2fa.length) {
      const cookieHeader = await this.getCookieHeader('https://api.vrchat.cloud');
      if (requires2fa.includes('totp')) {
        if (!totp) {
          throw new AuthError(
            '2FA required (TOTP). Enter the code from your authenticator app.',
            'totp',
          );
        }
        const res2 = await fetch('https://api.vrchat.cloud/api/1/auth/twofactorauth/totp/verify', {
          method: 'POST',
          headers: {
            cookie: cookieHeader,
            'content-type': 'application/json',
            'user-agent': 'vrchat-mcp-login',
          },
          body: JSON.stringify({ code: totp }),
        });
        const setCookies2 = res2.headers.getSetCookie?.() ?? [];
        await this.setCookiesFromResponse('https://api.vrchat.cloud', setCookies2);
        if (res2.status !== 200) {
          throw new AuthError(`TOTP verify failed: ${res2.status}`, 'totp');
        }
        return;
      }

      if (requires2fa.includes('emailOtp')) {
        if (!emailOtp) {
          throw new AuthError(
            '2FA required (Email OTP). Check your email and enter the code.',
            'emailOtp',
          );
        }
        const res2 = await fetch(
          'https://api.vrchat.cloud/api/1/auth/twofactorauth/emailotp/verify',
          {
            method: 'POST',
            headers: {
              cookie: cookieHeader,
              'content-type': 'application/json',
              'user-agent': 'vrchat-mcp-login',
            },
            body: JSON.stringify({ code: emailOtp }),
          },
        );
        const setCookies2 = res2.headers.getSetCookie?.() ?? [];
        await this.setCookiesFromResponse('https://api.vrchat.cloud', setCookies2);
        if (res2.status !== 200) {
          throw new AuthError(`Email OTP verify failed: ${res2.status}`, 'emailOtp');
        }
        return;
      }

      throw new AuthError(`2FA required (${requires2fa.join(', ')}).`, 'unknown');
    }

    if (res1.status === 200) {
      return;
    }

    throw new Error(`Login failed: ${res1.status}`);
  }

  private async persist() {
    try {
      await this.store.save(this.jar);
    } catch (err) {
      logger.warn('Failed to persist cookies', { message: (err as Error).message });
    }
  }
}

export const authManager = new AuthManager();
