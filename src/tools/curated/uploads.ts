import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getConfig } from '../../config/index.js';
import { assertWritesAllowed, CallError } from '../../core/client.js';
import {
  GroupImageUploadInputSchema,
  GroupImageUploadOutputSchema,
} from '../../models/uploads.js';
import { checkGroupAllowed, resolveGroupId } from '../../services/groups/index.js';
import { uploadGroupImage } from '../../services/uploads/index.js';
import { writeToolAnnotations } from '../../utils/toolAnnotations.js';
import { toolName } from '../../utils/toolNames.js';
import { textContent, toolError } from '../../utils/toolResponses.js';

export function registerCuratedUploadTools(server: McpServer): void {
  server.registerTool(
    toolName('vrchat.group.image.upload'),
    {
      description:
        'Upload a static PNG to the signed-in VRChat account gallery for later use by an allowlisted group. This does not attach the image to a group post or event.',
      inputSchema: GroupImageUploadInputSchema,
      outputSchema: GroupImageUploadOutputSchema,
      annotations: writeToolAnnotations,
    },
    async (args) => {
      try {
        assertWritesAllowed('POST');
        const input = GroupImageUploadInputSchema.parse(args);
        const resolved = await resolveGroupId({
          groupId: input.groupId,
          shortCode: input.shortCode,
        });
        if (!resolved.ok) {
          return toolError(resolved.reason, {
            status: resolved.status,
            message: resolved.reason,
            nextSteps: resolved.nextSteps,
          });
        }

        const allowed = checkGroupAllowed(resolved.groupId);
        if (!allowed.ok) return toolError(allowed.reason);

        const result = await uploadGroupImage(input, getConfig().uploads.allowedRoots);
        const payload = {
          status: 'uploaded' as const,
          groupId: resolved.groupId,
          fileId: result.file.id,
          image: {
            fileName: result.image.fileName,
            byteSize: result.image.byteSize,
            width: result.image.width,
            height: result.image.height,
          },
          file: result.file,
        };
        return {
          content: textContent(JSON.stringify(payload, null, 2)),
          structuredContent: payload as Record<string, unknown>,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message, err instanceof CallError ? err.payload : undefined);
      }
    }
  );
}
