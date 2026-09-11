import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

vi.mock('undici', async () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await vi.importActual<typeof import('undici')>('undici');
  return { ...actual, fetch: vi.fn() };
});

import { fetch as apiFetch, Response as ApiResponse, type Headers } from 'undici';
import { decodeBase32Secret, generateTotp } from '../../src/auth/totp.js';

const USERNAME = 'bot-account';
const PASSWORD = 'correct-horse-battery-staple';
const SECRET = 'jbsw y3dp ehpk 3pxp jbsw y3dp ehpk 3pxp';
const NEW_AUTH = 'authcookie_fresh_value';
const NEW_2FA = 'twofactor_fresh_value';
const T0 = Date.parse('2026-09-11T12:00:00.000Z');
const MINUTE = 60_000;
const CODE_AT_T0 = generateTotp(decodeBase32Secret(SECRET)!, T0);
const FIXTURE_SPEC = path.join(process.cwd(), 'test', 'fixtures', 'spec.yaml');

const ENV_KEYS = [
  'VRCHAT_MCP_COOKIE_STORE',
  'VRCHAT_MCP_COOKIE_FILE',
  'VRCHAT_MCP_SPEC_URL',
  'VRCHAT_MCP_USERNAME',
  'VRCHAT_MCP_PASSWORD',
  'VRCHAT_MCP_TOTP_SECRET',
] as const;
const savedEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

const loginFetch = vi.fn<typeof fetch>();
let dir: string;
let cookieFile: string;
let sidecar: string;

function loginResponse(status: number, body: unknown, setCookies: string[] = []): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: setCookies.map((cookie) => ['set-cookie', cookie]),
  });
}

function apiResponse(status: number, body: unknown) {
  return new ApiResponse(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

const missingCredentials = () =>
  apiResponse(401, { error: { message: 'Missing Credentials', status_code: 401 } });

/** A TOTP account. verifyStatus lets a test make VRChat reject the code. */
function totpAccount(verifyStatus = 200) {
  return (input: unknown) => {
    const url = String(input);
    if (url.endsWith('/auth/user')) {
      return Promise.resolve(
        loginResponse(200, { requiresTwoFactorAuth: ['totp', 'otp'] }, [
          `auth=${NEW_AUTH}; Domain=vrchat.cloud; Path=/`,
        ])
      );
    }
    if (url.endsWith('/auth/twofactorauth/totp/verify')) {
      return Promise.resolve(
        loginResponse(verifyStatus, { verified: verifyStatus === 200 }, [
          `twoFactorAuth=${NEW_2FA}; Domain=vrchat.cloud; Path=/`,
        ])
      );
    }
    return Promise.reject(new Error(`unexpected login request ${url}`));
  };
}

/** Fresh module graph, which is what a newly spawned MCP process sees. */
async function newProcess(at: number) {
  vi.setSystemTime(at);
  vi.resetModules();
  const client = await import('../../src/core/client.js');
  const { tryAutoLogin } = await import('../../src/auth/autoLogin.js');
  const { authManager } = await import('../../src/auth/index.js');
  return { callOperation: client.callOperation, tryAutoLogin, authManager };
}

async function readSidecar(): Promise<unknown> {
  return JSON.parse(await readFile(sidecar, 'utf8'));
}

function cookieSent(call: number): string | null {
  const init = vi.mocked(apiFetch).mock.calls[call]?.[1];
  return (init?.headers as Headers).get('cookie');
}

describe('headless auto-login', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    dir = await mkdtemp(path.join(os.tmpdir(), 'vrchat-mcp-autologin-'));
    cookieFile = path.join(dir, 'cookies.json');
    sidecar = `${cookieFile}.autologin.json`;
    process.env.VRCHAT_MCP_COOKIE_STORE = 'file';
    process.env.VRCHAT_MCP_COOKIE_FILE = cookieFile;
    process.env.VRCHAT_MCP_SPEC_URL = FIXTURE_SPEC;
    process.env.VRCHAT_MCP_USERNAME = USERNAME;
    process.env.VRCHAT_MCP_PASSWORD = PASSWORD;
    process.env.VRCHAT_MCP_TOTP_SECRET = SECRET;
    vi.mocked(apiFetch).mockReset();
    loginFetch.mockReset();
    vi.stubGlobal('fetch', loginFetch);
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    vi.restoreAllMocks();
    for (const key of ENV_KEYS) {
      if (savedEnv[key] === undefined) delete process.env[key];
      else process.env[key] = savedEnv[key];
    }
    await rm(dir, { recursive: true, force: true });
  });

  it('logs in once on a 401 and retries the original request with the new session', async () => {
    loginFetch.mockImplementation(totpAccount());
    vi.mocked(apiFetch)
      .mockResolvedValueOnce(missingCredentials())
      .mockResolvedValueOnce(apiResponse(200, [{ id: 'usr_1' }]));
    const { callOperation, authManager } = await newProcess(T0);
    await authManager.setCookiesFromResponse('https://api.vrchat.cloud', [
      'auth=dead_session; Domain=vrchat.cloud; Path=/',
    ]);

    const result = await callOperation({ operationId: 'getFriends' });

    expect(result.data).toEqual([{ id: 'usr_1' }]);
    expect(apiFetch).toHaveBeenCalledTimes(2);
    expect(cookieSent(0)).toBe('auth=dead_session');
    expect(cookieSent(1)).toBe(`auth=${NEW_AUTH}; twoFactorAuth=${NEW_2FA}`);
    expect(loginFetch).toHaveBeenCalledTimes(2);
    expect(loginFetch.mock.calls[1]?.[1]?.body).toBe(JSON.stringify({ code: CODE_AT_T0 }));
    expect(await readSidecar()).toEqual({
      attemptedAt: '2026-09-11T12:00:00.000Z',
      outcome: 'success',
    });
    expect(await readFile(cookieFile, 'utf8')).toContain(NEW_AUTH);
  });

  it('retries the original request only once when the new session is also rejected', async () => {
    loginFetch.mockImplementation(totpAccount());
    vi.mocked(apiFetch).mockImplementation(() => Promise.resolve(missingCredentials()));
    const { callOperation } = await newProcess(T0);

    await expect(callOperation({ operationId: 'getFriends' })).rejects.toThrow(
      'VRChat API returned 401: Missing Credentials'
    );
    expect(apiFetch).toHaveBeenCalledTimes(2);
    expect(loginFetch).toHaveBeenCalledTimes(2);
  });

  it.each(['VRCHAT_MCP_USERNAME', 'VRCHAT_MCP_PASSWORD', 'VRCHAT_MCP_TOTP_SECRET'])(
    'leaves the 401 alone when %s is empty',
    async (key) => {
      process.env[key] = ' ';
      vi.mocked(apiFetch).mockResolvedValueOnce(missingCredentials());
      const { callOperation } = await newProcess(T0);

      await expect(callOperation({ operationId: 'getFriends' })).rejects.toThrow(
        /^VRChat API returned 401: Missing Credentials$/
      );
      expect(apiFetch).toHaveBeenCalledTimes(1);
      expect(loginFetch).not.toHaveBeenCalled();
      expect(existsSync(sidecar)).toBe(false);
    }
  );

  it('does not submit a code when the account uses email 2FA', async () => {
    loginFetch.mockResolvedValue(loginResponse(200, { requiresTwoFactorAuth: ['emailOtp'] }));
    vi.mocked(apiFetch).mockResolvedValueOnce(missingCredentials());
    const { callOperation } = await newProcess(T0);

    const error = await callOperation({ operationId: 'getFriends' }).catch((err: Error) => err);

    expect((error as Error).message).toMatch(/^VRChat API returned 401: Missing Credentials\. /);
    expect((error as Error).message).toContain('only supports TOTP accounts');
    expect((error as Error).message).toContain('vrchat_auth_begin');
    expect(loginFetch).toHaveBeenCalledTimes(1);
    expect(loginFetch.mock.calls[0]?.[0]).toBe('https://api.vrchat.cloud/api/1/auth/user');
    expect(apiFetch).toHaveBeenCalledTimes(1);
  });

  it('rejects a TOTP secret that is not base32 without contacting VRChat', async () => {
    process.env.VRCHAT_MCP_TOTP_SECRET = 'not-a-secret!';
    const { tryAutoLogin } = await newProcess(T0);

    const result = await tryAutoLogin();

    expect(result).toEqual({
      ok: false,
      message: 'Automatic login is disabled: VRCHAT_MCP_TOTP_SECRET is not valid base32.',
    });
    expect(loginFetch).not.toHaveBeenCalled();
  });

  it('skips attempts for 10 minutes after the last one, across processes', async () => {
    loginFetch.mockImplementation(totpAccount());
    expect(await (await newProcess(T0)).tryAutoLogin()).toEqual({ ok: true });
    loginFetch.mockClear();

    const skipped = await (await newProcess(T0 + 9 * MINUTE)).tryAutoLogin();
    expect(skipped).toEqual({
      ok: false,
      message:
        'Automatic login is in cooldown: the last attempt at 2026-09-11T12:00:00.000Z succeeded. Next automatic attempt after 2026-09-11T12:10:00.000Z.',
    });
    expect(loginFetch).not.toHaveBeenCalled();

    expect(await (await newProcess(T0 + 10 * MINUTE + 1000)).tryAutoLogin()).toEqual({ ok: true });
    expect(loginFetch).toHaveBeenCalledTimes(2);
  });

  it('backs off for 60 minutes after a failed attempt, across processes', async () => {
    loginFetch.mockImplementation(totpAccount(400));
    const failed = await (await newProcess(T0)).tryAutoLogin();
    expect(failed).toEqual({
      ok: false,
      message: expect.stringContaining(
        'Automatic login failed (TOTP verify failed: 400). Next automatic attempt after 2026-09-11T13:00:00.000Z.'
      ) as string,
    });
    expect(await readSidecar()).toEqual({
      attemptedAt: '2026-09-11T12:00:00.000Z',
      outcome: 'failure',
    });
    loginFetch.mockClear();

    for (const minutes of [11, 30, 59]) {
      const skipped = await (await newProcess(T0 + minutes * MINUTE)).tryAutoLogin();
      expect(skipped).toEqual({
        ok: false,
        message:
          'Automatic login is in cooldown: the last attempt at 2026-09-11T12:00:00.000Z failed. Next automatic attempt after 2026-09-11T13:00:00.000Z.',
      });
    }
    expect(loginFetch).not.toHaveBeenCalled();

    await (await newProcess(T0 + 60 * MINUTE + 1000)).tryAutoLogin();
    expect(loginFetch).toHaveBeenCalledTimes(2);
  });

  it('treats an attempt that never recorded its outcome as failed', async () => {
    await writeFile(
      sidecar,
      JSON.stringify({ attemptedAt: new Date(T0).toISOString(), outcome: 'pending' })
    );
    const result = await (await newProcess(T0 + 30 * MINUTE)).tryAutoLogin();
    expect(result).toMatchObject({
      ok: false,
      message: expect.stringContaining('after 2026-09-11T13:00:00.000Z') as string,
    });
    expect(loginFetch).not.toHaveBeenCalled();
  });

  it('does not attempt while another process holds the lock', async () => {
    // The lock's mtime is real time, so run this process at real time too.
    vi.useRealTimers();
    await writeFile(`${sidecar}.lock`, '');
    vi.useFakeTimers({ toFake: ['Date'] });
    const { tryAutoLogin } = await newProcess(Date.now());

    expect(await tryAutoLogin()).toEqual({
      ok: false,
      message: 'Another process is attempting automatic login. Retry shortly.',
    });
    expect(loginFetch).not.toHaveBeenCalled();
  });

  it('treats an unreadable record as a failure at its modification time', async () => {
    vi.useRealTimers();
    await writeFile(sidecar, 'not json');
    vi.useFakeTimers({ toFake: ['Date'] });
    const { tryAutoLogin } = await newProcess(Date.now());

    expect(await tryAutoLogin()).toMatchObject({
      ok: false,
      message: expect.stringContaining('Automatic login is in cooldown') as string,
    });
    expect(loginFetch).not.toHaveBeenCalled();
  });

  it('fails closed when the attempt cannot be recorded', async () => {
    await mkdir(sidecar);
    const { tryAutoLogin } = await newProcess(T0);

    expect(await tryAutoLogin()).toMatchObject({
      ok: false,
      message: expect.stringMatching(
        /^Automatic login skipped: could not record the attempt/
      ) as string,
    });
    expect(loginFetch).not.toHaveBeenCalled();
  });

  it('shares one attempt between concurrent callers in a process', async () => {
    loginFetch.mockImplementation(totpAccount());
    const { tryAutoLogin } = await newProcess(T0);

    const results = await Promise.all([tryAutoLogin(), tryAutoLogin(), tryAutoLogin()]);

    expect(results).toEqual([{ ok: true }, { ok: true }, { ok: true }]);
    expect(loginFetch).toHaveBeenCalledTimes(2);
  });

  it('keeps an in-memory guard when the cookie store is memory', async () => {
    process.env.VRCHAT_MCP_COOKIE_STORE = 'memory';
    loginFetch.mockImplementation(totpAccount(400));
    const { tryAutoLogin } = await newProcess(T0);

    expect(await tryAutoLogin()).toMatchObject({ ok: false });
    vi.setSystemTime(T0 + 30 * MINUTE);
    expect(await tryAutoLogin()).toMatchObject({
      ok: false,
      message: expect.stringContaining('Automatic login is in cooldown') as string,
    });
    expect(loginFetch).toHaveBeenCalledTimes(2);
    expect(existsSync(sidecar)).toBe(false);
  });

  it.each([
    ['VRChat rejects the code', totpAccount(401)],
    [
      'an unexpected error echoes the password',
      () => Promise.reject(new Error(`boom ${PASSWORD} ${SECRET}`)),
    ],
  ])('keeps secrets out of errors, logs, and the record when %s', async (_label, login) => {
    loginFetch.mockImplementation(login);
    vi.mocked(apiFetch).mockResolvedValueOnce(missingCredentials());
    const logs: string[] = [];
    vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      logs.push(args.map(String).join(' '));
    });
    const { callOperation } = await newProcess(T0);

    const error = (await callOperation({ operationId: 'getFriends' }).catch(
      (err: unknown) => err
    )) as Error & { payload?: unknown };

    expect(error.message).toContain('Automatic login failed');
    const surfaces = [
      error.message,
      JSON.stringify(error.payload),
      ...logs,
      await readFile(sidecar, 'utf8'),
    ];
    const secrets = [
      PASSWORD,
      SECRET,
      SECRET.replace(/\s+/g, '').toUpperCase(),
      CODE_AT_T0,
      NEW_AUTH,
      NEW_2FA,
    ];
    for (const surface of surfaces) {
      for (const secret of secrets) {
        expect(surface).not.toContain(secret);
      }
    }
  });
});
