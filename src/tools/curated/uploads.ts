import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getConfig } from '../../config/index.js';
import { assertWritesAllowed, CallError } from '../../core/client.js';
import {
  GalleryImageUploadInputSchema,
  GalleryImageUploadOutputSchema,
} from '../../models/uploads.js';
import { uploadGalleryImage } from '../../services/uploads/index.js';
import { writeToolAnnotations } from '../../utils/toolAnnotations.js';
import { toolName } from '../../utils/toolNames.js';
import { textContent, toolError } from '../../utils/toolResponses.js';

export function registerCuratedUploadTools(server: McpServer): void {
  server.registerTool(
    toolName('vrchat.gallery.image.upload'),
    {
      description:
        'Upload a validated static PNG to the signed-in VRChat account gallery. This does not attach the image to a group post or event.',
      inputSchema: GalleryImageUploadInputSchema,
      outputSchema: GalleryImageUploadOutputSchema,
      annotations: writeToolAnnotations,
    },
    async (args) => {
      try {
        assertWritesAllowed('POST');
        const input = GalleryImageUploadInputSchema.parse(args);
        const result = await uploadGalleryImage(input, getConfig().uploads.allowedRoots);
        const payload = {
          fileId: result.file.id,
          ownerId: result.file.ownerId,
          name: result.file.name,
          mimeType: result.file.mimeType,
          extension: result.file.extension,
          version: result.file.version,
          image: {
            fileName: result.image.fileName,
            byteSize: result.image.byteSize,
            width: result.image.width,
            height: result.image.height,
          },
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
