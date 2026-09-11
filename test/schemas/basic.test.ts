import { describe, it, expect } from 'vitest';
import { CallInputSchema } from '../../src/schemas/call.js';
import { AuthStatusSchema } from '../../src/schemas/auth.js';
import { schemas } from '../../src/generated/vrchat-schemas.js';

describe('basic schemas', () => {
  it('validates call input', () => {
    const parsed = CallInputSchema.parse({ operationId: 'getConfig' });
    expect(parsed.operationId).toBe('getConfig');
  });

  it('validates auth status', () => {
    const parsed = AuthStatusSchema.parse({ loggedIn: false });
    expect(parsed.loggedIn).toBe(false);
  });

  it('accepts the limited packages returned by world search', () => {
    const parsed = schemas.LimitedWorld.partial().parse({
      id: 'wrld_live',
      name: 'Live World',
      unityPackages: [
        {
          created_at: null,
          platform: 'standalonewindows',
          unityVersion: '2022.3.22f1',
        },
      ],
    });

    expect(parsed.unityPackages?.[0]?.platform).toBe('standalonewindows');
  });

  it('accepts live world instance rows with extra metadata', () => {
    const parsed = schemas.World.partial().parse({
      id: 'wrld_live',
      name: 'Live World',
      instances: [['wrld_live:123~region(us)', 12, { ja: 12 }]],
    });

    expect(parsed.instances?.[0]?.[1]).toBe(12);
  });

  it('accepts live group posts without editor or image IDs', () => {
    const parsed = schemas.GroupPost.partial().parse({
      id: 'ntf_post',
      groupId: 'grp_live',
      authorId: 'usr_live',
      editorId: null,
      imageId: null,
      title: 'Post',
      text: 'Body',
      visibility: 'group',
    });

    expect(parsed.editorId).toBeNull();
  });
});

// These contracts come from the published 2026-09-08 specification, not the
// postprocessor. Catch stale generation and accidental widening on refresh.
describe('current upstream schema contracts', () => {
  it('validates calendar occurrence kinds instead of passing unknown values through', () => {
    const event = {
      description: '',
      endsAt: '2026-09-08T12:00:00Z',
      id: 'cal_fixture',
      startsAt: '2026-09-08T11:00:00Z',
      title: 'Fixture',
    };
    for (const occurrenceKind of ['single', 'series', 'occurrence']) {
      expect(schemas.CalendarEvent.parse({ ...event, occurrenceKind }).occurrenceKind).toBe(
        occurrenceKind
      );
    }
    expect(
      schemas.CalendarEvent.safeParse({ ...event, occurrenceKind: 'unexpected' }).success
    ).toBe(false);
  });

  it('accepts the current permissions when validating role updates', () => {
    expect(
      schemas.UpdateGroupRoleRequest.parse({
        permissions: [
          '*',
          'group-instance-plus-portal-unlocked',
          'group-instance-announcement-create',
          'group-instance-bypass-avatar-performance',
        ],
      }).permissions
    ).toHaveLength(4);
  });

  it('validates world instance triples without accepting truncated or oversized rows', () => {
    expect(
      schemas.World.partial().parse({ instances: [['123~region(us)', 12, { eng: 12 }]] }).instances
    ).toHaveLength(1);
    for (const row of [
      ['123', 12],
      ['123', 12, {}, 'unexpected'],
    ]) {
      expect(schemas.World.partial().safeParse({ instances: [row] }).success).toBe(false);
    }
  });
});

describe('generated dictionary compatibility', () => {
  it('parses config dictionary values generated from multiline Zod records', () => {
    const value = { standalonewindows: { timeout: 10 } };
    expect(
      schemas.APIConfig.partial().parse({ lowMemoryGoHomeTimeout: value }).lowMemoryGoHomeTimeout
    ).toEqual(value);
  });
});

describe('generated response preservation', () => {
  it('keeps populated notification union payloads instead of matching the empty branch', () => {
    const details = { worldId: 'wrld_1:123', worldName: 'Fixture', inviteMessage: 'Join' };
    expect(schemas.SentNotification.partial().parse({ details }).details).toEqual(details);
    const data = { boopingUserDisplayName: 'Fixture' };
    expect(schemas.NotificationV2.partial().parse({ data }).data).toEqual(data);
    expect(schemas.NotificationEmpty.parse({})).toEqual({});
    expect(schemas.NotificationEmpty.safeParse(details).success).toBe(false);
  });

  it('accepts nullable instance category IDs declared in the spec', () => {
    expect(schemas.Instance.partial().parse({ categoryId: null }).categoryId).toBeNull();
  });

  it('requires full-package identity and version on world detail responses', () => {
    expect(
      schemas.World.partial().safeParse({
        unityPackages: [{ platform: 'android', unityVersion: '2017.4.15f1', created_at: null }],
      }).success
    ).toBe(false);
  });
});

describe('live avatar response compatibility', () => {
  it('accepts an explicit null acknowledgements field on avatar detail reads', () => {
    expect(schemas.Avatar.partial().parse({ acknowledgements: null }).acknowledgements).toBeNull();
  });
});
