import { describe, it, expect } from 'vitest';
import {
  mapGroupAnnouncement,
  mapGroupInstance,
  mapGroupMember,
  mapGroupPost,
  mapGroupSummary,
} from '../../src/models/groups.js';

describe('group model mappers', () => {
  it('maps group summary fields with rounded member count', () => {
    const summary = mapGroupSummary({
      id: 'grp_1',
      name: 'Group One',
      shortCode: 'ABC',
      memberCount: 42.9,
    });

    expect(summary).toEqual({
      groupId: 'grp_1',
      name: 'Group One',
      shortCode: 'ABC',
      memberCount: 42,
    });
  });

  it('maps group announcement when content exists', () => {
    const announcement = mapGroupAnnouncement({
      title: 'Update',
      text: 'Hello',
    });

    expect(announcement).toEqual({
      id: undefined,
      title: 'Update',
      text: 'Hello',
      createdAt: undefined,
      updatedAt: undefined,
      authorId: undefined,
    });
  });

  it('maps group post and instance', () => {
    const post = mapGroupPost({
      id: 'post_1',
      title: 'Hello',
      visibility: 'public',
    });
    expect(post).toMatchObject({ id: 'post_1', title: 'Hello', visibility: 'public' });

    const instance = mapGroupInstance({
      instanceId: 'i1',
      location: 'wrld_1:1',
      memberCount: 3.2,
      world: { id: 'wrld_1', name: 'Test World' },
    });
    expect(instance).toMatchObject({
      instanceId: 'i1',
      location: 'wrld_1:1',
      memberCount: 3,
      worldId: 'wrld_1',
      worldName: 'Test World',
    });
  });

  it('maps group member with fallback user id', () => {
    const member = mapGroupMember({
      user: { id: 'usr_2', displayName: 'User Two' },
    });
    expect(member).toEqual({ userId: 'usr_2', displayName: 'User Two' });
  });
});
