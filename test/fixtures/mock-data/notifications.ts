import type { z } from 'zod';
import type { schemas } from '../../../src/generated/vrchat-schemas.js';
import { mockSchema } from './builders.js';
import { ids } from './ids.js';

type NotificationSchema = z.infer<typeof schemas.Notification>;
type InviteMessageSchema = z.infer<typeof schemas.InviteMessage>;

export const notifications: NotificationSchema[] = [
  mockSchema<NotificationSchema>('Notification', {
    id: ids.notifications.friend,
    type: 'friendRequest',
    message: 'Nakk invited you',
  }),
];

export const inviteMessages: InviteMessageSchema[] = [
  mockSchema<InviteMessageSchema>('InviteMessage', {
    id: ids.inviteMessages.invite,
    userId: ids.users.current,
    messageType: 'message',
    slot: 0,
    message: 'Come hang out!',
  }),
];
