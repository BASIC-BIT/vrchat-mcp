import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getConfig } from '../../../config/index.js';
import {
  VrcxStatusInputSchema,
  VrcxStatusOutputSchema,
} from '../../../models/vrcx.js';
import { getVrcxStatus } from '../../../services/vrcx/index.js';
import { readOnlyToolAnnotations } from '../../../utils/toolAnnotations.js';
import { toolName } from '../../../utils/toolNames.js';
import { textContent, toolError } from '../../../utils/toolResponses.js';

export function registerVrcxStatusTool(server: McpServer): void {
  server.registerTool(
    toolName('vrcx.db.status'),
    {
      description:
        'Detect VRCX on this machine and report database path, active user, and DB version (read-only).',
      inputSchema: VrcxStatusInputSchema,
      outputSchema: VrcxStatusOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async () => {
      try {
        const config = getConfig();
        const result = await getVrcxStatus({
          enabled: config.vrcx.enabled,
          databasePath: config.vrcx.databasePath,
          worldDbPath: config.vrcx.worldDbPath,
        });

        const payload = {
          enabled: result.enabled,
          available: result.available,
          db: result.paths.db,
          worldDb: result.paths.worldDb,
          vrcxJson: result.paths.vrcxJson,
          activeUserId: result.activeUserId,
          userPrefix: result.userPrefix,
          databaseVersion: result.databaseVersion,
          warnings: result.warnings.length > 0 ? result.warnings : undefined,
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
