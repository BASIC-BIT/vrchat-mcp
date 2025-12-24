import type { z } from 'zod';
import type { schemas } from '../../../src/generated/vrchat-schemas.js';
import { mockSchema } from './builders.js';
import { ids, locations } from './ids.js';

type FriendSchema = z.infer<typeof schemas.LimitedUserFriend>;
type FriendStatusSchema = z.infer<typeof schemas.FriendStatus>;

export const friends: FriendSchema[] = [
  mockSchema<FriendSchema>('LimitedUserFriend', {
    id: ids.users.nakk,
    displayName: 'Nakk',
    location: locations.firstInstance,
    status: 'active',
    statusDescription: 'active',
  }),
  mockSchema<FriendSchema>('LimitedUserFriend', {
    id: ids.users.fu,
    displayName: 'Fu',
    location: 'offline',
    status: 'offline',
    statusDescription: 'offline',
  }),
];

export const friendStatuses: Record<string, FriendStatusSchema> = {
  [ids.users.nakk]: mockSchema<FriendStatusSchema>('FriendStatus', {
    status: 'active',
  }),
  [ids.users.fu]: mockSchema<FriendStatusSchema>('FriendStatus', {
    status: 'offline',
  }),
};
