import { CookieJar } from 'tough-cookie';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { randomBytes } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { URL } from 'node:url';
import { getConfig } from '../config/index.js';
import { logger } from '../infra/logger.js';
import { getCookieStore } from './cookieStore.js';

const MAX_LOGIN_BODY_BYTES = 16 * 1024;
const LOGIN_USER_AGENT = getConfig().api.userAgent;

export interface AuthStatus extends Record<string, unknown> {
  loggedIn: boolean;
}

class AuthError extends Error {
  kind?: 'totp' | 'emailOtp' | 'unknown';
  isChallenge: boolean;
  constructor(
    message: string,
    kind?: 'totp' | 'emailOtp' | 'unknown',
    options: { isChallenge?: boolean } = {}
  ) {
    super(message);
    this.name = 'AuthError';
    this.kind = kind;
    this.isChallenge = options.isChallenge === true;
  }
}

class BodyTooLargeError extends Error {
  constructor() {
    super('Login request body is too large.');
    this.name = 'BodyTooLargeError';
  }
}

interface LoginSubmission {
  usernameInput: string;
  passwordInput: string;
  totp?: string;
  emailOtp?: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function cleanInput(value: string | null): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed;
}

function parseLoginSubmission(params: URLSearchParams): LoginSubmission {
  const usernameInput = params.get('username') ?? '';
  const passwordInput = params.get('password') ?? '';
  const factorKind = params.get('factorKind') ?? '';
  const code = cleanInput(params.get('code'));
  const directTotp = cleanInput(params.get('totp'));
  const directEmailOtp = cleanInput(params.get('emailOtp'));
  return {
    usernameInput,
    passwordInput,
    totp: directTotp ?? (factorKind === 'totp' ? code : undefined),
    emailOtp: directEmailOtp ?? (factorKind === 'emailOtp' ? code : undefined),
  };
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

  async getCookieValue(
    name: string,
    url = 'https://api.vrchat.cloud'
  ): Promise<string | undefined> {
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
      return {
        url: `http://127.0.0.1:${this.port}/?token=${encodeURIComponent(this.serverToken!)}`,
        token: this.serverToken!,
      };
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
    return { url: `http://127.0.0.1:${port}/?token=${encodeURIComponent(token)}`, token };
  }

  private async parseBody(req: IncomingMessage): Promise<URLSearchParams> {
    const chunks: Buffer[] = [];
    let total = 0;
    for await (const chunk of req) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      total += buf.length;
      if (total > MAX_LOGIN_BODY_BYTES) {
        req.resume();
        throw new BodyTooLargeError();
      }
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
      notice?: string;
      stage?: 'initial' | 'totp' | 'emailOtp';
      usernameHint?: string;
    } = {}
  ) {
    const stage = options.stage ?? 'initial';
    const showOtp = stage === 'totp' || stage === 'emailOtp';
    const codeLabel = stage === 'emailOtp' ? 'Email verification code' : 'Authenticator code';
    const codeHelp =
      stage === 'emailOtp'
        ? 'Check your VRChat account email for the one-time code.'
        : 'Open your authenticator app and enter the current six-digit code.';
    const usernameHint = options.usernameHint ? escapeHtml(options.usernameHint) : '';
    const error = options.error ? escapeHtml(options.error) : undefined;
    const notice = options.notice ? escapeHtml(options.notice) : undefined;
    const encodedToken = encodeURIComponent(token);
    const actionsClass = showOtp ? 'actions two' : 'actions';
    this.renderPage(
      res,
      `<div class="brand"><h1>VRChat MCP Login</h1></div>
      ${error ? `<p class="error">${error}</p>` : ''}
      ${notice ? `<p class="notice">${notice}</p>` : ''}
      ${
        showOtp
          ? `<p>2FA is required${usernameHint ? ` for <span class="account">${usernameHint}</span>` : ''}. ${codeHelp}</p>`
          : '<p>Sign in to VRChat to let the MCP server make authenticated requests on your behalf.</p>'
      }
      <form method="POST" action="/submit?token=${encodedToken}">
        ${
          showOtp
            ? `<input type="hidden" name="factorKind" value="${stage}" /><label>${codeLabel}<input name="code" inputmode="numeric" autocomplete="one-time-code" required autofocus /></label>`
            : '<label>Username or email<input name="username" autocomplete="username" required autofocus /></label><label>Password<input name="password" type="password" autocomplete="current-password" required /></label>'
        }
        <div class="${actionsClass}">
          <button type="submit">${showOtp ? 'Verify' : 'Login'}</button>
          ${showOtp ? `<a class="link-button" href="/reset?token=${encodedToken}">Use another account</a>` : ''}
        </div>
      </form>`
    );
  }

  private renderSuccess(res: ServerResponse) {
    this.renderPage(
      res,
      `<div class="brand"><h1>Login successful</h1></div>
      <p class="notice">You're logged in.</p>
      <p>You can close this window and return to your MCP client.</p>`
    );
  }

  private renderAuthError(
    res: ServerResponse,
    token: string,
    err: unknown,
    username: string
  ): boolean {
    if (!(err instanceof AuthError) || !err.kind || err.kind === 'unknown') {
      return false;
    }

    const isChallenge = err.isChallenge;
    const notice =
      err.kind === 'emailOtp' ? 'Email verification required' : 'Authenticator code required';
    this.renderForm(res, token, {
      error: isChallenge ? undefined : err.message,
      notice: isChallenge ? notice : undefined,
      stage: err.kind === 'totp' ? 'totp' : 'emailOtp',
      usernameHint: username,
    });
    return true;
  }

  private renderPage(res: ServerResponse, body: string) {
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.setHeader('referrer-policy', 'no-referrer');
    res.setHeader('x-frame-options', 'DENY');
    res.setHeader(
      'content-security-policy',
      "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"
    );
    res.end(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>VRChat MCP Login</title>
    <style>
      :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      * { box-sizing: border-box; }
      body { min-height: 100vh; margin: 0; display: grid; place-items: center; background: radial-gradient(circle at top left, #4f46e5 0, transparent 30%), linear-gradient(135deg, #0f172a, #111827 55%, #020617); color: #e5e7eb; }
      main { width: min(440px, calc(100vw - 32px)); padding: 32px; border: 1px solid rgba(148, 163, 184, 0.24); border-radius: 24px; background: rgba(15, 23, 42, 0.86); box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45); backdrop-filter: blur(16px); }
      .brand { margin-bottom: 24px; }
      h1 { margin: 0; font-size: 1.45rem; line-height: 1.2; }
      p { color: #aebbd0; line-height: 1.5; }
      .error { padding: 12px 14px; border: 1px solid rgba(248, 113, 113, 0.45); border-radius: 14px; background: rgba(127, 29, 29, 0.35); color: #fecaca; }
      .notice { padding: 12px 14px; border: 1px solid rgba(103, 232, 249, 0.36); border-radius: 14px; background: rgba(8, 47, 73, 0.35); color: #cffafe; }
      label { display: grid; gap: 8px; margin: 16px 0; color: #dbeafe; font-weight: 650; }
      input { width: 100%; border: 1px solid rgba(148, 163, 184, 0.36); border-radius: 14px; padding: 12px 14px; background: rgba(2, 6, 23, 0.74); color: #f8fafc; font-size: 1rem; }
      input:focus { outline: 2px solid #22d3ee; outline-offset: 2px; }
      .actions { display: grid; grid-template-columns: 1fr; gap: 12px; margin-top: 22px; }
      .actions.two { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
      button, .link-button { min-height: 52px; display: inline-flex; align-items: center; justify-content: center; border: 0; border-radius: 16px; padding: 0 18px; background: #67e8f9; color: #082f49; font-weight: 800; line-height: 1.15; text-align: center; cursor: pointer; text-decoration: none; }
      .link-button { background: rgba(148, 163, 184, 0.18); color: #dbeafe; }
      .hint { margin: 0; font-size: 0.92rem; }
      .account { color: #f8fafc; font-weight: 800; }
      @media (max-width: 520px) { main { padding: 24px; } .actions.two { grid-template-columns: 1fr; } }
    </style>
  </head>
  <body>
    <main>
      ${body}
    </main>
  </body>
</html>`);
  }

  private getValidatedRequestContext(
    req: IncomingMessage,
    res: ServerResponse
  ): { urlObj: URL; token: string } | null {
    if (!this.serverToken || !this.port) {
      res.statusCode = 503;
      res.end('Auth server not ready');
      return null;
    }

    const expectedHost = `127.0.0.1:${this.port}`;
    if (req.headers.host !== expectedHost) {
      res.statusCode = 403;
      res.end('Invalid host');
      return null;
    }

    const origin = req.headers.origin;
    if (origin && origin !== `http://${expectedHost}`) {
      res.statusCode = 403;
      res.end('Invalid origin');
      return null;
    }

    const urlObj = new URL(req.url ?? '/', `http://127.0.0.1:${this.port}`);
    const token = urlObj.searchParams.get('token');
    if (!token || token !== this.serverToken) {
      res.statusCode = 403;
      res.end('Invalid token');
      return null;
    }

    return { urlObj, token };
  }

  private async handleSubmit(req: IncomingMessage, res: ServerResponse, token: string) {
    const params = await this.parseBody(req);
    const submission = parseLoginSubmission(params);

    if (submission.usernameInput || submission.passwordInput) {
      this.pendingCreds = {
        username: submission.usernameInput,
        password: submission.passwordInput,
      };
    }

    const creds = this.pendingCreds ?? {
      username: submission.usernameInput,
      password: submission.passwordInput,
    };
    if (!creds.username || !creds.password) {
      this.renderForm(res, token, { error: 'Username and password are required.' });
      return;
    }

    try {
      await this.performLogin(creds.username, creds.password, submission.totp, submission.emailOtp);
      this.loggedIn = true;
      this.pendingCreds = null;
      await this.persist();
      this.emitStatus();
      res.statusCode = 200;
      this.renderSuccess(res);
    } catch (err) {
      this.loggedIn = false;
      if (this.renderAuthError(res, token, err, creds.username)) {
        return;
      }
      this.clearCookies();
      this.pendingCreds = null;
      const msg = err instanceof Error ? err.message : 'Login failed';
      this.renderForm(res, token, { error: msg });
    }
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse) {
    const context = this.getValidatedRequestContext(req, res);
    if (!context) return;
    const { urlObj, token } = context;

    if (req.method === 'GET' && urlObj.pathname === '/') {
      this.renderForm(res, token);
      return;
    }

    if (req.method === 'GET' && urlObj.pathname === '/reset') {
      this.loggedIn = false;
      this.pendingCreds = null;
      this.clearCookies();
      await this.store.clear();
      this.emitStatus();
      this.renderForm(res, token);
      return;
    }

    if (req.method === 'POST' && urlObj.pathname === '/submit') {
      try {
        await this.handleSubmit(req, res, token);
      } catch (err) {
        if (err instanceof BodyTooLargeError) {
          res.statusCode = 413;
          res.setHeader('Connection', 'close');
          res.end('Request body too large');
          return;
        }
        throw err;
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
        'user-agent': LOGIN_USER_AGENT,
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
            { isChallenge: true }
          );
        }
        const res2 = await fetch('https://api.vrchat.cloud/api/1/auth/twofactorauth/totp/verify', {
          method: 'POST',
          headers: {
            cookie: cookieHeader,
            'content-type': 'application/json',
            'user-agent': LOGIN_USER_AGENT,
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
            { isChallenge: true }
          );
        }
        const res2 = await fetch(
          'https://api.vrchat.cloud/api/1/auth/twofactorauth/emailotp/verify',
          {
            method: 'POST',
            headers: {
              cookie: cookieHeader,
              'content-type': 'application/json',
              'user-agent': LOGIN_USER_AGENT,
            },
            body: JSON.stringify({ code: emailOtp }),
          }
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
