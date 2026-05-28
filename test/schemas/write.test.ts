import { describe, expect, it } from 'vitest';
import {
  GeneratedWriteToolInputSchema,
  GeneratedWriteToolOutputSchema,
  WriteToolOutputSchema,
} from '../../src/schemas/write.js';

describe('write schemas', () => {
  it('validates write output', () => {
    const parsed = WriteToolOutputSchema.parse({
      data: { ok: true },
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
    expect(parsed.data).toEqual({ ok: true });
  });

  it('validates generated write input', () => {
    const parsed = GeneratedWriteToolInputSchema.parse({
      operationId: 'createGroupRole',
      params: { groupId: 'grp_1' },
      body: { name: 'Role' },
    });
    expect(parsed.operationId).toBe('createGroupRole');
    expect(parsed.params?.groupId).toBe('grp_1');
    expect(GeneratedWriteToolInputSchema.safeParse({}).success).toBe(false);
  });

  it('validates generated write output with optional metadata passthrough', () => {
    const parsed = GeneratedWriteToolOutputSchema.parse({
      dryRun: true,
      url: 'https://api.vrchat.cloud/api/1/config',
    });
    expect(parsed.dryRun).toBe(true);
    expect(parsed.url).toBe('https://api.vrchat.cloud/api/1/config');
  });
});
