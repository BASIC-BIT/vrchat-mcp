import type { z } from 'zod';
import type { schemas } from '../../../src/generated/vrchat-schemas.js';
import { mockSchema } from './builders.js';
import { ids, locations } from './ids.js';

type WorldSchema = z.infer<typeof schemas.World>;
type InstanceSchema = z.infer<typeof schemas.Instance>;
type FavoritedWorldSchema = z.infer<typeof schemas.FavoritedWorld>;

export const worlds: WorldSchema[] = [
  mockSchema<WorldSchema>('World', {
    id: ids.worlds.mock,
    name: 'Mock World',
  }),
  mockSchema<WorldSchema>('World', {
    id: ids.worlds.second,
    name: 'Second World',
  }),
];

export const favoritedWorlds: FavoritedWorldSchema[] = [
  mockSchema<FavoritedWorldSchema>('FavoritedWorld', {
    id: ids.worlds.mock,
    name: 'Mock World',
    authorId: ids.users.current,
    authorName: 'TestUser',
    favoriteId: ids.favorites.world,
    favoriteGroup: ids.favoriteGroups.world,
  }),
];

export const instances: Record<string, InstanceSchema> = {
  [locations.firstInstance]: mockSchema<InstanceSchema>('Instance', {
    id: locations.firstInstance,
    location: locations.firstInstance,
    instanceId: ids.instances.first,
    shortName: ids.shortNames.first,
    worldId: ids.worlds.mock,
    world: {
      id: ids.worlds.mock,
      name: 'Mock World',
    },
  }),
};

export const instancesByShortName: Record<string, string> = {
  [ids.shortNames.first]: locations.firstInstance,
};

export const recentLocations: string[] = [locations.firstInstance, 'offline'];
