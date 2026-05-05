import { Client } from '@modelcontextprotocol/sdk/client';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

type JsonRecord = Record<string, unknown>;
type ToolStatus = 'PASS' | 'WARN' | 'FAIL';

interface SmokeResult extends JsonRecord {
  label: string;
  tool?: string;
  status: ToolStatus;
  error?: string;
}

interface ToolResponse {
  isError?: boolean;
  content?: { type?: string; text?: string }[];
  structuredContent?: unknown;
}

interface SmokeCase {
  label: string;
  tool: string;
  args?: JsonRecord;
  optional?: boolean;
  summarize?: (value: unknown) => JsonRecord;
}

function asRecord(value: unknown): JsonRecord | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonRecord)
    : undefined;
}

function getRecord(value: unknown, key: string): JsonRecord | undefined {
  return asRecord(asRecord(value)?.[key]);
}

function getArray(value: unknown, key: string): unknown[] {
  const entry = asRecord(value)?.[key];
  return Array.isArray(entry) ? entry : [];
}

function getBoolean(value: unknown, key: string): boolean | undefined {
  const entry = asRecord(value)?.[key];
  return typeof entry === 'boolean' ? entry : undefined;
}

function getNumber(value: unknown, key: string): number | undefined {
  const entry = asRecord(value)?.[key];
  return typeof entry === 'number' ? entry : undefined;
}

function getString(value: unknown, key: string): string | undefined {
  const entry = asRecord(value)?.[key];
  return typeof entry === 'string' ? entry : undefined;
}

function envString(key: string): string | undefined {
  const value = process.env[key]?.trim();
  if (!value) return undefined;
  return value;
}

function count(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

function errorText(response: ToolResponse): string | undefined {
  return response.content
    ?.find((item) => item.type === 'text')
    ?.text?.replace(/\s+/g, ' ')
    .slice(0, 220);
}

function makeTransport(): StdioClientTransport {
  return new StdioClientTransport({
    command: process.env.VRCHAT_MCP_SERVER_COMMAND ?? 'node',
    args: (process.env.VRCHAT_MCP_SERVER_ARGS ?? 'dist/bin/cli.js')
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean),
    cwd: process.env.VRCHAT_MCP_SERVER_CWD ?? process.cwd(),
    env: {
      ...process.env,
      VRCHAT_MCP_PIPELINE_ENABLED: process.env.VRCHAT_MCP_PIPELINE_ENABLED ?? 'false',
      VRCHAT_MCP_COOKIE_STORE: process.env.VRCHAT_MCP_COOKIE_STORE ?? 'file',
      VRCHAT_MCP_USER_AGENT: process.env.VRCHAT_MCP_USER_AGENT ?? 'vrchat-mcp-live-smoke',
    },
    stderr: 'pipe',
  });
}

async function smoke(
  client: Client,
  test: SmokeCase,
): Promise<{ result: SmokeResult; data?: unknown }> {
  try {
    const response = (await client.callTool({
      name: test.tool,
      arguments: test.args ?? {},
    })) as ToolResponse;

    if (response.isError) {
      return {
        result: {
          label: test.label,
          tool: test.tool,
          status: test.optional ? 'WARN' : 'FAIL',
          error: errorText(response),
        },
      };
    }

    return {
      result: {
        label: test.label,
        tool: test.tool,
        status: 'PASS',
        ...(test.summarize?.(response.structuredContent) ?? {}),
      },
      data: response.structuredContent,
    };
  } catch (err) {
    return {
      result: {
        label: test.label,
        tool: test.tool,
        status: test.optional ? 'WARN' : 'FAIL',
        error: err instanceof Error ? err.message.slice(0, 220) : String(err).slice(0, 220),
      },
    };
  }
}

async function runSmokeMatrix(client: Client): Promise<SmokeResult[]> {
  const results: SmokeResult[] = [];
  const targetFriendUserId = envString('VRCHAT_MCP_SMOKE_FRIEND_USER_ID');
  const targetFriendName = envString('VRCHAT_MCP_SMOKE_FRIEND_NAME');
  const targetWorldId = envString('VRCHAT_MCP_SMOKE_WORLD_ID');
  const worldSearchQuery = envString('VRCHAT_MCP_SMOKE_WORLD_QUERY') ?? 'test';
  const targetGroupId = envString('VRCHAT_MCP_SMOKE_GROUP_ID');
  const run = async (test: SmokeCase): Promise<unknown> => {
    const outcome = await smoke(client, test);
    results.push(outcome.result);
    return outcome.data;
  };

  await run({
    label: 'auth status',
    tool: 'vrchat_auth_status',
    summarize: (value) => ({ loggedIn: getBoolean(value, 'loggedIn') }),
  });
  await run({
    label: 'config',
    tool: 'vrchat_config_get',
    args: {
      fields: ['clientApiKey', 'currentTOSVersion'],
      compact: true,
      maxArrayLength: 5,
      includeMeta: false,
      page: { enabled: false, size: 10, maxPages: 1, maxItems: 10, offset: 0 },
    },
    summarize: (value) => ({ keys: Object.keys(getRecord(value, 'data') ?? asRecord(value) ?? {}).length }),
  });
  await run({
    label: 'system time',
    tool: 'vrchat_system_time',
    args: {
      fields: [],
      compact: true,
      maxArrayLength: 5,
      includeMeta: false,
      page: { enabled: false, size: 10, maxPages: 1, maxItems: 10, offset: 0 },
    },
  });
  await run({
    label: 'status page',
    tool: 'vrchat_status_page_overview',
    args: { recentHours: 24, maxItems: 2, includeGraphs: false },
    summarize: (value) => ({ up: getBoolean(getRecord(value, 'status'), 'up') }),
  });

  const me = await run({
    label: 'me summary',
    tool: 'vrchat_me',
    args: {
      view: 'summary',
      includeGroups: false,
      compact: true,
      maxArrayLength: 5,
      fields: [],
      groupPageSize: 5,
      groupMaxPages: 1,
      groupOffset: 0,
    },
    summarize: (value) => ({
      userId: Boolean(getString(value, 'userId')),
      displayName: Boolean(getString(getRecord(value, 'user'), 'displayName')),
    }),
  });
  const userId = getString(me, 'userId');

  await run({
    label: 'status get',
    tool: 'vrchat_status_get',
    summarize: (value) => ({ statusValue: getString(value, 'status') }),
  });
  await run({
    label: 'self profile',
    tool: 'vrchat_user_profile',
    args: {
      userId,
      fields: ['id', 'displayName', 'status'],
      compact: true,
      maxArrayLength: 5,
      includeGroups: false,
      groupPageSize: 5,
      groupMaxPages: 1,
      groupOffset: 0,
    },
    summarize: (value) => ({ userId: Boolean(getString(value, 'userId')) }),
  });
  const userGroups = await run({
    label: 'user groups',
    tool: 'vrchat_user_groups',
    args: { userId, pageSize: 3, maxPages: 1, offset: 0 },
    summarize: (value) => ({
      groups: count(getArray(value, 'groups')),
      truncated: getBoolean(value, 'truncated'),
    }),
  });

  const friendsList = await run({
    label: 'friends list',
    tool: 'vrchat_friends_list',
    args: { includeOffline: false, maxItems: 3, detailLevel: 'summary' },
    summarize: (value) => ({
      total: getNumber(value, 'totalFriends'),
      truncated: getBoolean(value, 'truncated'),
    }),
  });
  const firstFriend = asRecord(getArray(friendsList, 'friends')[0]);
  await run({
    label: 'friends overview',
    tool: 'vrchat_friends_overview',
    args: { maxLocations: 3 },
    summarize: (value) => ({
      online: getNumber(value, 'onlineCount'),
      returnedLocations: getNumber(value, 'returnedLocations'),
      truncated: getBoolean(value, 'locationsTruncated'),
    }),
  });
  const friendSearchName = targetFriendName ?? getString(firstFriend, 'displayName');
  let friendId = targetFriendUserId ?? (targetFriendName ? undefined : getString(firstFriend, 'userId'));
  if (friendSearchName) {
    const friendsSearch = await run({
      label: 'friends search',
      tool: 'vrchat_friends_search',
      args: { query: friendSearchName, includeOffline: true, maxResults: 3 },
      summarize: (value) => ({ matches: count(getArray(value, 'matches')) }),
    });
    friendId = friendId ?? getString(asRecord(getArray(friendsSearch, 'matches')[0]), 'userId');
    if (targetFriendName && !friendId) {
      results.push({
        label: 'target friend lookup',
        status: 'FAIL',
        error: `No friend found for VRCHAT_MCP_SMOKE_FRIEND_NAME=${targetFriendName}`,
      });
    }
  }
  if (friendId) {
    await run({
      label: 'friend details',
      tool: 'vrchat_friend_details',
      args: { userId: friendId, includeOffline: true },
      summarize: (value) => ({
        hasProfile: Boolean(getRecord(value, 'profile')),
        locationType: getString(getRecord(value, 'location'), 'type'),
      }),
    });
  }

  const worldSearch = await run({
    label: 'worlds search',
    tool: 'vrchat_worlds_search',
    args: { query: worldSearchQuery, maxItems: 3, includeTags: false },
    summarize: (value) => ({
      worlds: count(getArray(value, 'worlds')),
      truncated: getBoolean(getRecord(value, 'page'), 'truncated'),
    }),
  });
  const worldId = targetWorldId ?? getString(asRecord(getArray(worldSearch, 'worlds')[0]), 'worldId');
  if (worldId) {
    await run({
      label: 'world profile',
      tool: 'vrchat_world_profile',
      args: {
        worldId,
        fields: ['id', 'name', 'authorName', 'occupants'],
        compact: true,
        maxArrayLength: 5,
      },
      summarize: (value) => ({ worldId: Boolean(getString(value, 'worldId')) }),
    });
    await run({
      label: 'world instances',
      tool: 'vrchat_world_instances_overview',
      args: { worldId },
      summarize: (value) => ({ totalInstances: getNumber(value, 'totalInstances') }),
    });
    await run({
      label: 'vrcx world memo',
      tool: 'vrcx_memos_world_get',
      args: { worldId },
      optional: true,
      summarize: (value) => ({ hasMemo: Boolean(getString(value, 'memo')) }),
    });
  }
  await run({
    label: 'world favorites',
    tool: 'vrchat_worlds_favorites',
    args: { maxItems: 3, includeTags: false },
    summarize: (value) => ({
      worlds: count(getArray(value, 'worlds')),
      truncated: getBoolean(getRecord(value, 'page'), 'truncated'),
    }),
  });

  await run({
    label: 'events discover',
    tool: 'vrchat_events_discover',
    args: { scope: 'upcoming', maxItems: 3, pageSize: 50, maxPages: 2 },
    summarize: (value) => ({
      events: count(getArray(value, 'events')),
      truncated: getBoolean(value, 'truncated'),
    }),
  });
  await run({
    label: 'events upcoming',
    tool: 'vrchat_events_upcoming',
    args: { windowHours: 24, maxItems: 3, pageSize: 50, maxPages: 2 },
    summarize: (value) => ({
      events: count(getArray(value, 'events')),
      truncated: getBoolean(value, 'truncated'),
    }),
  });
  await run({
    label: 'events search',
    tool: 'vrchat_events_search',
    args: { searchTerm: 'dance', maxItems: 3, pageSize: 50, maxPages: 2 },
    summarize: (value) => ({
      events: count(getArray(value, 'events')),
      truncated: getBoolean(value, 'truncated'),
    }),
  });

  const group = asRecord(getArray(userGroups, 'groups')[0]);
  const groupId = targetGroupId ?? getString(group, 'groupId') ?? getString(group, 'id');
  if (groupId) {
    await run({
      label: 'group profile',
      tool: 'vrchat_group_profile',
      args: {
        groupId,
        fields: ['id', 'name', 'shortCode', 'memberCount'],
        compact: true,
        maxArrayLength: 5,
      },
      summarize: (value) => ({ groupId: Boolean(getString(value, 'groupId')) }),
    });
    await run({
      label: 'group members',
      tool: 'vrchat_group_members',
      args: { groupId, pageSize: 3, maxPages: 1 },
      optional: true,
      summarize: (value) => ({
        members: count(getArray(value, 'members')),
        truncated: getBoolean(value, 'truncated'),
      }),
    });
    await run({
      label: 'group posts',
      tool: 'vrchat_group_posts_recent',
      args: { groupId, pageSize: 2, maxPages: 1 },
      optional: true,
      summarize: (value) => ({
        posts: count(getArray(value, 'posts')),
        truncated: getBoolean(value, 'truncated'),
      }),
    });
    const groupEvents = await run({
      label: 'group events list',
      tool: 'vrchat_group_events_list',
      args: { groupId, maxItems: 2, pageSize: 50, maxPages: 1 },
      optional: true,
      summarize: (value) => ({
        events: count(getArray(value, 'events')),
        truncated: getBoolean(value, 'truncated'),
      }),
    });
    const calendarId = getString(asRecord(getArray(groupEvents, 'events')[0]), 'id');
    if (calendarId) {
      await run({
        label: 'group event get',
        tool: 'vrchat_group_event_get',
        args: {
          groupId,
          calendarId,
          fields: ['id', 'title', 'startsAt'],
          compact: true,
          maxArrayLength: 5,
        },
        optional: true,
        summarize: (value) => ({ hasEvent: Boolean(getRecord(value, 'event')) }),
      });
    }
    const groupEventsUpcoming = await run({
      label: 'group events upcoming',
      tool: 'vrchat_group_events_upcoming',
      args: { groupId, windowHours: 168, maxItems: 2, pageSize: 50, maxPages: 1 },
      optional: true,
      summarize: (value) => ({
        events: count(getArray(value, 'events')),
        truncated: getBoolean(value, 'truncated'),
      }),
    });
    if (getArray(groupEventsUpcoming, 'events').length > 0) {
      await run({
        label: 'group event next',
        tool: 'vrchat_group_event_next',
        args: { groupId, fields: ['id', 'title', 'startsAt'], compact: true, maxArrayLength: 5 },
        optional: true,
        summarize: (value) => ({ hasEvent: Boolean(getRecord(value, 'event')) }),
      });
    }
    await run({
      label: 'group instances',
      tool: 'vrchat_group_instances_overview',
      args: { groupId, maxInstances: 10 },
      optional: true,
      summarize: (value) => ({
        instances: getNumber(value, 'totalInstances'),
        members: getNumber(value, 'totalMembers'),
      }),
    });
  } else {
    results.push({
      label: 'group dependent checks',
      status: 'WARN',
      error: 'No groupId available from vrchat_user_groups.',
    });
  }

  await run({
    label: 'notifications recent',
    tool: 'vrchat_notifications_recent',
    args: { maxItems: 3, pageSize: 50, maxPages: 1 },
    summarize: (value) => ({
      notifications: count(getArray(value, 'notifications')),
      truncated: getBoolean(value, 'truncated'),
    }),
  });
  await run({
    label: 'vrcx status',
    tool: 'vrcx_db_status',
    optional: true,
    summarize: (value) => ({
      enabled: getBoolean(value, 'enabled'),
      available: getBoolean(value, 'available'),
    }),
  });
  if (userId) {
    await run({
      label: 'vrcx user memo',
      tool: 'vrcx_memos_user_get',
      args: { userId },
      optional: true,
      summarize: (value) => ({ hasMemo: Boolean(getString(value, 'memo')) }),
    });
  }

  return results;
}

function summarizeResults(results: SmokeResult[]): JsonRecord {
  const passed = results.filter((result) => result.status === 'PASS').length;
  const warned = results.filter((result) => result.status === 'WARN').length;
  const failed = results.filter((result) => result.status === 'FAIL').length;
  return { passed, warned, failed, results };
}

const transport = makeTransport();
transport.stderr?.on('data', (chunk: Buffer) => {
  if (process.env.VRCHAT_MCP_SMOKE_VERBOSE === '1') process.stderr.write(chunk);
});

const client = new Client({ name: 'vrchat-live-smoke', version: '0.1.0' });
await client.connect(transport);

try {
  const results = await runSmokeMatrix(client);
  const summary = summarizeResults(results);
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  if (summary.failed !== 0) process.exitCode = 1;
} finally {
  await transport.close();
}
