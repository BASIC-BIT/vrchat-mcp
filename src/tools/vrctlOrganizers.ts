import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  VrctlOrganizerProfileInputSchema,
  VrctlOrganizerProfileOutputSchema,
  VrctlOrganizersSearchInputSchema,
  VrctlOrganizersSearchOutputSchema,
} from '../models/vrctlOrganizers.js';
import { vrctlOrganizersService } from '../vrctl/organizers.js';
import { readOnlyToolAnnotations } from '../utils/toolAnnotations.js';
import { toolName } from '../utils/toolNames.js';
import { textContent, toolError } from '../utils/toolResponses.js';

export function registerVrctlOrganizerTools(server: McpServer): void {
  server.registerTool(
    toolName('vrctl.organizers.search'),
    {
      description:
        'Search vrc.tl organizers/clubs by name, slug, shortCode, or VRChat groupId (read-only).',
      inputSchema: VrctlOrganizersSearchInputSchema,
      outputSchema: VrctlOrganizersSearchOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const input = VrctlOrganizersSearchInputSchema.parse(args);
        const result = await vrctlOrganizersService.searchOrganizers(
          input.query,
          input.maxResults ?? 20
        );
        const payload = {
          query: input.query,
          totalMatches: result.total,
          matches: result.matches,
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

  server.registerTool(
    toolName('vrctl.organizer.profile'),
    {
      description:
        'Get one vrc.tl organizer/club profile by VRChat groupId, slug, or shortCode (read-only).',
      inputSchema: VrctlOrganizerProfileInputSchema,
      outputSchema: VrctlOrganizerProfileOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const input = VrctlOrganizerProfileInputSchema.parse(args ?? {});
        if (!input.vrchatGroupId && !input.slug && !input.shortCode) {
          return toolError('Provide vrchatGroupId, slug, or shortCode.');
        }
        const organizer = await vrctlOrganizersService.getOrganizerProfile({
          vrchatGroupId: input.vrchatGroupId,
          slug: input.slug,
          shortCode: input.shortCode,
        });
        const payload = { organizer };
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
