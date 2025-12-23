import { describe, it, expect } from 'vitest';
import { stableStringify } from '../../src/utils/stableStringify.js';

describe('stableStringify', () => {
  it('normalizes values and sorts object keys', () => {
    const sym = Symbol('x');
    function named() {
      return null;
    }
    const result = stableStringify({
      z: 2,
      a: { b: 1, a: 0 },
      big: 10n,
      sym,
      fn: named,
      undef: undefined,
      arr: [1, sym],
    });

    const parsed = JSON.parse(result) as Record<string, unknown>;
    expect(Object.keys(parsed)).toEqual(['a', 'arr', 'big', 'fn', 'sym', 'undef', 'z']);
    expect(parsed).toEqual({
      a: { a: 0, b: 1 },
      arr: [1, 'Symbol(x)'],
      big: '10',
      fn: '[function named]',
      sym: 'Symbol(x)',
      undef: '',
      z: 2,
    });
  });

  it('normalizes unnamed functions and undefined', () => {
    const result = stableStringify({
      fn: () => 123,
      value: undefined,
    });
    const parsed = JSON.parse(result) as Record<string, unknown>;
    expect(parsed).toEqual({ fn: '[function fn]', value: '' });
  });
});
