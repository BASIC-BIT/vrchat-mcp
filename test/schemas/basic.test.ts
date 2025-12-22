import { describe, it, expect } from 'vitest';
import { CallInputSchema } from '../../src/schemas/call.js';
import { AuthStatusSchema } from '../../src/schemas/auth.js';

describe('basic schemas', () => {
  it('validates call input', () => {
    const parsed = CallInputSchema.parse({ operationId: 'getConfig' });
    expect(parsed.operationId).toBe('getConfig');
  });

  it('validates auth status', () => {
    const parsed = AuthStatusSchema.parse({ loggedIn: false });
    expect(parsed.loggedIn).toBe(false);
  });
});
