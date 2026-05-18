import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CookieJar, type SerializedCookieJar } from 'tough-cookie';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const keytarMock = {
  getPassword: vi.fn(),
  setPassword: vi.fn(),
  deletePassword: vi.fn(),
};

vi.mock('keytar', () => ({
  default: keytarMock,
}));

const cookieUrl = 'https://api.vrchat.cloud';

function buildJar(): CookieJar {
  const jar = new CookieJar();
  jar.setCookieSync('auth=token; Domain=vrchat.cloud; Path=/', cookieUrl);
  return jar;
}

async function serializeJar(jar: CookieJar): Promise<SerializedCookieJar> {
  return await new Promise((resolve, reject) => {
    jar.serialize((err, serialized) => {
      if (err || !serialized) return reject(err ?? new Error('Failed to serialize jar'));
      resolve(serialized);
    });
  });
}

describe('cookie store (keychain)', () => {
  const prevStore = process.env.VRCHAT_MCP_COOKIE_STORE;
  const prevFile = process.env.VRCHAT_MCP_COOKIE_FILE;
  let tempDir: string | null = null;

  beforeEach(() => {
    process.env.VRCHAT_MCP_COOKIE_STORE = 'keychain';
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vrchat-mcp-keychain-'));
    process.env.VRCHAT_MCP_COOKIE_FILE = path.join(tempDir, 'cookies.json');
    keytarMock.getPassword.mockReset();
    keytarMock.setPassword.mockReset();
    keytarMock.deletePassword.mockReset();
    vi.resetModules();
  });

  afterEach(() => {
    if (prevStore === undefined) {
      delete process.env.VRCHAT_MCP_COOKIE_STORE;
    } else {
      process.env.VRCHAT_MCP_COOKIE_STORE = prevStore;
    }
    if (prevFile === undefined) {
      delete process.env.VRCHAT_MCP_COOKIE_FILE;
    } else {
      process.env.VRCHAT_MCP_COOKIE_FILE = prevFile;
    }
    if (tempDir) fs.rmSync(tempDir, { recursive: true, force: true });
    tempDir = null;
  });

  it('saves, loads, and clears cookies via keychain', async () => {
    const { getCookieStore } = await import('../../src/auth/cookieStore.js');
    const store = getCookieStore();

    const jar = buildJar();
    await store.save(jar);
    expect(keytarMock.setPassword).toHaveBeenCalledTimes(1);

    const serialized = await serializeJar(jar);
    keytarMock.getPassword.mockResolvedValueOnce(JSON.stringify(serialized));

    const loaded = await store.load();
    const header = await loaded!.getCookieString(cookieUrl);
    expect(header).toContain('auth=token');

    await store.clear();
    expect(keytarMock.deletePassword).toHaveBeenCalledTimes(1);
  });

  it('falls back to file storage when keychain operations fail', async () => {
    keytarMock.setPassword.mockRejectedValueOnce(new Error('backend unavailable'));
    keytarMock.getPassword.mockRejectedValueOnce(new Error('backend unavailable'));

    const { getCookieStore } = await import('../../src/auth/cookieStore.js');
    const store = getCookieStore();

    await store.save(buildJar());

    const loaded = await store.load();
    const header = await loaded!.getCookieString(cookieUrl);
    expect(header).toContain('auth=token');
  });
});
