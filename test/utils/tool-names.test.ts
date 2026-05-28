import { describe, it, expect } from 'vitest';
import { toolName } from '../../src/utils/toolNames.js';

describe('tool names', () => {
  it('converts dots to underscores', () => {
    expect(toolName('vrchat.auth.begin')).toBe('vrchat_auth_begin');
  });

  it('sanitizes special characters', () => {
    expect(toolName('vrchat.call+test')).toBe('vrchat_call_test');
  });

  it('formats generated router tool names', () => {
    expect(toolName('vrchat.read')).toBe('vrchat_read');
    expect(toolName('vrchat.write')).toBe('vrchat_write');
  });
});
