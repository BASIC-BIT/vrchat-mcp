import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getConfig } from '../../../config/index.js';
import {
  VrcxAvatarMemoInputSchema,
  VrcxAvatarMemoOutputSchema,
  VrcxUserMemoInputSchema,
  VrcxUserMemoOutputSchema,
  VrcxWorldMemoInputSchema,
  VrcxWorldMemoOutputSchema,
} from '../../../models/vrcx.js';
import {
  getVrcxAvatarMemo,
  getVrcxUserMemo,
  getVrcxWorldMemo,
} from '../../../services/vrcx/index.js';
import { readOnlyToolAnnotations } from '../../../utils/toolAnnotations.js';
import { toolName } from '../../../utils/toolNames.js';
import { textContent, toolError } from '../../../utils/toolResponses.js';

export function registerVrcxMemoTools(server: McpServer): void {
  server.registerTool(
    toolName('vrcx.memos.user.get'),
    {
      description: 'Get a VRCX user memo by userId (read-only).',
      inputSchema: VrcxUserMemoInputSchema,
      outputSchema: VrcxUserMemoOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const input = VrcxUserMemoInputSchema.parse(args);
        const config = getConfig();
        const result = await getVrcxUserMemo({
          enabled: config.vrcx.enabled,
          databasePath: config.vrcx.databasePath,
          worldDbPath: config.vrcx.worldDbPath,
          userId: input.userId,
        });
        if (!result.ok) return toolError(result.reason, result);
        const payload = {
          userId: result.userId,
          editedAt: result.editedAt,
          memo: result.memo,
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

  server.registerTool(
    toolName('vrcx.memos.world.get'),
    {
      description: 'Get a VRCX world memo by worldId (read-only).',
      inputSchema: VrcxWorldMemoInputSchema,
      outputSchema: VrcxWorldMemoOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const input = VrcxWorldMemoInputSchema.parse(args);
        const config = getConfig();
        const result = await getVrcxWorldMemo({
          enabled: config.vrcx.enabled,
          databasePath: config.vrcx.databasePath,
          worldDbPath: config.vrcx.worldDbPath,
          worldId: input.worldId,
        });
        if (!result.ok) return toolError(result.reason, result);
        const payload = {
          worldId: result.worldId,
          editedAt: result.editedAt,
          memo: result.memo,
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

  server.registerTool(
    toolName('vrcx.memos.avatar.get'),
    {
      description: 'Get a VRCX avatar memo by avatarId (read-only).',
      inputSchema: VrcxAvatarMemoInputSchema,
      outputSchema: VrcxAvatarMemoOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const input = VrcxAvatarMemoInputSchema.parse(args);
        const config = getConfig();
        const result = await getVrcxAvatarMemo({
          enabled: config.vrcx.enabled,
          databasePath: config.vrcx.databasePath,
          worldDbPath: config.vrcx.worldDbPath,
          avatarId: input.avatarId,
        });
        if (!result.ok) return toolError(result.reason, result);
        const payload = {
          avatarId: result.avatarId,
          editedAt: result.editedAt,
          memo: result.memo,
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
