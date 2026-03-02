import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { vrctlAuthManager } from '../vrctl/auth.js';
import { VrctlAuthStatusSchema } from '../schemas/vrctlAuth.js';
import { readOnlyToolAnnotations, writeToolAnnotations } from '../utils/toolAnnotations.js';
import { toolName } from '../utils/toolNames.js';

export function registerVrctlAuthTools(server: McpServer): void {
  server.registerTool(
    toolName('vrctl.auth.begin'),
    {
      description: 'Begin vrc.tl login flow via local browser UI (cookie import).',
      outputSchema: z.object({ url: z.string(), token: z.string() }),
      annotations: writeToolAnnotations,
    },
    async () => {
      const { url, token } = await vrctlAuthManager.startLoginServer();
      return {
        content: [{ type: 'text', text: `Open in browser: ${url}` }],
        structuredContent: { url, token },
      };
    }
  );

  server.registerTool(
    toolName('vrctl.auth.status'),
    {
      description:
        'vrc.tl auth status. Returns cached status by default; set verify=true to check live against vrc.tl.',
      inputSchema: z
        .object({
          verify: z
            .boolean()
            .optional()
            .describe('When true, makes a network request to verify session. Default false.'),
        })
        .optional(),
      outputSchema: VrctlAuthStatusSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      const verify = args?.verify ?? false;
      const status = verify ? await vrctlAuthManager.verifyStatus() : vrctlAuthManager.getStatus();
      return {
        content: [{ type: 'text', text: status.loggedIn ? 'logged-in' : 'logged-out' }],
        structuredContent: status,
      };
    }
  );

  server.registerTool(
    toolName('vrctl.auth.logout'),
    {
      description: 'Logout from vrc.tl and clear session cookies.',
      outputSchema: VrctlAuthStatusSchema,
      annotations: writeToolAnnotations,
    },
    async () => {
      await vrctlAuthManager.logout();
      const status = vrctlAuthManager.getStatus();
      return {
        content: [{ type: 'text', text: 'logged-out' }],
        structuredContent: status,
      };
    }
  );
}
