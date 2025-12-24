import type { z } from 'zod';
import type { schemas } from '../../../src/generated/vrchat-schemas.js';
import { mockSchema } from './builders.js';
import { ids } from './ids.js';

type AvatarSchema = z.infer<typeof schemas.Avatar>;

export const avatars: AvatarSchema[] = [
  mockSchema<AvatarSchema>('Avatar', {
    id: ids.avatars.first,
    name: 'Mock Avatar',
  }),
  mockSchema<AvatarSchema>('Avatar', {
    id: ids.avatars.second,
    name: 'Second Avatar',
  }),
];
