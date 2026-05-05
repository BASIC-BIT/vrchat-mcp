import type { z } from 'zod';
import type { schemas } from '../../../src/generated/vrchat-schemas.js';
import { mockSchema } from './builders.js';
import { ids } from './ids.js';

type CurrentUserSchema = z.infer<typeof schemas.CurrentUser>;
type UserSchema = z.infer<typeof schemas.User>;

export const currentUser: CurrentUserSchema = mockSchema('CurrentUser', {
  id: ids.users.current,
  displayName: 'TestUser',
  username: 'testuser',
  accountDeletionDate: null,
  date_joined: '2020-01-01',
  status: 'active',
  statusDescription: 'Mock status',
  statusEmoji: ':)',
});

export const users: UserSchema[] = [
  mockSchema<UserSchema>('User', {
    id: ids.users.current,
    displayName: 'TestUser',
    username: 'testuser',
    date_joined: '2020-01-01',
  }),
  mockSchema<UserSchema>('User', {
    id: ids.users.nakk,
    displayName: 'Nakk',
    username: 'nakk',
    date_joined: '2020-01-01',
  }),
  mockSchema<UserSchema>('User', {
    id: ids.users.fu,
    displayName: 'Fu',
    username: 'fu',
    date_joined: '2020-01-01',
  }),
];


