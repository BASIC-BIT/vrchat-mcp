import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getConfig } from '../../config/index.js';
import { shapeReadData } from '../../core/readTools.js';
import { AvatarProfileInputSchema, AvatarProfileOutputSchema } from '../../models/avatars.js';
import { getAvatarProfile } from '../../services/avatars/index.js';
import { getVrcxAvatarMemo } from '../../services/vrcx/index.js';
import { readOnlyToolAnnotations } from '../../utils/toolAnnotations.js';
import { toolName } from '../../utils/toolNames.js';
import { textContent, toolError } from '../../utils/toolResponses.js';

export function registerCuratedAvatarTools(server: McpServer): void {
  server.registerTool(
    toolName('vrchat.avatar.profile'),
    {
      description: 'Get an avatar profile by avatarId (read-only).',
      inputSchema: AvatarProfileInputSchema,
      outputSchema: AvatarProfileOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const input = AvatarProfileInputSchema.parse(args);
        const result = await getAvatarProfile(input.avatarId);
        const shaped = shapeReadData(result.avatar, {
          fields: input.fields,
          compact: input.compact,
          maxArrayLength: input.maxArrayLength,
        });

        let vrcxMemo: { editedAt: string | null; memo: string | null } | undefined;
        try {
          const config = getConfig();
          const memoResult = await getVrcxAvatarMemo({
            enabled: config.vrcx.enabled,
            databasePath: config.vrcx.databasePath,
            worldDbPath: config.vrcx.worldDbPath,
            avatarId: input.avatarId,
          });
          if (memoResult.ok && (memoResult.memo || memoResult.editedAt)) {
            vrcxMemo = { editedAt: memoResult.editedAt, memo: memoResult.memo };
          }
        } catch {
          // ignore VRCX errors; avatar profile should still work
        }

        const payload = {
          avatarId: input.avatarId,
          stale: result.stale,
          avatar: shaped,
          vrcxMemo,
        };

        return {
          content: textContent(JSON.stringify(payload, null, 2)),
          structuredContent: payload as Record<string, unknown>,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    }
  );
}
