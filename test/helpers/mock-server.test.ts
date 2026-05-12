import { afterEach, describe, expect, it } from 'vitest';
import { createMockServer, type MockServer } from './mock-server.js';

describe('mock server query parsing', () => {
  let server: MockServer | null = null;

  afterEach(async () => {
    if (server) await server.close();
    server = null;
  });

  it('ignores prototype-polluting query keys', async () => {
    server = await createMockServer();

    const res = await fetch(`${server.baseUrl}/users?search=Nakk&__proto__=polluted`);
    expect(res.ok).toBe(true);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
});
