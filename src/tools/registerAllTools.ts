import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerAuthTools } from './auth.js';
import { registerCacheTools } from './cache.js';
import { registerCuratedAvatarTools } from './curated/avatars.js';
import { registerCuratedEventTools } from './curated/events.js';
import { registerCuratedFriendTools } from './curated/friends.js';
import { registerCuratedGroupTools } from './curated/groups.js';
import { registerCuratedInstanceTools } from './curated/instances.js';
import { registerCuratedInviteTools } from './curated/invites.js';
import { registerCuratedNotificationTools } from './curated/notifications.js';
import { registerCuratedStatusTools } from './curated/status.js';
import { registerCuratedUserTools } from './curated/users.js';
import { registerCuratedVrcxTools } from './curated/vrcx/index.js';
import { registerCuratedWorldTools } from './curated/worlds.js';
import { registerGeneratedTools } from './generated.js';
import { registerSystemReadTools } from './read/system.js';
import { registerRawTools } from './raw.js';
import { registerVrctlAuthTools } from './vrctlAuth.js';
import { registerVrctlEventTools } from './vrctlEvents.js';
import { registerVrctlMetadataTools } from './vrctlMetadata.js';
import { registerVrctlOrganizerTools } from './vrctlOrganizers.js';
import { getConfig } from '../config/index.js';

export async function registerAllTools(server: McpServer): Promise<void> {
  const config = getConfig();
  if (config.rawTools.enabled) {
    registerRawTools(server);
  }
  registerCuratedFriendTools(server);
  registerCuratedAvatarTools(server);
  registerCuratedEventTools(server);
  registerCuratedGroupTools(server);
  registerCuratedInstanceTools(server);
  registerCuratedInviteTools(server);
  registerCuratedStatusTools(server);
  registerCuratedUserTools(server);
  registerCuratedNotificationTools(server);
  registerCuratedWorldTools(server);
  registerCuratedVrcxTools(server);
  registerCacheTools(server);

  registerSystemReadTools(server);

  registerAuthTools(server);

  if (config.vrctl.enabled) {
    registerVrctlAuthTools(server);
    registerVrctlMetadataTools(server);
    registerVrctlEventTools(server);
    registerVrctlOrganizerTools(server);
  }

  await registerGeneratedTools(server);
}
