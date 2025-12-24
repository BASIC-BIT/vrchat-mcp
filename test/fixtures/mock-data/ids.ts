export const ids = {
  users: {
    current: 'usr_11111111-1111-1111-1111-111111111111',
    nakk: 'usr_22222222-2222-2222-2222-222222222222',
    fu: 'usr_33333333-3333-3333-3333-333333333333',
  },
  worlds: {
    mock: 'wrld_aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    second: 'wrld_bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  },
  instances: {
    first: '12345',
  },
  shortNames: {
    first: '12345~region(us)',
  },
  notifications: {
    friend: 'not_11111111-1111-1111-1111-111111111111',
  },
  inviteMessages: {
    invite: 'msg_11111111-1111-1111-1111-111111111111',
  },
  avatars: {
    first: 'avtr_aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    second: 'avtr_bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  },
  favorites: {
    world: 'fav_11111111-1111-1111-1111-111111111111',
  },
  favoriteGroups: {
    world: 'favgrp_11111111-1111-1111-1111-111111111111',
  },
  groups: {
    mock: 'grp_11111111-1111-1111-1111-111111111111',
  },
  roles: {
    member: 'role_11111111-1111-1111-1111-111111111111',
  },
  permissions: {
    post: 'perm_11111111-1111-1111-1111-111111111111',
  },
  announcements: {
    welcome: 'ann_11111111-1111-1111-1111-111111111111',
  },
  posts: {
    hello: 'post_11111111-1111-1111-1111-111111111111',
  },
  groupInstances: {
    first: 'ginst_11111111-1111-1111-1111-111111111111',
  },
  calendar: {
    publicEvent: 'cal_11111111-1111-1111-1111-111111111111',
    featured: 'cal_22222222-2222-2222-2222-222222222222',
    followed: 'cal_33333333-3333-3333-3333-333333333333',
    group: 'cal_44444444-4444-4444-4444-444444444444',
  },
} as const;

export const locations = {
  firstInstance: `${ids.worlds.mock}:${ids.instances.first}`,
} as const;
