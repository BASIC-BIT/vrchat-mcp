import { CookieJar, type SerializedCookieJar } from 'tough-cookie';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { getConfig } from '../config/index.js';
import { logger } from '../infra/logger.js';

export interface CookieStore {
  load(): Promise<CookieJar | null>;
  save(jar: CookieJar): Promise<void>;
  clear(): Promise<void>;
}

async function serializeJar(jar: CookieJar): Promise<SerializedCookieJar> {
  return await new Promise((resolve, reject) => {
    jar.serialize((err, serialized) => {
      if (err || !serialized) return reject(err ?? new Error('Failed to serialize jar'));
      resolve(serialized);
    });
  });
}

async function deserializeJar(data: SerializedCookieJar): Promise<CookieJar> {
  return await new Promise((resolve, reject) => {
    CookieJar.deserialize(data, (err, jar) => {
      if (err || !jar) return reject(err ?? new Error('Failed to deserialize jar'));
      resolve(jar);
    });
  });
}

class MemoryStore implements CookieStore {
  private jar: CookieJar | null = null;
  load(): Promise<CookieJar | null> {
    return Promise.resolve(this.jar);
  }
  save(jar: CookieJar): Promise<void> {
    this.jar = jar;
    return Promise.resolve();
  }
  clear(): Promise<void> {
    this.jar = null;
    return Promise.resolve();
  }
}

class FileStore implements CookieStore {
  constructor(private filePath: string) {}

  async load(): Promise<CookieJar | null> {
    try {
      const content = await fs.readFile(this.filePath, 'utf8');
      const obj = JSON.parse(content);
      return await deserializeJar(obj);
    } catch (err) {
      if ((err as { code?: string }).code === 'ENOENT') return null;
      logger.warn('Failed to load cookie file', { message: (err as Error).message });
      return null;
    }
  }

  async save(jar: CookieJar): Promise<void> {
    const serialized = await serializeJar(jar);
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(serialized), {
      encoding: 'utf8',
      mode: 0o600,
    });
    if (process.platform !== 'win32') {
      await fs.chmod(this.filePath, 0o600);
    }
  }

  async clear(): Promise<void> {
    try {
      await fs.unlink(this.filePath);
    } catch (err) {
      if ((err as { code?: string }).code !== 'ENOENT') {
        logger.warn('Failed to delete cookie file', { message: (err as Error).message });
      }
    }
  }
}

class KeychainStore implements CookieStore {
  private service = 'vrchat-mcp';
  private account = 'default';
  private fallback: CookieStore;
  private keytar: {
    getPassword: (service: string, account: string) => Promise<string | null>;
    setPassword: (service: string, account: string, password: string) => Promise<void>;
    deletePassword: (service: string, account: string) => Promise<boolean>;
  } | null = null;

  constructor(fallback: CookieStore) {
    this.fallback = fallback;
  }

  async ensureKeytar() {
    if (this.keytar) return this.keytar;
    try {
      const mod = await import('keytar');
      this.keytar = mod.default ?? (mod as any);
      return this.keytar;
    } catch (err) {
      logger.warn('keytar not available; falling back to file cookie storage', {
        message: (err as Error).message,
      });
      return null;
    }
  }

  async load(): Promise<CookieJar | null> {
    const keytar = await this.ensureKeytar();
    if (!keytar) return await this.fallback.load();
    let val: string | null;
    try {
      val = await keytar.getPassword(this.service, this.account);
    } catch (err) {
      logger.warn('Failed to load cookies from keychain; falling back to file cookie storage', {
        message: (err as Error).message,
      });
      return await this.fallback.load();
    }
    if (!val) return await this.fallback.load();
    try {
      const obj = JSON.parse(val);
      return await deserializeJar(obj);
    } catch (err) {
      logger.warn('Failed to parse keychain cookie data', { message: (err as Error).message });
      return await this.fallback.load();
    }
  }

  async save(jar: CookieJar): Promise<void> {
    const keytar = await this.ensureKeytar();
    if (!keytar) {
      await this.fallback.save(jar);
      return;
    }
    const serialized = await serializeJar(jar);
    try {
      await keytar.setPassword(this.service, this.account, JSON.stringify(serialized));
    } catch (err) {
      logger.warn('Failed to save cookies to keychain; falling back to file cookie storage', {
        message: (err as Error).message,
      });
      await this.fallback.save(jar);
    }
  }

  async clear(): Promise<void> {
    const keytar = await this.ensureKeytar();
    if (keytar) {
      try {
        await keytar.deletePassword(this.service, this.account);
      } catch (err) {
        logger.warn('Failed to delete cookies from keychain', { message: (err as Error).message });
      }
    }
    await this.fallback.clear();
  }
}

export function getCookieStore(): CookieStore {
  const config = getConfig();
  const mode = config.auth.cookieStore.toLowerCase();
  if (mode === 'file') {
    return new FileStore(path.resolve(config.auth.cookieFile));
  }
  if (mode === 'keychain') {
    return new KeychainStore(new FileStore(path.resolve(config.auth.cookieFile)));
  }
  return new MemoryStore();
}
