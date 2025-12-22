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
    await fs.writeFile(this.filePath, JSON.stringify(serialized), 'utf8');
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
  private keytar: {
    getPassword: (service: string, account: string) => Promise<string | null>;
    setPassword: (service: string, account: string, password: string) => Promise<void>;
    deletePassword: (service: string, account: string) => Promise<boolean>;
  } | null = null;

  async ensureKeytar() {
    if (this.keytar) return this.keytar;
    try {
      const mod = await import('keytar');
      this.keytar = mod.default ?? (mod as any);
      return this.keytar;
    } catch (err) {
      logger.warn('keytar not available; falling back to memory', { message: (err as Error).message });
      return null;
    }
  }

  async load(): Promise<CookieJar | null> {
    const keytar = await this.ensureKeytar();
    if (!keytar) return null;
    const val = await keytar.getPassword(this.service, this.account);
    if (!val) return null;
    try {
      const obj = JSON.parse(val);
      return await deserializeJar(obj);
    } catch (err) {
      logger.warn('Failed to parse keychain cookie data', { message: (err as Error).message });
      return null;
    }
  }

  async save(jar: CookieJar): Promise<void> {
    const keytar = await this.ensureKeytar();
    if (!keytar) return;
    const serialized = await serializeJar(jar);
    await keytar.setPassword(this.service, this.account, JSON.stringify(serialized));
  }

  async clear(): Promise<void> {
    const keytar = await this.ensureKeytar();
    if (!keytar) return;
    await keytar.deletePassword(this.service, this.account);
  }
}

export function getCookieStore(): CookieStore {
  const config = getConfig();
  const mode = config.auth.cookieStore.toLowerCase();
  if (mode === 'file') {
    return new FileStore(path.resolve(config.auth.cookieFile));
  }
  if (mode === 'keychain') {
    return new KeychainStore();
  }
  return new MemoryStore();
}
