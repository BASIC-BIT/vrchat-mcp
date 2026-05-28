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
      'vrchat_friends_search',
      'vrchat_friends_list',
      'vrchat_friends_overview',
      'vrchat_friend_details',
      'vrchat_user_profile',
      'vrchat_user_groups',
      'vrchat_groups_search',
      'vrchat_group_profile',
      'vrchat_group_members',
      'vrchat_group_roles',
      'vrchat_group_roles_manage',
      'vrchat_group_posts_recent',
      'vrchat_group_events_list',
      'vrchat_group_event_get',
      'vrchat_group_events_upcoming',
      'vrchat_group_instances_overview',
      'vrchat_avatar_profile',
      'vrchat_worlds_search',
      'vrchat_worlds_favorites',
      'vrchat_world_profile',
      'vrchat_world_instances_overview',
      'vrchat_favorites',
      'vrchat_favorite_add',
      'vrchat_favorite_remove',
      'vrchat_notifications_recent',
      'vrchat_instance_create',
      'vrchat_invite',
      'vrchat_group_invite',
      'vrchat_friend_request',
      'vrchat_boop',
      'vrchat_invite_self',
      'vrchat_invite_user',
      'vrchat_invite_user_to_me',
      'vrchat_status_get',
      'vrchat_status_set',
      'vrchat_status_page_overview',
      'vrchat_events_upcoming',
      'vrchat_events_search',
      'vrchat_event_create',
      'vrchat_event_update',
      'vrchat_event_delete',
      'vrchat_cache_invalidate',
      'vrchat_me',
      'vrchat_config_get',
      'vrchat_operation_details',
      'vrchat_system_time',
      'vrchat_auth_begin',
      'vrchat_auth_status',
      'vrchat_auth_logout',

      'vrcx_db_status',
      'vrcx_memos_user_get',
      'vrcx_memos_world_get',
      'vrcx_memos_avatar_get',
      'vrcx_gamelog_world_visits_recent',
      'vrcx_instances_recent',
      'vrcx_user_relationship_summary',
      'vrcx_user_relationship_sessions',
    ];

    for (const name of required) {
      expect(names).toContain(name);
    }

    expect(names).not.toContain('vrchat_call');

    expect(registerGeneratedTools).toHaveBeenCalledTimes(1);
  });
});
