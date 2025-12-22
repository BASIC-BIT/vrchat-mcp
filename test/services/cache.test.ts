import { describe, it, expect, vi } from 'vitest';
import { CacheManager, buildCacheKey } from '../../src/services/cache.js';

describe('cache', () => {
  it('reads cache enabled from env at startup', async () => {
    const prev = process.env.VRCHAT_MCP_CACHE_ENABLED;
    process.env.VRCHAT_MCP_CACHE_ENABLED = 'false';
    vi.resetModules();
    const mod = await import('../../src/services/cache.js');
    mod.resetCacheWarningForTest();
    expect(mod.isCacheEnabled()).toBe(false);
    if (prev === undefined) {
      delete process.env.VRCHAT_MCP_CACHE_ENABLED;
    } else {
      process.env.VRCHAT_MCP_CACHE_ENABLED = prev;
    }
    vi.resetModules();
  });

  it('buildCacheKey sorts and filters params', () => {
    const key = buildCacheKey('friends:list', {
      maxPages: 10,
      includeOffline: true,
      pageSize: 100,
      unused: undefined,
    });
    expect(key).toBe('friends:list:includeOffline=true&maxPages=10&pageSize=100');
  });

  it('expires entries after ttl', () => {
    const cache = new CacheManager();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(0));
    cache.set('a', 123, 1000, ['test']);
    expect(cache.get('a')).toBe(123);
    vi.setSystemTime(new Date(1001));
    expect(cache.get('a')).toBeUndefined();
    vi.useRealTimers();
  });

  it('invalidates by key and tag', () => {
    const cache = new CacheManager();
    cache.set('a', 1, 1000, ['friends']);
    cache.set('b', 2, 1000, ['friends', 'groups']);
    expect(cache.invalidateByKey('a')).toBe(1);
    expect(cache.get('a')).toBeUndefined();
    expect(cache.invalidateByTag('friends')).toBe(1);
    expect(cache.get('b')).toBeUndefined();
  });

  it('dedupes inflight loads', async () => {
    const cache = new CacheManager();
    let calls = 0;
    const loader = () => {
      calls += 1;
      return Promise.resolve({ value: 42 });
    };
    const [a, b] = await Promise.all([
      cache.getOrSet('key', 1000, ['friends'], loader),
      cache.getOrSet('key', 1000, ['friends'], loader),
    ]);
    expect(calls).toBe(1);
    expect(a).toEqual(b);
  });

  it('serves stale while refreshing', async () => {
    const cache = new CacheManager();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(0));
    cache.set('a', 'old', 1000, ['friends']);
    vi.setSystemTime(new Date(1500));
    let calls = 0;
    const loader = () => {
      calls += 1;
      return Promise.resolve('new');
    };
    const result = await cache.getOrSetStale('a', 1000, 5000, ['friends'], loader);
    expect(result.value).toBe('old');
    expect(result.stale).toBe(true);
    expect(calls).toBe(1);
    vi.useRealTimers();
  });

  it('evicts too-stale entries', async () => {
    const cache = new CacheManager();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(0));
    cache.set('a', 'old', 1000, ['friends']);
    vi.setSystemTime(new Date(7000));
    const loader = () => Promise.resolve('new');
    const result = await cache.getOrSetStale('a', 1000, 2000, ['friends'], loader);
    expect(result.value).toBe('new');
    expect(result.stale).toBe(false);
    vi.useRealTimers();
  });

  it('updates entries by tag', () => {
    const cache = new CacheManager();
    cache.set('a', { count: 1 }, 1000, ['friends']);
    cache.set('b', { count: 5 }, 1000, ['groups']);
    const updated = cache.updateByTag<{ count: number }>('friends', (value) => ({
      count: value.count + 1,
    }));
    expect(updated).toBe(1);
    expect(cache.get('a')).toEqual({ count: 2 });
    expect(cache.get('b')).toEqual({ count: 5 });
  });
});
