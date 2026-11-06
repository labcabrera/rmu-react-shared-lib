import { describe, expect, it } from 'vitest';
import {
  disarmDefenseModifier,
  disarmResult,
  OTHER_ACTION_KINDS,
  otherActionAp,
  parryPositionalReduction,
  strayShotAlertData,
} from './combat-block-a-079.dto';

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

  it('reads the bands of Table 9-7a and the defender roll against 100', () => {
    expect([0, 75, 76, 100, 101, 175, 176].map(disarmResult)).toEqual([
      'absolute-failure',
      'failure',
      'partial',
      'partial',
      'success',
      'success',
      'absolute-success',
    ]);
    expect(disarmDefenseModifier(30)).toBe(70);
    expect(disarmDefenseModifier(120)).toBe(-20);
  });

  it('reads the data of a stray-shot alert', () => {
    expect(
      strayShotAlertData([
        { key: 'actionId', modifier: 'a-1' },
        { key: 'attackName', modifier: 'bow' },
        { key: 'targetActorId', modifier: 'ally' },
        { key: 'candidate', modifier: 'ally' },
        { key: 'candidate', modifier: 'foe' },
      ])
    ).toEqual({ actionId: 'a-1', attackName: 'bow', targetActorId: 'ally', candidates: ['ally', 'foe'] });
    expect(strayShotAlertData(null)).toEqual({ actionId: null, attackName: null, targetActorId: null, candidates: [] });
  });
});
