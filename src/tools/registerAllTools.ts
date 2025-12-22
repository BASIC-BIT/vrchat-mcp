import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerAuthTools } from './auth.js';
import { registerCacheTools } from './cache.js';
import { registerCuratedEventTools } from './curated/events.js';
import { registerCuratedFriendTools } from './curated/friends.js';
import { registerCuratedGroupTools } from './curated/groups.js';
import { registerCuratedInstanceTools } from './curated/instances.js';
import { registerCuratedInviteTools } from './curated/invites.js';
import { registerCuratedNotificationTools } from './curated/notifications.js';
import { registerCuratedStatusTools } from './curated/status.js';
import { registerCuratedUserTools } from './curated/users.js';
import { registerCuratedWorldTools } from './curated/worlds.js';
import { registerGeneratedTools } from './generated.js';
import { registerRawTools } from './raw.js';
import { registerAvatarReadTools } from './read/avatars.js';
import { registerCalendarReadTools } from './read/calendar.js';
import { registerFavoriteReadTools } from './read/favorites.js';
import { registerFriendReadTools } from './read/friends.js';
import { registerGroupReadTools } from './read/groups.js';
import { registerInstanceReadTools } from './read/instances.js';
import { registerInviteMessageReadTools } from './read/inviteMessages.js';
import { registerNotificationReadTools } from './read/notifications.js';
import { registerSystemReadTools } from './read/system.js';
import { registerUserReadTools } from './read/users.js';
import { registerWorldReadTools } from './read/worlds.js';

export async function registerAllTools(server: McpServer): Promise<void> {
  registerRawTools(server);
  registerCuratedFriendTools(server);
  registerCuratedEventTools(server);
  registerCuratedGroupTools(server);
  registerCuratedInstanceTools(server);
  registerCuratedInviteTools(server);
  registerCuratedStatusTools(server);
  registerCuratedUserTools(server);
  registerCuratedNotificationTools(server);
  registerCuratedWorldTools(server);
  registerCacheTools(server);

  registerUserReadTools(server);
  registerFriendReadTools(server);
  registerWorldReadTools(server);
  registerInstanceReadTools(server);
  registerGroupReadTools(server);
  registerNotificationReadTools(server);
  registerCalendarReadTools(server);
  registerAvatarReadTools(server);
  registerFavoriteReadTools(server);
  registerInviteMessageReadTools(server);
  registerSystemReadTools(server);

  registerAuthTools(server);

  await registerGeneratedTools(server);
}
