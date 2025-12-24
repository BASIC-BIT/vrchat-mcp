import type { z } from 'zod';
import type { schemas } from '../../../src/generated/vrchat-schemas.js';
import { mockSchema } from './builders.js';
import { ids } from './ids.js';

type GroupSchema = z.infer<typeof schemas.Group>;
type GroupMemberSchema = z.infer<typeof schemas.GroupMember>;
type GroupRoleSchema = z.infer<typeof schemas.GroupRole>;
type GroupPermissionSchema = z.infer<typeof schemas.GroupPermission>;
type GroupAnnouncementSchema = z.infer<typeof schemas.GroupAnnouncement>;
type GroupPostSchema = z.infer<typeof schemas.GroupPost>;
type GroupInstanceSchema = z.infer<typeof schemas.GroupInstance>;

export const groups: GroupSchema[] = [
  mockSchema<GroupSchema>('Group', {
    id: ids.groups.mock,
    name: 'Mock Group',
  }),
];

export const groupMembers: Record<string, GroupMemberSchema[]> = {
  [ids.groups.mock]: [
    mockSchema<GroupMemberSchema>('GroupMember', {
      userId: ids.users.nakk,
      displayName: 'Nakk',
      roleId: ids.roles.member,
      groupId: ids.groups.mock,
    }),
  ],
};

export const groupRoles: Record<string, GroupRoleSchema[]> = {
  [ids.groups.mock]: [
    mockSchema<GroupRoleSchema>('GroupRole', {
      id: ids.roles.member,
      name: 'Member',
      groupId: ids.groups.mock,
    }),
  ],
};

export const groupPermissions: Record<string, GroupPermissionSchema[]> = {
  [ids.groups.mock]: [
    mockSchema<GroupPermissionSchema>('GroupPermission', {
      id: ids.permissions.post,
      name: 'Post',
    }),
  ],
};

export const groupAnnouncements: Record<string, GroupAnnouncementSchema[]> = {
  [ids.groups.mock]: [
    mockSchema<GroupAnnouncementSchema>('GroupAnnouncement', {
      id: ids.announcements.welcome,
      title: 'Welcome',
      groupId: ids.groups.mock,
    }),
  ],
};

export const groupPosts: Record<string, GroupPostSchema[]> = {
  [ids.groups.mock]: [
    mockSchema<GroupPostSchema>('GroupPost', {
      id: ids.posts.hello,
      title: 'Hello',
      groupId: ids.groups.mock,
    }),
  ],
};

export const groupInstances: Record<string, GroupInstanceSchema[]> = {
  [ids.groups.mock]: [
    mockSchema<GroupInstanceSchema>('GroupInstance', {
      id: ids.groupInstances.first,
      worldId: ids.worlds.mock,
      instanceId: ids.instances.first,
      groupId: ids.groups.mock,
      location: `${ids.worlds.mock}:${ids.instances.first}`,
    }),
  ],
};
