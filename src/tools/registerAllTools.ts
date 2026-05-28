import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerAuthTools } from './auth.js';
import { registerCacheTools } from './cache.js';
import { registerCuratedAvatarTools } from './curated/avatars.js';
import { registerCuratedEventTools } from './curated/events.js';
import { registerCuratedFavoriteTools } from './curated/favorites.js';
import { registerCuratedFriendTools } from './curated/friends.js';
import { registerCuratedGroupTools } from './curated/groups.js';
import { registerCuratedInstanceTools } from './curated/instances.js';
import { registerCuratedInviteTools } from './curated/invites.js';
import { registerCuratedNotificationTools } from './curated/notifications.js';
import { registerCuratedStatusPageTools } from './curated/statusPage.js';
import { registerCuratedStatusTools } from './curated/status.js';
import { registerCuratedUserTools } from './curated/users.js';
import { registerCuratedVrcxTools } from './curated/vrcx/index.js';
import { registerCuratedWorldTools } from './curated/worlds.js';
import { registerGeneratedTools } from './generated.js';
import { registerSystemReadTools } from './read/system.js';
import { registerRawTools } from './raw.js';
import { getConfig } from '../config/index.js';

export async function registerAllTools(server: McpServer): Promise<void> {
  const config = getConfig();
  if (config.rawTools.enabled) {
    registerRawTools(server);
  }
  registerCuratedFriendTools(server);
  registerCuratedAvatarTools(server);
  registerCuratedEventTools(server);
  registerCuratedFavoriteTools(server);
  registerCuratedGroupTools(server);
  registerCuratedInstanceTools(server);
  registerCuratedInviteTools(server);
  registerCuratedStatusTools(server);
  registerCuratedStatusPageTools(server);
  registerCuratedUserTools(server);
  registerCuratedNotificationTools(server);
  registerCuratedWorldTools(server);
  registerCuratedVrcxTools(server);
  registerCacheTools(server);

  registerSystemReadTools(server);

  registerAuthTools(server);

  await registerGeneratedTools(server);
}
