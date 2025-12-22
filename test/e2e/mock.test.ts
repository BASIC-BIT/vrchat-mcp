import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { fileURLToPath } from 'node:url';
import { createMockServer, type MockServer } from '../helpers/mock-server.js';
import { createMcpHarness, type McpHarness } from '../helpers/mcp-harness.js';

const SPEC_PATH = fileURLToPath(new URL('../fixtures/spec.yaml', import.meta.url));

describe('mcp e2e (mock)', () => {
  let server: MockServer | null = null;
  let harness: McpHarness | null = null;

  beforeAll(async () => {
    server = await createMockServer();
    harness = await createMcpHarness({
      env: {
        VRCHAT_MCP_API_BASE: server.baseUrl,
        VRCHAT_MCP_SPEC_URL: SPEC_PATH,
        VRCHAT_MCP_COOKIE_STORE: 'memory',
        VRCHAT_MCP_USER_AGENT: 'vrchat-mcp-e2e',
        VRCHAT_MCP_ALLOW_WRITES: 'false',
      },
    });
  }, 20000);

  afterAll(async () => {
    if (harness) await harness.close();
    if (server) await server.close();
  }, 20000);

  it('lists key curated tools', async () => {
    const res = await harness!.client.listTools();
    const names = res.tools?.map((tool) => tool.name) ?? [];
    expect(names).toEqual(
      expect.arrayContaining([
        'vrchat_me',
        'vrchat_friends_search',
        'vrchat_friend_location_details',
      ]),
    );
  });

  it('returns current user profile', async () => {
    const res = await harness!.client.callTool({ name: 'vrchat_me', arguments: {} });
    const structured = res.structuredContent as { data?: unknown };
    expect(structured.data).toMatchObject(server!.data.currentUser);
  });

  it('searches friends by name', async () => {
    const res = await harness!.client.callTool({
      name: 'vrchat_friends_search',
      arguments: { query: 'nak' },
    });
    const structured = res.structuredContent as {
      totalFriends?: number;
      matches?: { displayName?: string }[];
    };
    expect(structured.totalFriends).toBe(server!.data.friends.length);
    expect(structured.matches?.[0]?.displayName).toBe('Nakk');
  });

  it('returns friend location details', async () => {
    const res = await harness!.client.callTool({
      name: 'vrchat_friend_location_details',
      arguments: { name: 'Nakk' },
    });
    const structured = res.structuredContent as {
      friend?: { displayName?: string };
      location?: { type?: string };
      world?: { name?: string };
    };
    expect(structured.friend?.displayName).toBe('Nakk');
    expect(structured.location?.type).toBe('instance');
    expect(structured.world?.name).toBe('Mock World');
  });
});
