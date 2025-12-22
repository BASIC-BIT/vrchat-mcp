import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { fileURLToPath } from 'node:url';
import { createMockServer, type MockServer } from '../helpers/mock-server.js';
import { createMcpHarness, type McpHarness } from '../helpers/mcp-harness.js';

const SPEC_PATH = fileURLToPath(new URL('../fixtures/spec.yaml', import.meta.url));

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

  function expectDataArray(result: unknown) {
    const structured = result as { structuredContent?: { data?: unknown } };
    const data = structured.structuredContent?.data;
    expect(Array.isArray(data)).toBe(true);
    expect((data as unknown[]).length).toBeGreaterThan(0);
    return data as unknown[];
  }

  function expectDataObject(result: unknown) {
    const structured = result as { structuredContent?: { data?: unknown } };
    const data = structured.structuredContent?.data;
    expect(data).toBeTruthy();
    expect(typeof data).toBe('object');
    return data as Record<string, unknown>;
  }

  function expectWorldList(result: unknown) {
    const structured = result as { structuredContent?: { worlds?: unknown } };
    const worlds = structured.structuredContent?.worlds;
    expect(Array.isArray(worlds)).toBe(true);
    expect((worlds as unknown[]).length).toBeGreaterThan(0);
    return worlds as unknown[];
  }

  it('core + auth + cache tools respond', async () => {
    const client = harness!.client;

    const config = await client.callTool({ name: 'vrchat_config_get', arguments: {} });
    expectDataObject(config);

    const systemTime = await client.callTool({ name: 'vrchat_system_time', arguments: {} });
    expectDataObject(systemTime);

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
    const username = data.users[0].username ?? data.users[0].displayName;
    const friendId = data.friends[0].id;

    expectDataObject(await client.callTool({ name: 'vrchat_me', arguments: {} }));
    expectDataArray(await client.callTool({ name: 'vrchat_friends_list', arguments: {} }));
    expectDataObject(await client.callTool({ name: 'vrchat_friends_status', arguments: { userId: friendId } }));
    expectDataObject(await client.callTool({ name: 'vrchat_users_get', arguments: { userId } }));
    expectDataObject(
      await client.callTool({ name: 'vrchat_users_getByName', arguments: { username } }),
    );
    expectDataArray(await client.callTool({ name: 'vrchat_users_search', arguments: { search: 'na' } }));

    expectDataArray(
      await client.callTool({ name: 'vrchat_users_groups_list', arguments: { userId } }),
    );
    expectDataArray(
      await client.callTool({ name: 'vrchat_users_groups_requests', arguments: { userId } }),
    );
    expectDataObject(
      await client.callTool({ name: 'vrchat_users_groups_represented', arguments: { userId } }),
    );
  });

  it('notifications + invite messages respond', async () => {
    const client = harness!.client;
    const data = server!.data;
    const notificationId = data.notifications[0].id;
    const invite = data.inviteMessages[0];

    expectDataArray(await client.callTool({ name: 'vrchat_notifications_list', arguments: {} }));
    expectDataObject(
      await client.callTool({ name: 'vrchat_notifications_get', arguments: { notificationId } }),
    );

    expectDataArray(
      await client.callTool({
        name: 'vrchat_invite_messages_list',
        arguments: { userId: invite.userId, messageType: invite.messageType },
      }),
    );
    expectDataObject(
      await client.callTool({
        name: 'vrchat_invite_messages_get',
        arguments: {
          userId: invite.userId,
          messageType: invite.messageType,
          slot: invite.slot,
        },
      }),
    );
  });

  it('world + instance tools respond', async () => {
    const client = harness!.client;
    const data = server!.data;
    const worldId = data.worlds[0].id;
    const instanceKey = Object.keys(data.instances)[0];
    const [instanceWorldId, instanceId] = instanceKey.split(':');
    const shortName = Object.keys(data.instancesByShortName)[0];

    expectDataObject(await client.callTool({ name: 'vrchat_worlds_get', arguments: { worldId } }));
    expectWorldList(await client.callTool({ name: 'vrchat_worlds_search', arguments: { query: 'Mock' } }));
    expectDataArray(await client.callTool({ name: 'vrchat_worlds_active', arguments: {} }));
    expectDataArray(await client.callTool({ name: 'vrchat_worlds_recent', arguments: {} }));
    expectWorldList(await client.callTool({ name: 'vrchat_worlds_favorites', arguments: {} }));

    expectDataObject(
      await client.callTool({
        name: 'vrchat_instances_get',
        arguments: { worldId: instanceWorldId ?? worldId, instanceId: instanceId ?? 'inst_1' },
      }),
    );
    expectDataObject(
      await client.callTool({ name: 'vrchat_instances_getByShortName', arguments: { shortName } }),
    );
    expectDataArray(await client.callTool({ name: 'vrchat_instances_recent', arguments: {} }));
  });

  it('avatar + favorite tools respond', async () => {
    const client = harness!.client;
    const data = server!.data;
    const avatarId = data.avatars[0].id;

    expectDataObject(await client.callTool({ name: 'vrchat_avatars_get', arguments: { avatarId } }));
    expectDataArray(await client.callTool({ name: 'vrchat_avatars_search', arguments: {} }));
    expectDataArray(await client.callTool({ name: 'vrchat_avatars_favorites', arguments: {} }));

    expectDataArray(await client.callTool({ name: 'vrchat_favorites_list', arguments: {} }));
    expectDataArray(await client.callTool({ name: 'vrchat_favorite_groups_list', arguments: {} }));
    expectDataObject(await client.callTool({ name: 'vrchat_favorites_limits', arguments: {} }));
  });

  it('group tools respond', async () => {
    const client = harness!.client;
    const data = server!.data;
    const groupId = data.groups[0].id;
    const member = data.groupMembers[groupId][0];

    expectDataObject(await client.callTool({ name: 'vrchat_groups_get', arguments: { groupId } }));
    expectDataArray(
      await client.callTool({ name: 'vrchat_groups_members_list', arguments: { groupId } }),
    );
    expectDataObject(
      await client.callTool({
        name: 'vrchat_groups_members_get',
        arguments: { groupId, userId: member.userId },
      }),
    );
    expectDataArray(
      await client.callTool({ name: 'vrchat_groups_roles_list', arguments: { groupId } }),
    );
    expectDataArray(
      await client.callTool({ name: 'vrchat_groups_permissions_list', arguments: { groupId } }),
    );
    expectDataArray(
      await client.callTool({ name: 'vrchat_groups_announcements_get', arguments: { groupId } }),
    );
    expectDataArray(
      await client.callTool({ name: 'vrchat_groups_posts_list', arguments: { groupId } }),
    );
    expectDataArray(
      await client.callTool({ name: 'vrchat_groups_instances_list', arguments: { groupId } }),
    );
  });

  it('calendar tools respond', async () => {
    const client = harness!.client;
    const data = server!.data;
    const groupId = data.groups[0].id;
    const calendarId = data.calendarGroupEvents[groupId][0].id;

    expectDataArray(await client.callTool({ name: 'vrchat_calendar_events_list', arguments: {} }));
    expectDataArray(await client.callTool({ name: 'vrchat_calendar_featured_list', arguments: {} }));
    expectDataArray(await client.callTool({ name: 'vrchat_calendar_followed_list', arguments: {} }));
    expectDataArray(
      await client.callTool({ name: 'vrchat_calendar_search', arguments: { searchTerm: 'Event' } }),
    );
    const groupEvents = await client.callTool({
      name: 'vrchat_group_events_list',
      arguments: { groupId },
    });
    const groupEventsStructured = groupEvents.structuredContent as { events?: unknown[] };
    expect(Array.isArray(groupEventsStructured.events)).toBe(true);
    expect(groupEventsStructured.events?.length ?? 0).toBeGreaterThan(0);

    const groupEvent = await client.callTool({
      name: 'vrchat_group_event_get',
      arguments: { groupId, calendarId },
    });
    const groupEventStructured = groupEvent.structuredContent as { event?: unknown };
    expect(groupEventStructured.event).toBeTruthy();
  });

  it('raw tool responds', async () => {
    const client = harness!.client;
    const res = await client.callTool({ name: 'vrchat_call', arguments: { operationId: 'getConfig' } });
    const structured = res.structuredContent as { data?: unknown };
    expect(structured.data).toBeTruthy();
  });
});
