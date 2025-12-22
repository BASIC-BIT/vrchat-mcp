import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CookieJar, type SerializedCookieJar } from 'tough-cookie';

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

  beforeEach(() => {
    process.env.VRCHAT_MCP_COOKIE_STORE = 'keychain';
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
});
