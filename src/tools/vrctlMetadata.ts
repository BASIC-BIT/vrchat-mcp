import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { VrctlMetadataOutputSchema } from '../models/vrctlMetadata.js';
import { vrctlMetadataService } from '../vrctl/metadata.js';
import { readOnlyToolAnnotations } from '../utils/toolAnnotations.js';
import { toolName } from '../utils/toolNames.js';
import { textContent, toolError } from '../utils/toolResponses.js';

export function registerVrctlMetadataTools(server: McpServer): void {
  server.registerTool(
    toolName('vrctl.metadata.get'),
    {
      description: 'Get vrc.tl category + tag metadata (read-only).',
      outputSchema: VrctlMetadataOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async () => {
      try {
        const data = await vrctlMetadataService.getBootstrapCached();
        const payload = {
          loggedIn: data.loggedIn,
          verified: data.loggedIn !== null,
          counts: {
            categories: data.categories.length,
            tags: data.tags.length,
          },
          categories: data.categories,
          tags: data.tags,
        };
        return {
          content: textContent(JSON.stringify(payload, null, 2)),
          structuredContent: payload,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    }
  );
}
