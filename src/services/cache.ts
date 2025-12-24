import { getConfig } from '../config/index.js';
import { logger } from '../infra/logger.js';

type CacheValue = object | string | number | boolean | null;

export interface CacheEntry<T = CacheValue> {
  key: string;
  value: T;
  createdAt: number;
  expiresAt: number;
  tags: string[];
}

const cacheSettings = getConfig().cache;

let warnedDisabled = false;

export const cacheConfig = {
  enabled: cacheSettings.enabled,
  friendsTtlMs: cacheSettings.ttlSeconds.friends * 1000,
  friendsStaleTtlMs: cacheSettings.staleTtlSeconds.friends * 1000,
  userGroupsTtlMs: cacheSettings.ttlSeconds.userGroups * 1000,
  userGroupsStaleTtlMs: cacheSettings.staleTtlSeconds.userGroups * 1000,
  groupsTtlMs: cacheSettings.ttlSeconds.groups * 1000,
  groupsStaleTtlMs: cacheSettings.staleTtlSeconds.groups * 1000,
  notificationsTtlMs: cacheSettings.ttlSeconds.notifications * 1000,
  notificationsStaleTtlMs: cacheSettings.staleTtlSeconds.notifications * 1000,
};

export function isCacheEnabled(): boolean {
  if (!cacheConfig.enabled && !warnedDisabled) {
    warnedDisabled = true;
    logger.warn('Caching disabled via config; performance may be degraded.');
  }
  return cacheConfig.enabled;
}

export function resetCacheWarningForTest() {
  warnedDisabled = false;
}

export function buildCacheKey(
  prefix: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): string {
  if (!params) return prefix;
  const pairs = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${String(value)}`);
  return pairs.length ? `${prefix}:${pairs.join('&')}` : prefix;
}

export class CacheManager {
  private entries = new Map<string, CacheEntry<CacheValue>>();
  private inflight = new Map<string, Promise<CacheValue>>();

  get<T extends CacheValue>(key: string): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (Date.now() >= entry.expiresAt) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T extends CacheValue>(
    key: string,
    value: T,
    ttlMs: number,
    tags: string[] = [],
  ): void {
    if (ttlMs <= 0) return;
    const now = Date.now();
    const entry: CacheEntry<T> = {
      key,
      value,
      createdAt: now,
      expiresAt: now + ttlMs,
      tags,
    };
    this.entries.set(key, entry);
  }

  async getOrSet<T extends CacheValue>(
    key: string,
    ttlMs: number,
    tags: string[],
    loader: () => Promise<T>,
  ): Promise<T> {
    if (!isCacheEnabled()) {
      return loader();
    }
    const cached = this.get<T>(key);
    if (cached !== undefined) return cached;
    const inflight = this.inflight.get(key);
    if (inflight) return inflight as Promise<T>;

    const promise = loader()
      .then((value) => {
        this.set(key, value, ttlMs, tags);
        return value;
      })
      .finally(() => {
        this.inflight.delete(key);
      });
    this.inflight.set(key, promise as Promise<CacheValue>);
    return promise;
  }

  async getOrSetStale<T extends CacheValue>(
    key: string,
    ttlMs: number,
    staleTtlMs: number,
    tags: string[],
    loader: () => Promise<T>,
  ): Promise<{ value: T; stale: boolean }> {
    if (!isCacheEnabled()) {
      return { value: await loader(), stale: false };
    }

    const entry = this.entries.get(key);
    const now = Date.now();
    if (entry && now < entry.expiresAt) {
      return { value: entry.value as T, stale: false };
    }

    if (entry) {
      const staleAge = now - entry.expiresAt;
      if (staleTtlMs > 0 && staleAge <= staleTtlMs) {
        if (!this.inflight.has(key)) {
          const promise = loader()
            .then((value) => {
              this.set(key, value, ttlMs, tags);
              return value;
            })
            .finally(() => {
              this.inflight.delete(key);
            });
          this.inflight.set(key, promise as Promise<CacheValue>);
        }
        return { value: entry.value as T, stale: true };
      }
      this.entries.delete(key);
    }

    const inflight = this.inflight.get(key);
    if (inflight) {
      return { value: (await inflight) as T, stale: false };
    }

    const promise = loader()
      .then((value) => {
        this.set(key, value, ttlMs, tags);
        return value;
      })
      .finally(() => {
        this.inflight.delete(key);
      });
    this.inflight.set(key, promise as Promise<CacheValue>);
    return { value: await promise, stale: false };
  }

  updateByTag<T extends CacheValue>(
    tag: string,
    updater: (value: T, key: string) => T | undefined,
  ): number {
    let count = 0;
    for (const [key, entry] of this.entries.entries()) {
      if (!entry.tags.includes(tag)) continue;
      const next = updater(entry.value as T, key);
      if (next === undefined) continue;
      entry.value = next;
      count += 1;
    }
    return count;
  }

  invalidateAll(): number {
    const count = this.entries.size;
    this.entries.clear();
    return count;
  }

  invalidateByKey(key: string): number {
    const existed = this.entries.delete(key);
    return existed ? 1 : 0;
  }

  invalidateByTag(tag: string): number {
    let count = 0;
    for (const [key, entry] of this.entries.entries()) {
      if (entry.tags.includes(tag)) {
        this.entries.delete(key);
        count += 1;
      }
    }
    return count;
  }
}

export const cacheManager = new CacheManager();
