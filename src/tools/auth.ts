import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { authManager } from '../auth/index.js';
import { cacheManager } from '../services/cache.js';
import { AuthStatusSchema } from '../schemas/auth.js';
import { toolName } from '../utils/toolNames.js';

export function registerAuthTools(server: McpServer): void {
  server.registerTool(
    toolName('vrchat.auth.begin'),
    {
      description: 'Begin login flow via local browser UI.',
      outputSchema: z.object({ url: z.string(), token: z.string() }),
    },
    async () => {
      const { url, token } = await authManager.startLoginServer();
      return {
        content: [{ type: 'text', text: `Open in browser: ${url}` }],
        structuredContent: { url, token },
      };
    }
  );

  server.registerTool(
    toolName('vrchat.auth.status'),
    {
      description: 'Auth status.',
      outputSchema: AuthStatusSchema,
    },
    () => {
      const status = authManager.getStatus();
      return {
        content: [{ type: 'text', text: status.loggedIn ? 'logged-in' : 'logged-out' }],
        structuredContent: status,
      };
    }
  );

  server.registerTool(
    toolName('vrchat.auth.logout'),
    {
      description: 'Logout and clear session.',
      outputSchema: AuthStatusSchema,
    },
    async () => {
      await authManager.logout();
      cacheManager.invalidateAll();
      const status = authManager.getStatus();
      return {
        content: [{ type: 'text', text: 'logged-out' }],
        structuredContent: status,
      };
    }
  );
}
