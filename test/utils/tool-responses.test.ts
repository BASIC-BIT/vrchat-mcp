import { describe, it, expect } from 'vitest';
import { textContent, toolError } from '../../src/utils/toolResponses.js';

describe('toolResponses', () => {
  it('builds basic text content', () => {
    expect(textContent('hello')).toEqual([{ type: 'text', text: 'hello' }]);
  });

  it('builds default error payload', () => {
    const result = toolError('boom');
    expect(result.isError).toBe(true);
    expect(result).not.toHaveProperty('structuredContent');
    expect(result.content).toEqual([{ type: 'text', text: 'boom' }]);
  });

  it('stringifies structured error payload', () => {
    const payload = { error: 'bad', hint: 'try-again' };
    const result = toolError('bad', payload);
    expect(result.isError).toBe(true);
    expect(result).not.toHaveProperty('structuredContent');
    expect(result.content[0]?.text).toContain('try-again');
  });
});
