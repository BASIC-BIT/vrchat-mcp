import { describe, it, expect } from 'vitest';
import { ReadOptionsSchema, ReadToolOutputSchema } from '../../src/schemas/read.js';

import { PagingSchema, AvatarCommonQuerySchema, WorldCommonQuerySchema } from '../../src/schemas/read.js';

describe('read schemas', () => {
  it('validates read options', () => {
    const value = ReadOptionsSchema.parse({
      fields: ['id'],
      compact: true,
      page: { enabled: true, size: 2 },
    });
    expect(value.page?.size).toBe(2);
  });

  it('validates read output', () => {
    const parsed = ReadToolOutputSchema.parse({
      data: [],
      page: { pages: 0, items: 0, pageSize: 1, offsetStart: 0, truncated: false },
    });
    expect(parsed.data).toEqual([]);
  });

  it('exports common query schemas', () => {
    expect(PagingSchema).toBeTruthy();
    expect(AvatarCommonQuerySchema).toBeTruthy();
    expect(WorldCommonQuerySchema).toBeTruthy();
  });
});
