import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { createMockServer, type MockServer } from '../helpers/mock-server.js';
import { createMcpHarness, type McpHarness } from '../helpers/mcp-harness.js';
import { resolveSpecPath } from '../helpers/spec-path.js';

const SPEC_PATH = resolveSpecPath(import.meta.url);

describe('mcp e2e (mock writes)', () => {
  let server: MockServer | null = null;
  let harness: McpHarness | null = null;
  let instanceLocation: string | null = null;
  let createdEventId: string | null = null;

  beforeAll(async () => {
    server = await createMockServer();
    harness = await createMcpHarness({
      env: {
        VRCHAT_MCP_API_BASE: server.baseUrl,
        VRCHAT_MCP_SPEC_URL: SPEC_PATH,
        VRCHAT_MCP_COOKIE_STORE: 'memory',
        VRCHAT_MCP_USER_AGENT: 'vrchat-mcp-e2e',
        VRCHAT_MCP_ALLOW_WRITES: 'true',
      },
    });
  }, 20000);

  afterAll(async () => {
    if (harness) await harness.close();
    if (server) await server.close();
  }, 20000);

  async function ensureGroupEvent(): Promise<{ groupId: string; calendarId: string }> {
    if (createdEventId) {
      return { groupId: server!.data.groups[0].id, calendarId: createdEventId };
    }
    const client = harness!.client;
    const groupId = server!.data.groups[0]?.id;
    expect(typeof groupId).toBe('string');

    const created = await client.callTool({
      name: 'vrchat_event_create',
      arguments: {
        groupId,
        title: 'Mock Event',
        description: 'Mock description',
        category: 'hangout',
        startsAt: '2025-12-22T20:00:00Z',
        endsAt: '2025-12-22T21:00:00Z',
      },
    });
    const structured = created.structuredContent as { event?: unknown } | undefined;
    const event = structured?.event as { id?: unknown } | undefined;
    const calendarId = typeof event?.id === 'string' ? event.id : undefined;
    if (!calendarId) {
      throw new Error('Expected calendar event id from create.');
    }
    createdEventId = calendarId;
    return { groupId, calendarId };
  }

  async function ensureInstanceLocation(): Promise<string> {
    if (instanceLocation) return instanceLocation;
    const client = harness!.client;
    const worldId = server!.data.worlds[0]?.id;
    expect(typeof worldId).toBe('string');

    const created = await client.callTool({
      name: 'vrchat_instance_create',
      arguments: { worldId, type: 'private', region: 'us', displayName: 'Mock Instance' },
    });
    const structured = created.structuredContent as { instance?: unknown } | undefined;
    const instance = structured?.instance as { location?: unknown } | undefined;
    const location = typeof instance?.location === 'string' ? instance.location : undefined;
    if (!location) {
      throw new Error('Expected instance location from createInstance.');
    }
    instanceLocation = location;
    return location;
  }

  it('creates an instance', async () => {
    const location = await ensureInstanceLocation();
    expect(location.length).toBeGreaterThan(0);
  });

  it('invites self', async () => {
    const client = harness!.client;
    const location = await ensureInstanceLocation();
    const result = await client.callTool({
      name: 'vrchat_invite_self',
      arguments: { location },
    });
    expect(result).toMatchObject({ structuredContent: { status: 'sent' } });
  });

  it('invites a user', async () => {
    const client = harness!.client;
    const location = await ensureInstanceLocation();
    const userId = server!.data.users[1]?.id ?? server!.data.users[0]?.id;
    expect(typeof userId).toBe('string');

    const result = await client.callTool({
      name: 'vrchat_invite_user',
      arguments: { userId, location },
    });
    expect(result).toMatchObject({ structuredContent: { status: 'sent' } });
  });

  it('updates profile', async () => {
    const client = harness!.client;
    const result = await client.callTool({
      name: 'vrchat_profile_update',
      arguments: { bio: 'Mock bio update' },
    });
    const structured = result.structuredContent as { user?: { bio?: string } } | undefined;
    expect(structured?.user?.bio).toBe('Mock bio update');
  });

  it('lists upcoming group events', async () => {
    const client = harness!.client;
    const groupId = server!.data.groups[0]?.id;
    expect(typeof groupId).toBe('string');
    const result = await client.callTool({
      name: 'vrchat_group_events_upcoming',
      arguments: {
        groupId,
        from: '2025-12-30T00:00:00Z',
        windowHours: 48,
      },
    });
    const structured = result.structuredContent as { totalEvents?: number } | undefined;
    expect((structured?.totalEvents ?? 0) >= 1).toBe(true);
  });

  it('creates, updates, and deletes a group event', async () => {
    const client = harness!.client;
    const { groupId, calendarId } = await ensureGroupEvent();

    const updateResult = await client.callTool({
      name: 'vrchat_event_update',
      arguments: { groupId, calendarId, title: 'Updated Event' },
    });
    const updated = updateResult.structuredContent as { event?: { title?: string } };
    expect(updated?.event?.title).toBe('Updated Event');

    const deleteResult = await client.callTool({
      name: 'vrchat_event_delete',
      arguments: { groupId, calendarId },
    });
    expect(deleteResult).toMatchObject({ structuredContent: { status: 'deleted' } });
  });
});
