import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CharacterTrait } from './character.dto';
import {
  breathHoldingRounds,
  effectivePace,
  elementalModifier,
  elementalSeveritySteps,
  elementOf,
  elementOfCritical,
  pacePenaltyFor,
  restPeriodHours,
  situationalTraitsForSkill,
} from './talents-079.dto';
import SituationalTalentBonuses from '../rmu/character/SituationalTalentBonuses';
import { renderWithProviders } from '../test/render';

const trait = (traitId: string, tier = 1, specialization?: string) =>
  ({ traitId, traitName: traitId, tier, specialization }) as unknown as CharacterTrait;

describe('spec 079, block D talent contracts', () => {
  it('reads Uncoordinated as the tactical API', () => {
    expect(effectivePace('jog', 1)).toBe('run');
    expect(effectivePace('run', 9)).toBe('dash');
    expect(pacePenaltyFor('walk')).toBe(-25);
    expect(pacePenaltyFor('jog', 1)).toBe(-75);
    expect(pacePenaltyFor('run', 1)).toBe(-100);
    expect(pacePenaltyFor('run', 2)).toBe(-125);
    expect(pacePenaltyFor('swim')).toBe(0);
  });

  it('scales the rest period with the sleeper talents', () => {
    expect(restPeriodHours([])).toBe(2);
    expect(restPeriodHours([trait('efficient-sleeper', 1)])).toBe(1.5);
    expect(restPeriodHours([trait('efficient-sleeper', 2)])).toBe(1);
    expect(restPeriodHours([trait('restless-sleeper', 2)])).toBe(3);
  });

  it('lists the situational talents of a skill', () => {
    const traits = [trait('golden-throat', 2), trait('heavy-sleeper'), trait('wings-vestigial'), trait('extra-joints')];
    expect(situationalTraitsForSkill({ skillId: 'influence' }, traits)).toEqual([
      { traitId: 'golden-throat', tier: 2, value: 20, condition: 'calm-or-persuade' },
    ]);
    expect(situationalTraitsForSkill({ skillId: 'music', specialization: 'drums' }, traits)).toEqual([]);
    expect(situationalTraitsForSkill({ skillId: 'music', specialization: 'singing' }, traits)).toHaveLength(1);
    expect(situationalTraitsForSkill({ skillId: 'perception' }, traits)).toEqual([
      { traitId: 'heavy-sleeper', tier: 1, value: -25, condition: 'wake-up' },
    ]);
  });

  it('reads the elemental talents', () => {
    expect(elementOf('Heat/Fire')).toBe('heat');
    expect(elementOf('lightning')).toBe('electricity');
    expect(elementOf('poison')).toBeNull();
    expect(elementOfCritical('steam')).toBe('heat');
    expect(elementOfCritical('S')).toBeNull();
    const traits = [trait('elemental-resistance', 3, 'cold'), trait('elemental-susceptibility', 2, 'fire')];
    expect(elementalModifier(traits, 'cold')).toBe(15);
    expect(elementalModifier(traits, 'heat')).toBe(-10);
    expect(elementalSeveritySteps(traits, 'cold')).toBe(-1);
    expect(elementalSeveritySteps(traits, 'heat')).toBe(1);
    expect(elementalModifier(traits, null)).toBe(0);
  });

  it('computes Breath Holding', () => {
    expect(breathHoldingRounds({ level: 4 })).toBe(48);
    expect(breathHoldingRounds({ level: 4, inactive: true })).toBe(96);
    expect(breathHoldingRounds({ level: 4, inactive: true, meditation: true })).toBe(144);
    expect(breathHoldingRounds({ level: 0 })).toBe(12);
  });
});

describe('SituationalTalentBonuses', () => {
  it('renders the chips of the skill and nothing without them', () => {
    const { container } = renderWithProviders(
      <SituationalTalentBonuses skill={{ skillId: 'climbing' }} traits={[trait('empathy')]} />,
    );
    expect(container).toBeEmptyDOMElement();
    renderWithProviders(<SituationalTalentBonuses skill={{ skillId: 'social-awareness' }} traits={[trait('empathy')]} />);
    expect(screen.getByTestId('situational-talent-bonuses')).toBeInTheDocument();
    expect(screen.getByText('empathy +50')).toBeInTheDocument();
  });
});
