import { describe, expect, it } from 'vitest';
import { OTHER_ACTION_KINDS, otherActionAp, parryPositionalReduction } from './combat-block-a-079.dto';

describe('spec 079, block A contracts', () => {
  it('gives the AP of Table 8-1 to each subtype of other', () => {
    expect(OTHER_ACTION_KINDS.map((kind) => otherActionAp(kind))).toEqual([1, 3, 2, 4, 6, 6, 20, 20]);
    expect(otherActionAp('load-crossbow', true)).toBe(14);
    expect(otherActionAp('pick-up', true)).toBe(3);
  });

  it('takes the positional penalty off the parry, offset by Reverse Strike and never more than the parry', () => {
    expect(parryPositionalReduction(50, { position: 'rear', penalty: -70, reverseStrike: 50 })).toBe(20);
    expect(parryPositionalReduction(10, { position: 'rear', penalty: -70, reverseStrike: 0 })).toBe(10);
    expect(parryPositionalReduction(50, { position: 'flank', penalty: -30, reverseStrike: 40 })).toBe(0);
    expect(parryPositionalReduction(50, null)).toBe(0);
  });
});
