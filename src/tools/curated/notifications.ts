import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  NotificationsRecentInputSchema,
  NotificationsRecentOutputSchema,
} from '../../models/notifications.js';
import { listRecentNotifications } from '../../services/notifications/index.js';
import { toolName } from '../../utils/toolNames.js';
import { textContent, toolError } from '../../utils/toolResponses.js';

export function registerCuratedNotificationTools(server: McpServer): void {
  server.registerTool(
    toolName('vrchat.notifications.recent'),
    {
      description: 'List recent notifications (read-only).',
      inputSchema: NotificationsRecentInputSchema,
      outputSchema: NotificationsRecentOutputSchema,
    },
    async (args) => {
      try {
        const result = await listRecentNotifications(args ?? {});
        const payload = {
          pageSize: result.pageSize,
          maxPages: result.maxPages,
          totalNotifications: result.notifications.length,
          truncated: result.truncated,
          stale: result.stale,
          page: result.page,
          notifications: result.notifications,
        };
        return {
          content: textContent(JSON.stringify(payload, null, 2)),
          structuredContent: payload as Record<string, unknown>,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    },
  );
}
