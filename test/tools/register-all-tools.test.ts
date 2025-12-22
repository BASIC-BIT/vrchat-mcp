import { describe, it, expect, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakeServer } from '../helpers/fake-server.js';

vi.mock('../../src/tools/generated.js', () => {
  return {
    registerGeneratedTools: vi.fn().mockResolvedValue(undefined),
  };
});

import { registerAllTools } from '../../src/tools/registerAllTools.js';
import { registerGeneratedTools } from '../../src/tools/generated.js';

describe('registerAllTools', () => {
  it('registers curated and read tools with expected names', async () => {
    const server = new FakeServer();
    await registerAllTools(server as unknown as McpServer);

    const names = server.tools.map((tool) => tool.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);

    const required = [
      'vrchat_call',
      'vrchat_friends_search',
      'vrchat_friends_all',
      'vrchat_friends_online',
      'vrchat_friends_overview',
      'vrchat_friend_location_details',
      'vrchat_user_profile',
      'vrchat_user_groups',
      'vrchat_groups_search',
      'vrchat_group_profile',
      'vrchat_group_members',
      'vrchat_group_announcement',
      'vrchat_group_posts_recent',
      'vrchat_group_events_list',
      'vrchat_group_event_get',
      'vrchat_group_events_upcoming',
      'vrchat_group_instances_overview',
      'vrchat_worlds_search',
      'vrchat_worlds_favorites',
      'vrchat_world_profile',
      'vrchat_world_instances_overview',
      'vrchat_notifications_recent',
      'vrchat_instance_create',
      'vrchat_invite_self',
      'vrchat_invite_user',
      'vrchat_status_get',
      'vrchat_status_set',
      'vrchat_events_upcoming',
      'vrchat_events_search',
      'vrchat_event_create',
      'vrchat_event_update',
      'vrchat_event_delete',
      'vrchat_cache_invalidate',
      'vrchat_me',
      'vrchat_friends_list',
      'vrchat_worlds_get',
      'vrchat_instances_get',
      'vrchat_groups_get',
      'vrchat_notifications_list',
      'vrchat_calendar_events_list',
      'vrchat_avatars_get',
      'vrchat_favorites_list',
      'vrchat_invite_messages_list',
      'vrchat_config_get',
      'vrchat_auth_begin',
      'vrchat_auth_status',
      'vrchat_auth_logout',
    ];

    for (const name of required) {
      expect(names).toContain(name);
    }

    expect(registerGeneratedTools).toHaveBeenCalledTimes(1);
  });
});
