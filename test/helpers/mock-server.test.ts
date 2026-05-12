import { afterEach, describe, expect, it } from 'vitest';
import { createMockServer, parseQuery, type MockServer } from './mock-server.js';

describe('mock server query parsing', () => {
  let server: MockServer | null = null;

  afterEach(async () => {
    if (server) await server.close();
    server = null;
  });

  it('omits unsafe query keys from parsed query objects', () => {
    const parsed = parseQuery(
      new URL(
        'https://mock.vrchat.test/users?search=Nakk&__proto__=x&__proto__=y&constructor=z&prototype=w'
      )
    );

    expect(parsed).toEqual({ search: 'Nakk' });
    expect(Object.getPrototypeOf(parsed)).toBe(Object.prototype);
  });

  it.each(['__proto__', 'constructor', 'prototype'])('ignores %s query key', async (key) => {
    server = await createMockServer();

    const res = await fetch(`${server.baseUrl}/users?search=Nakk&${key}=polluted`);
    expect(res.ok).toBe(true);
  });
});
