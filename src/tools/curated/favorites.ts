import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  FavoriteAddInputSchema,
  FavoriteRemoveInputSchema,
  FavoritesReadInputSchema,
  FavoriteWriteOutputSchema,
  FavoritesReadOutputSchema,
} from '../../models/favorites.js';
import {
  addFavorite,
  getFavoriteGroup,
  getFavoriteLimits,
  listFavoriteGroups,
  listFavorites,
  listFavoritedAvatars,
  removeFavorite,
} from '../../services/favorites/index.js';
import { readOnlyToolAnnotations, destructiveToolAnnotations, writeToolAnnotations } from '../../utils/toolAnnotations.js';
import { toolName } from '../../utils/toolNames.js';
import { textContent, toolError } from '../../utils/toolResponses.js';

export function registerCuratedFavoriteTools(server: McpServer): void {
  server.registerTool(
    toolName('vrchat.favorites'),
    {
      description: 'Read favorites, favorite groups, limits, or favorited avatars with compact outputs (read-only).',
      inputSchema: FavoritesReadInputSchema,
      outputSchema: FavoritesReadOutputSchema,
      annotations: readOnlyToolAnnotations,
    },
    async (args) => {
      try {
        const input = FavoritesReadInputSchema.parse(args ?? {});
        if (input.view === 'groups') {
          const result = await listFavoriteGroups(input);
          const payload = { view: input.view, total: result.groups.length, page: result.page, groups: result.groups };
          return { content: textContent(JSON.stringify(payload, null, 2)), structuredContent: payload };
        }
        if (input.view === 'group') {
          const result = await getFavoriteGroup(input);
          const payload = { view: input.view, group: result.group };
          return { content: textContent(JSON.stringify(payload, null, 2)), structuredContent: payload };
        }
        if (input.view === 'limits') {
          const result = await getFavoriteLimits();
          const payload = { view: input.view, limits: result.limits };
          return { content: textContent(JSON.stringify(payload, null, 2)), structuredContent: payload };
        }
        if (input.view === 'avatars') {
          const result = await listFavoritedAvatars(input);
          const payload = { view: input.view, total: result.avatars.length, page: result.page, avatars: result.avatars };
          return { content: textContent(JSON.stringify(payload, null, 2)), structuredContent: payload };
        }

        const result = await listFavorites(input);
        const payload = { view: input.view, total: result.favorites.length, page: result.page, favorites: result.favorites };
        return { content: textContent(JSON.stringify(payload, null, 2)), structuredContent: payload };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    }
  );

  server.registerTool(
    toolName('vrchat.favorite.add'),
    {
      description: 'Add a user, avatar, or world to a favorite group.',
      inputSchema: FavoriteAddInputSchema,
      outputSchema: FavoriteWriteOutputSchema,
      annotations: writeToolAnnotations,
    },
    async (args) => {
      try {
        const input = FavoriteAddInputSchema.parse(args);
        const result = await addFavorite(input);
        const payload = { status: 'added', favorite: result.favorite };
        return { content: textContent(JSON.stringify(payload, null, 2)), structuredContent: payload };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    }
  );

  server.registerTool(
    toolName('vrchat.favorite.remove'),
    {
      description: 'Remove a favorite by favorite record ID. Use vrchat_favorites to look up favoriteRecordId first.',
      inputSchema: FavoriteRemoveInputSchema,
      outputSchema: FavoriteWriteOutputSchema,
      annotations: destructiveToolAnnotations,
    },
    async (args) => {
      try {
        const input = FavoriteRemoveInputSchema.parse(args);
        const result = await removeFavorite(input);
        const payload = { status: 'removed', result: result.result };
        return { content: textContent(JSON.stringify(payload, null, 2)), structuredContent: payload };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return toolError(message);
      }
    }
  );
}
