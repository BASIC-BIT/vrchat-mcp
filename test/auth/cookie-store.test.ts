import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CookieJar } from 'tough-cookie';
import { getCookieStore } from '../../src/auth/cookieStore.js';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const cookieUrl = 'https://api.vrchat.cloud';

function buildJar(): CookieJar {
  const jar = new CookieJar();
  jar.setCookieSync('auth=token; Domain=vrchat.cloud; Path=/', cookieUrl);
  return jar;
}

describe('cookie store', () => {
  const prevStore = process.env.VRCHAT_MCP_COOKIE_STORE;
  const prevFile = process.env.VRCHAT_MCP_COOKIE_FILE;
  let tempDir = '';
  let cookieFile = '';

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'vrchat-mcp-'));
    cookieFile = path.join(tempDir, 'cookies.json');
  });

  afterEach(async () => {
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
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('persists cookies in file store', async () => {
    process.env.VRCHAT_MCP_COOKIE_STORE = 'file';
    process.env.VRCHAT_MCP_COOKIE_FILE = cookieFile;
    const store = getCookieStore();
    const jar = buildJar();
    await store.save(jar);

    const loaded = await store.load();
    expect(loaded).not.toBeNull();
    const cookieHeader = await loaded!.getCookieString(cookieUrl);
    expect(cookieHeader).toContain('auth=token');

    if (process.platform !== 'win32') {
      const stat = await fs.stat(cookieFile);
      expect(stat.mode & 0o777).toBe(0o600);
    }

    await store.clear();
    const afterClear = await store.load();
    expect(afterClear).toBeNull();
  });

  it('stores cookies in memory store', async () => {
    process.env.VRCHAT_MCP_COOKIE_STORE = 'memory';
    const store = getCookieStore();
    const jar = buildJar();
    await store.save(jar);
    const loaded = await store.load();
    expect(loaded).not.toBeNull();
    const cookieHeader = await loaded!.getCookieString(cookieUrl);
    expect(cookieHeader).toContain('auth=token');
  });
});
