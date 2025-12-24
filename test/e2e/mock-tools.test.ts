import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { fileURLToPath } from 'node:url';
import { createMockServer, type MockServer } from '../helpers/mock-server.js';
import { createMcpHarness, type McpHarness } from '../helpers/mcp-harness.js';

const SPEC_PATH = fileURLToPath(
  new URL('../../specs/vrchat-openapi.yaml', import.meta.url),
);

describe('mcp e2e (mock tools)', () => {
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

  function getStructured(result: unknown): Record<string, unknown> {
    const record = result as {
      isError?: boolean;
      content?: { text?: string }[];
      structuredContent?: { error?: string; message?: string };
    };
    if (record.isError) {
      const text =
        record.structuredContent?.error ??
        record.structuredContent?.message ??
        record.content?.map((item) => item.text ?? '').join('\n') ??
        'Unknown error';
      throw new Error(`Tool error: ${text}`);
    }
    const structured = (result as { structuredContent?: unknown }).structuredContent;
    if (structured && typeof structured === 'object') {
      return structured as Record<string, unknown>;
    }
    const text = (result as { content?: { text?: string }[] }).content?.[0]?.text;
    if (text) {
      try {
        const parsed = JSON.parse(text) as unknown;
        if (parsed && typeof parsed === 'object') return parsed as Record<string, unknown>;
      } catch {
        // ignore
      }
    }
    return {};
  }

  function expectArrayField(result: unknown, field: string) {
    const structured = getStructured(result);
    const value = structured[field];
    expect(Array.isArray(value)).toBe(true);
    return value as unknown[];
  }

  function expectObjectField(result: unknown, field: string) {
    const structured = getStructured(result);
    const value = structured[field];
    expect(value).toBeTruthy();
    expect(typeof value).toBe('object');
    return value as Record<string, unknown>;
  }

  function expectDefinedField(result: unknown, field: string) {
    const structured = getStructured(result);
    expect(structured).toHaveProperty(field);
    return structured[field];
  }

  it('core + auth + cache tools respond', async () => {
    const client = harness!.client;

    const config = await client.callTool({ name: 'vrchat_config_get', arguments: {} });
    expectObjectField(config, 'data');

    const systemTime = await client.callTool({ name: 'vrchat_system_time', arguments: {} });
    const systemTimeValue = expectDefinedField(systemTime, 'data');
    expect(typeof systemTimeValue).toBe('string');

    const status = await client.callTool({ name: 'vrchat_auth_status', arguments: {} });
    expect(status).toMatchObject({ structuredContent: { loggedIn: false } });

    const begin = await client.callTool({ name: 'vrchat_auth_begin', arguments: {} });
    const beginStructured = begin.structuredContent as { url?: string; token?: string } | undefined;
    expect(typeof beginStructured?.url).toBe('string');
    expect(typeof beginStructured?.token).toBe('string');

    const logout = await client.callTool({ name: 'vrchat_auth_logout', arguments: {} });
    expect(logout).toMatchObject({ structuredContent: { loggedIn: false } });

    const cache = await client.callTool({ name: 'vrchat_cache_invalidate', arguments: {} });
    expect(cache).toMatchObject({ structuredContent: { scope: 'all' } });
  });

  it('user + friend tools respond', async () => {
    const client = harness!.client;
    const data = server!.data;
    const userId = data.users[0].id;
    const friend = data.friends[0];
    const friendId = friend.id;
    const friendName = friend.displayName ?? friend.username ?? friend.id;

    const me = await client.callTool({ name: 'vrchat_me', arguments: {} });
    expectObjectField(me, 'user');

    const friendsList = await client.callTool({ name: 'vrchat_friends_list', arguments: {} });
    const friends = expectArrayField(friendsList, 'friends');
    expect(friends.length).toBeGreaterThan(0);

    const search = await client.callTool({
      name: 'vrchat_friends_search',
      arguments: { query: friendName.slice(0, 3) },
    });
    expectArrayField(search, 'matches');

    const friendDetails = await client.callTool({
      name: 'vrchat_friend_details',
      arguments: { userId: friendId },
    });
    expectObjectField(friendDetails, 'friend');
    expectObjectField(friendDetails, 'profile');

    const profile = await client.callTool({
      name: 'vrchat_user_profile',
      arguments: { userId },
    });
    expectObjectField(profile, 'user');

    const groups = await client.callTool({
      name: 'vrchat_user_groups',
      arguments: { userId },
    });
    expectArrayField(groups, 'groups');
  });

  it('notifications tools respond', async () => {
    const client = harness!.client;
    const recent = await client.callTool({ name: 'vrchat_notifications_recent', arguments: {} });
    expectArrayField(recent, 'notifications');
  });

  it('world tools respond', async () => {
    const client = harness!.client;
    const data = server!.data;
    const worldId = data.worlds[0].id;

    const profile = await client.callTool({
      name: 'vrchat_world_profile',
      arguments: { worldId },
    });
    expectObjectField(profile, 'world');

    const search = await client.callTool({
      name: 'vrchat_worlds_search',
      arguments: { query: 'Mock' },
    });
    expectArrayField(search, 'worlds');

    const favorites = await client.callTool({ name: 'vrchat_worlds_favorites', arguments: {} });
    expectArrayField(favorites, 'worlds');

    const overview = await client.callTool({
      name: 'vrchat_world_instances_overview',
      arguments: { worldId },
    });
    expectObjectField(overview, 'instances');
  });

  it('group tools respond', async () => {
    const client = harness!.client;
    const data = server!.data;
    const groupId = data.groups[0]?.id;
    if (!groupId) {
      throw new Error('Missing group fixture');
    }

    const search = await client.callTool({
      name: 'vrchat_groups_search',
      arguments: { query: data.groups[0].name ?? 'Mock' },
    });
    expectArrayField(search, 'groups');

    const profile = await client.callTool({
      name: 'vrchat_group_profile',
      arguments: { groupId },
    });
    expectObjectField(profile, 'group');

    const members = await client.callTool({
      name: 'vrchat_group_members',
      arguments: { groupId },
    });
    expectArrayField(members, 'members');

    const announcement = await client.callTool({
      name: 'vrchat_group_announcement',
      arguments: { groupId },
    });
    expectDefinedField(announcement, 'announcement');

    const posts = await client.callTool({
      name: 'vrchat_group_posts_recent',
      arguments: { groupId },
    });
    expectArrayField(posts, 'posts');

    const events = await client.callTool({
      name: 'vrchat_group_events_list',
      arguments: { groupId },
    });
    expectArrayField(events, 'events');

    const calendarId =
      data.calendarGroupEvents[groupId]?.[0]?.id ?? data.calendarEvents[0]?.id;
    if (!calendarId) {
      throw new Error('Missing group calendar event fixture');
    }
    const event = await client.callTool({
      name: 'vrchat_group_event_get',
      arguments: { groupId, calendarId },
    });
    expectObjectField(event, 'event');

    const upcoming = await client.callTool({
      name: 'vrchat_group_events_upcoming',
      arguments: { groupId },
    });
    expectArrayField(upcoming, 'events');

    const instances = await client.callTool({
      name: 'vrchat_group_instances_overview',
      arguments: { groupId },
    });
    expectArrayField(instances, 'instances');
  });

  it('calendar tools respond', async () => {
    const client = harness!.client;
    const events = await client.callTool({
      name: 'vrchat_events_upcoming',
      arguments: {},
    });
    expectArrayField(events, 'events');

    const search = await client.callTool({
      name: 'vrchat_events_search',
      arguments: { searchTerm: 'Event' },
    });
    expectArrayField(search, 'events');
  });
});
