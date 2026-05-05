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

  it('accepts sparse live world unity package data', () => {
    const parsed = schemas.World.partial().parse({
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
      instances: [['wrld_live:123~region(us)', 12, 'extra-metadata']],
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
