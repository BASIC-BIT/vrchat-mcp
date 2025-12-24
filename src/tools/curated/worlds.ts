import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { shapeReadData } from '../../core/readTools.js';
import {
  WorldFavoritesInputSchema,
  WorldFavoritesOutputSchema,
  WorldInstancesInputSchema,
  WorldInstancesOverviewOutputSchema,
  WorldProfileInputSchema,
  WorldProfileOutputSchema,
  WorldSearchInputSchema,
  WorldSearchOutputSchema,
} from '../../models/worlds.js';
import {
  getWorldInstancesOverview,
  getWorldProfile,
  listFavoriteWorlds,
  resolveWorldId,
  searchWorlds,
} from '../../services/worlds/index.js';
import { readOnlyToolAnnotations } from '../../utils/toolAnnotations.js';
import { toolName } from '../../utils/toolNames.js';
import { textContent, toolError } from '../../utils/toolResponses.js';

export function registerCuratedWorldTools(server: McpServer): void {
  server.registerTool(
    toolName('vrchat.worlds.search'),
    {
      description: 'Search worlds by name and return compact results (read-only).',
      inputSchema: WorldSearchInputSchema,
      outputSchema: WorldSearchOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const query = String(args?.query ?? '').trim();
        if (!query) return toolError('query is required');

        const { worlds, page, stale } = await searchWorlds({
          ...(args ?? {}),
          query,
        });

        const payload = {
          query,
          total: worlds.length,
          stale,
          page,
          worlds,
          notes: ['Tags are included verbatim and may be noisy.'],
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

  server.registerTool(
    toolName('vrchat.worlds.favorites'),
    {
      description: 'List favorited worlds with compact results (read-only).',
      inputSchema: WorldFavoritesInputSchema,
      outputSchema: WorldFavoritesOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const { worlds, page, stale } = await listFavoriteWorlds({
          ...(args ?? {}),
        });

        const payload = {
          total: worlds.length,
          stale,
          page,
          worlds,
          notes: ['Tags are included verbatim and may be noisy.'],
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

  server.registerTool(
    toolName('vrchat.world.profile'),
    {
      description: 'Get a world profile by worldId or name (read-only).',
      inputSchema: WorldProfileInputSchema,
      outputSchema: WorldProfileOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const resolved = await resolveWorldId({
          worldId: args?.worldId,
          name: args?.name,
        });
        if (!resolved.ok) {
          return toolError(resolved.reason, {
            status: resolved.status,
            message: resolved.reason,
            nextSteps: resolved.nextSteps,
          });
        }

        const result = await getWorldProfile(resolved.worldId);
        const shaped = shapeReadData(result.world, {
          fields: args?.fields,
          compact: args?.compact,
          maxArrayLength: args?.maxArrayLength,
        });

        const payload = {
          worldId: resolved.worldId,
          resolvedBy: resolved.resolvedBy,
          stale: result.stale,
          world: shaped,
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

  server.registerTool(
    toolName('vrchat.world.instances_overview'),
    {
      description: 'Summarize world instances by access type and region (read-only).',
      inputSchema: WorldInstancesInputSchema,
      outputSchema: WorldInstancesOverviewOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const resolved = await resolveWorldId({
          worldId: args?.worldId,
          name: args?.name,
        });
        if (!resolved.ok) {
          return toolError(resolved.reason, {
            status: resolved.status,
            message: resolved.reason,
            nextSteps: resolved.nextSteps,
          });
        }

        const result = await getWorldInstancesOverview(resolved.worldId);
        const payload = {
          worldId: resolved.worldId,
          resolvedBy: resolved.resolvedBy,
          stale: result.stale,
          instances: result.summary,
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
