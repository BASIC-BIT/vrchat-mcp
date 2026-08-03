import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getConfig } from '../../config/index.js';
import { shapeReadData } from '../../core/readTools.js';
import {
  AvatarProfileInputSchema,
  AvatarProfileOutputSchema,
  AvatarUpdateInputSchema,
  AvatarUpdateOutputSchema,
} from '../../models/avatars.js';
import {
  AvatarLookupError,
  getAvatarProfile,
  updateAvatarMetadata,
} from '../../services/avatars/index.js';
import { getVrcxAvatarMemo } from '../../services/vrcx/index.js';
import { destructiveToolAnnotations, readOnlyToolAnnotations } from '../../utils/toolAnnotations.js';
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

  server.registerTool(
    toolName('vrchat.avatar.update'),
    {
      description: [
        'Edit your own avatar metadata: name, description, releaseStatus, and content tags.',
        'Asset fields (assetUrl, unityPackageUrl, unityVersion, version) are unreachable — a bad',
        'value there repoints the avatar at the wrong build with no undo.',
        'Content tags: content_sex, content_adult, content_violence, content_gore, content_horror.',
        'Tags merge rather than replace, so author tags survive; clearContentTags strips every',
        'content_* tag, including ones this build does not know.',
        'CAUTION — releaseStatus is risky in BOTH directions; confirm intent before changing it.',
        'Going public can expose a creator’s work against their terms, leak a private avatar, or',
        'breach VRChat’s content policy depending on what the avatar contains. Going private',
        'breaks the avatar for everyone currently wearing it. Use dryRun to preview.',
      ].join(' '),
      inputSchema: AvatarUpdateInputSchema,
      outputSchema: AvatarUpdateOutputSchema,
      annotations: destructiveToolAnnotations,
    },
    async (args) => {
      try {
        const input = AvatarUpdateInputSchema.parse(args);
        const payload = await updateAvatarMetadata(input);
        return {
          content: textContent(JSON.stringify(payload, null, 2)),
          structuredContent: payload as unknown as Record<string, unknown>,
        };
      } catch (err) {
        if (err instanceof AvatarLookupError) {
          // Structured so a client can follow the recovery path without parsing prose.
          return toolError(err.message, {
            status: err.status,
            message: err.message,
            nextSteps: err.nextSteps,
          });
        }
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    }
  );
}
