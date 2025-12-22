import { describe, it, expect } from 'vitest';
import { toolName, readToolName } from '../../src/utils/toolNames.js';

describe('tool names', () => {
  it('converts dots to underscores', () => {
    expect(toolName('vrchat.auth.begin')).toBe('vrchat_auth_begin');
  });

  it('sanitizes special characters', () => {
    expect(toolName('vrchat.call+test')).toBe('vrchat_call_test');
  });

  it('prefixes read tools', () => {
    expect(readToolName('getConfig')).toBe('vrchat_read_getConfig');
  });
});
