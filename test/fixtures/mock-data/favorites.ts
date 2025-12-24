import type { z } from 'zod';
import type { schemas } from '../../../src/generated/vrchat-schemas.js';
import { mockSchema } from './builders.js';
import { ids } from './ids.js';

type FavoriteSchema = z.infer<typeof schemas.Favorite>;
type FavoriteGroupSchema = z.infer<typeof schemas.FavoriteGroup>;
type FavoriteLimitsSchema = z.infer<typeof schemas.FavoriteLimits>;

export const favorites: FavoriteSchema[] = [
  mockSchema<FavoriteSchema>('Favorite', {
    id: ids.favorites.world,
    type: 'world',
    favoriteId: ids.worlds.mock,
  }),
];

export const favoriteGroups: FavoriteGroupSchema[] = [
  mockSchema<FavoriteGroupSchema>('FavoriteGroup', {
    id: ids.favoriteGroups.world,
    name: 'World Favorites',
    type: 'world',
  }),
];

export const favoriteLimits: FavoriteLimitsSchema = mockSchema<FavoriteLimitsSchema>(
  'FavoriteLimits',
  {
    defaultMaxFavoriteGroups: 4,
    defaultMaxFavoritesPerGroup: 16,
    maxFavoriteGroups: {
      avatar: 4,
      friend: 4,
      world: 4,
    },
    maxFavoritesPerGroup: {
      avatar: 16,
      friend: 16,
      world: 16,
    },
  },
);
