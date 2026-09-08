import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CallError } from '../../core/client.js';
import {
  GalleryImagesInputSchema,
  GalleryImagesOutputSchema,
  GalleryImageDeleteInputSchema,
  GalleryImageDeleteOutputSchema,
} from '../../models/gallery.js';
import { listGalleryImages, deleteGalleryImage } from '../../services/uploads/gallery.js';
import {
  readOnlyToolAnnotations,
  destructiveToolAnnotations,
} from '../../utils/toolAnnotations.js';
import { toolName } from '../../utils/toolNames.js';
import { textContent, toolError } from '../../utils/toolResponses.js';

export function registerCuratedGalleryTools(server: McpServer): void {
  server.registerTool(
    toolName('vrchat.gallery.image.delete'),
    {
      description:
        'Delete one exact image file owned by the signed-in account and tagged gallery. Existing posts, events, or other references may be affected. Does not check usage; the caller decides what to preserve.',
      inputSchema: GalleryImageDeleteInputSchema,
      outputSchema: GalleryImageDeleteOutputSchema,
      annotations: destructiveToolAnnotations,
    },
    async (args) => {
      try {
        const payload = await deleteGalleryImage(args);
        return {
          content: textContent(JSON.stringify(payload, null, 2)),
          structuredContent: payload,
        };
      } catch (err) {
        return toolError(
          err instanceof Error ? err.message : 'Unknown error',
          err instanceof CallError ? err.payload : undefined
        );
      }
    }
  );
  server.registerTool(
    toolName('vrchat.gallery.images'),
    {
      description:
        'List every image in the signed-in account gallery with compact metadata and total count. Fetches all pages internally; reuse fileId when attaching existing artwork.',
      inputSchema: GalleryImagesInputSchema,
      outputSchema: GalleryImagesOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        GalleryImagesInputSchema.parse(args);
        const payload = await listGalleryImages();
        return {
          content: textContent(JSON.stringify(payload, null, 2)),
          structuredContent: payload,
        };
      } catch (err) {
        return toolError(
          err instanceof Error ? err.message : 'Unknown error',
          err instanceof CallError ? err.payload : undefined
        );
      }
    }
  );
}
