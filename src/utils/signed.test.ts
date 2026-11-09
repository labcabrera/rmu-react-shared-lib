import { describe, expect, it } from 'vitest';
import { signed } from './signed';

describe('signed', () => {
  it.each([
    [5, '+5'],
    [0, '0'],
    [-5, '-5'],
  ])('formats %d as %s', (value, text) => {
    expect(signed(value)).toBe(text);
  });
});
