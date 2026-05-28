import { describe, it, expect } from 'vitest';
import {
  GeneratedReadToolInputSchema,
  GeneratedReadToolOutputSchema,
  ReadOptionsSchema,
  ReadToolOutputSchema,
} from '../../src/schemas/read.js';

import {
  PagingSchema,
  AvatarCommonQuerySchema,
  WorldCommonQuerySchema,
} from '../../src/schemas/read.js';

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

  it('validates generated read input', () => {
    const parsed = GeneratedReadToolInputSchema.parse({
      operationId: 'searchUsers',
      params: { search: 'hello' },
      page: { enabled: true, size: 10 },
    });
    expect(parsed.operationId).toBe('searchUsers');
    expect(parsed.params?.search).toBe('hello');
    expect(GeneratedReadToolInputSchema.safeParse({}).success).toBe(false);
  });

  it('validates generated read output with optional metadata passthrough', () => {
    const parsed = GeneratedReadToolOutputSchema.parse({
      data: [],
      page: { pages: 1, items: 2 },
    });
    expect(parsed.data).toEqual([]);
    expect(parsed.page).toEqual({ pages: 1, items: 2 });
  });

  it('exports common query schemas', () => {
    expect(PagingSchema).toBeTruthy();
    expect(AvatarCommonQuerySchema).toBeTruthy();
    expect(WorldCommonQuerySchema).toBeTruthy();
  });
});
