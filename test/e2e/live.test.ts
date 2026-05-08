import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { createMcpHarness, type McpHarness } from '../helpers/mcp-harness.js';
import { getDefaultLiveCookieFile, loadLiveConfig } from '../helpers/live-config.js';
import { ensureLoggedIn } from '../helpers/live-auth.js';

const E2E_TIMEOUT_MS = 120_000;

const liveConfig = loadLiveConfig();
const describeLive = liveConfig ? describe : describe.skip;
const writeConfig = liveConfig?.writeTests;
const describeLiveWrites = writeConfig?.enabled ? describe : describe.skip;

describeLive('mcp e2e (live)', () => {
  let harness: McpHarness | null = null;

  beforeAll(async () => {
    const cookieFile = liveConfig?.cookieFile ?? getDefaultLiveCookieFile();

    harness = await createMcpHarness({
      env: {
        VRCHAT_MCP_COOKIE_STORE: 'file',
        VRCHAT_MCP_COOKIE_FILE: cookieFile,
        VRCHAT_MCP_USER_AGENT: 'vrchat-mcp-e2e',
        VRCHAT_MCP_ALLOW_WRITES: 'false',
      },
      logStderr: liveConfig?.debug ?? false,
    });
  }, E2E_TIMEOUT_MS);

  afterAll(async () => {
    await harness?.close();
  }, E2E_TIMEOUT_MS);

  it(
    'logs in if needed and returns current user profile',
    async () => {
      const client = harness!.client;
      await ensureLoggedIn(client, liveConfig);

      const me = await client.callTool({ name: 'vrchat_me', arguments: {} });
      const meStructured = me.structuredContent as {
        user?: { id?: string; displayName?: string };
      };
      const profile = meStructured.user ?? {};
      expect(typeof profile.id).toBe('string');
      expect(profile.id?.length).toBeGreaterThan(0);
      expect(typeof profile.displayName).toBe('string');

      const friendQuery = liveConfig?.expectFriend;
      if (friendQuery) {
        const search = await client.callTool({
          name: 'vrchat_friends_search',
          arguments: { query: friendQuery },
        });
        const searchStructured = search.structuredContent as {
          matches?: { displayName?: string }[];
        };
        expect(searchStructured.matches?.length ?? 0).toBeGreaterThan(0);
      }
    },
    E2E_TIMEOUT_MS,
  );
  if (liveConfig?.bogusQuery) {
    it(
      'returns zero matches for bogus friend query',
      async () => {
        const client = harness!.client;
        await ensureLoggedIn(client, liveConfig);

        const search = await client.callTool({
          name: 'vrchat_friends_search',
          arguments: { query: liveConfig.bogusQuery },
        });
        const structured = search.structuredContent as {
          matches?: { displayName?: string }[];
        };
        expect(structured.matches?.length ?? 0).toBe(0);
      },
      E2E_TIMEOUT_MS,
    );
  } else {
    it.skip('returns zero matches for bogus friend query', () => {
      expect(true).toBe(true);
    });
  }
});


describeLiveWrites('mcp e2e (live writes)', () => {
  let harness: McpHarness | null = null;
  let instanceLocation: string | null = null;

  beforeAll(async () => {
    const cookieFile = liveConfig?.cookieFile ?? getDefaultLiveCookieFile();
    harness = await createMcpHarness({
      env: {
        VRCHAT_MCP_COOKIE_STORE: 'file',
        VRCHAT_MCP_COOKIE_FILE: cookieFile,
        VRCHAT_MCP_USER_AGENT: 'vrchat-mcp-e2e',
        VRCHAT_MCP_ALLOW_WRITES: 'true',
      },
      logStderr: liveConfig?.debug ?? false,
    });
  }, E2E_TIMEOUT_MS);

  afterAll(async () => {
    await harness?.close();
  }, E2E_TIMEOUT_MS);

  async function ensureInstanceLocation(): Promise<string> {
    if (instanceLocation) return instanceLocation;
    if (!writeConfig?.worldId) {
      throw new Error('writeTests.worldId is required for live write tests.');
    }
    const client = harness!.client;
    await ensureLoggedIn(client, liveConfig);

    const type = writeConfig.type ?? 'private';
    const region = writeConfig.region ?? 'us';
    const displayName = `mcp-e2e-${Date.now()}`;

    const created = await client.callTool({
      name: 'vrchat_instance_create',
      arguments: { worldId: writeConfig.worldId, type, region, displayName },
    });
    const structured = created.structuredContent as { instance?: unknown } | undefined;
    const instance = structured?.instance as { location?: unknown } | undefined;
    const location = typeof instance?.location === 'string' ? instance.location : undefined;
    if (!location?.includes(':')) {
      throw new Error('Expected instance location string from createInstance.');
    }
    instanceLocation = location;
    return location;
  }

  it(
    'creates an instance',
    async () => {
      const location = await ensureInstanceLocation();
      expect(typeof location).toBe('string');
    },
    E2E_TIMEOUT_MS,
  );

  it(
    'invites self to the created instance',
    async () => {
      const location = await ensureInstanceLocation();
      const client = harness!.client;
      await ensureLoggedIn(client, liveConfig);

      const result = await client.callTool({
        name: 'vrchat_invite_self',
        arguments: { location },
      });
      expect(result).toMatchObject({ structuredContent: { status: 'sent' } });
    },
    E2E_TIMEOUT_MS,
  );

  if (writeConfig?.inviteUserId) {
    it(
      'invites a user to the created instance',
      async () => {
        const location = await ensureInstanceLocation();
        const client = harness!.client;
        await ensureLoggedIn(client, liveConfig);

        const result = await client.callTool({
          name: 'vrchat_invite_user',
          arguments: { userId: writeConfig.inviteUserId, location },
        });
        expect(result).toMatchObject({ structuredContent: { status: 'sent' } });
      },
      E2E_TIMEOUT_MS,
    );
  } else {
    it.skip('invites a user to the created instance', () => {
      expect(true).toBe(true);
    });
  }
});
