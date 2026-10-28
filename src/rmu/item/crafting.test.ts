import { describe, expect, it } from 'vitest';
import { craftKind, isBluntWeapon, Material, materialsFor } from '../../api/crafting.dto';

// Invented materials (spec 043): only the uses matter here
const material = (id: string, uses: Material['uses']): Material => ({
  id,
  group: 'metal',
  durability: 0,
  workability: 0,
  bonus: 0,
  bluntBonus: null,
  metalBonus: null,
  cost: { add: 0, multiplier: null },
  costPerPound: null,
  density: null,
  magical: false,
  alloy: false,
  alloyDifficulty: null,
  armorWeightMultiplier: null,
  uses,
});

const weapon = (skillId: string, attackTable = 'broadsword') => ({
  category: 'weapon',
  weapon: { skillId, modes: [{ attackTable }] } as never,
  armor: null,
  shield: null,
});

describe('crafting kinds (spec 043)', () => {
  it('derives the kind of a catalog item as the API does', () => {
    expect(craftKind(weapon('melee-weapon@blade'))).toBe('weapon');
    expect(craftKind(weapon('ranged-weapon@bow'))).toBe('launcher');
    expect(craftKind({ category: 'ammunition', weapon: null, armor: null, shield: null })).toBe('ammunition');
    expect(craftKind({ category: 'armor', weapon: null, armor: { slot: 'body' }, shield: null })).toBe('torso-armor');
    expect(craftKind({ category: 'armor', weapon: null, armor: { slot: 'head' }, shield: null })).toBe('armor');
    expect(craftKind({ category: 'shield', weapon: null, armor: null, shield: { db: 1 } })).toBe('shield');
    expect(craftKind({ category: 'tools', weapon: null, armor: null, shield: null })).toBe('other');
  });

  it('finds the blunt weapons by their attack table', () => {
    expect(isBluntWeapon(weapon('melee-weapon@hafted', 'mace'))).toBe(true);
    expect(isBluntWeapon(weapon('melee-weapon@blade'))).toBe(false);
  });

  it('lists the materials a kind can be made of', () => {
    const list = [material('steel', ['weapon', 'armor']), material('yew', ['launcher'])];
    expect(materialsFor('torso-armor', list).map((m) => m.id)).toEqual(['steel']);
    expect(materialsFor('launcher', list).map((m) => m.id)).toEqual(['yew']);
    expect(materialsFor('other', list)).toEqual([]);
  });
});
