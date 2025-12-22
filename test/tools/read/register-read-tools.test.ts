import { describe, it, expect } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakeServer } from '../../helpers/fake-server.js';
import { registerUserReadTools } from '../../../src/tools/read/users.js';
import { registerFriendReadTools } from '../../../src/tools/read/friends.js';
import { registerWorldReadTools } from '../../../src/tools/read/worlds.js';
import { registerInstanceReadTools } from '../../../src/tools/read/instances.js';
import { registerGroupReadTools } from '../../../src/tools/read/groups.js';
import { registerNotificationReadTools } from '../../../src/tools/read/notifications.js';
import { registerCalendarReadTools } from '../../../src/tools/read/calendar.js';
import { registerAvatarReadTools } from '../../../src/tools/read/avatars.js';
import { registerFavoriteReadTools } from '../../../src/tools/read/favorites.js';
import { registerInviteMessageReadTools } from '../../../src/tools/read/inviteMessages.js';
import { registerSystemReadTools } from '../../../src/tools/read/system.js';

describe('read tool registration modules', () => {
  it('registers expected read tools', () => {
    const server = new FakeServer();
    const cast = server as unknown as McpServer;

    registerUserReadTools(cast);
    registerFriendReadTools(cast);
    registerWorldReadTools(cast);
    registerInstanceReadTools(cast);
    registerGroupReadTools(cast);
    registerNotificationReadTools(cast);
    registerCalendarReadTools(cast);
    registerAvatarReadTools(cast);
    registerFavoriteReadTools(cast);
    registerInviteMessageReadTools(cast);
    registerSystemReadTools(cast);

    const names = server.tools.map((tool) => tool.name);
    const required = [
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
      'vrchat_system_time',
    ];

    for (const name of required) {
      expect(names).toContain(name);
    }
  });
});
