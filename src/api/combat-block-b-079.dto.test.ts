import { describe, expect, it } from 'vitest';
import {
  adrenalRounds,
  complementaryQueryValue,
  complementaryRanks,
  featOfStrengthQuery,
  SKILL_RELATION_PENALTIES,
} from './combat-block-b-079.dto';

describe('spec 079, block B contracts', () => {
  it('gives each helper half the ranks of the one before', () => {
    expect([0, 1, 2, 3].map((index) => complementaryRanks(6, index))).toEqual([6, 3, 1, 0]);
    expect(complementaryRanks(-2, 0)).toBe(0);
  });

  it('writes a helper as the query reads it', () => {
    expect(complementaryQueryValue({ actorId: 'sam', skillId: 'traps' })).toBe('sam:traps:');
    expect(complementaryQueryValue({ skillId: 'lore', specialization: 'invented' })).toBe(':lore:invented');
  });

  it('counts the rounds of a success by every full 20 over 101', () => {
    expect([90, 101, 120, 121, 160, 161].map(adrenalRounds)).toEqual([1, 1, 1, 2, 3, 4]);
  });

  it('builds the query of a feat of strength, leaving out the empty values', () => {
    expect(featOfStrengthQuery({ loadWeight: 150, mechanicalFactor: 0.5 })).toEqual({
      loadWeight: '150',
      mechanicalFactor: '0.5',
    });
    expect(featOfStrengthQuery({})).toEqual({});
  });

  it('orders the relations from the closest', () => {
    expect(Object.values(SKILL_RELATION_PENALTIES)).toEqual([-25, -50, -75]);
  });
});
