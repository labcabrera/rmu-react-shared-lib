import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CREATURE_SIZES } from '../../api/npc.dto';
import { renderWithProviders } from '../../test/render';
import AttackSizeChip from './AttackSizeChip';
import {
  ATTACK_SIZE_SCALE,
  attackSizeEffect,
  clampSizeSteps,
  expectedCriticalShift,
  formatMultiplier,
} from './attack-size';

// Without an i18n instance, t() returns the key: labels below are translation keys.

describe('attack size scale', () => {
  it('has the thirteen creature sizes with Medium at 0 steps', () => {
    expect(ATTACK_SIZE_SCALE.map((step) => step.sizeId)).toEqual([...CREATURE_SIZES]);
    expect(ATTACK_SIZE_SCALE.map((step) => step.hitMultiplier)).toEqual([
      0.25, 0.5, 0.67, 0.75, 1, 1.5, 2, 3, 4, 5, 6, 7, 8,
    ]);
    expect(ATTACK_SIZE_SCALE.find((step) => step.sizeId === 'medium')).toMatchObject({ sizeClass: 5, steps: 0 });
  });

  it('gives the multiplier and critical shift of a size', () => {
    expect(attackSizeEffect(1)).toEqual({ sizeId: 'big', steps: 1, hitMultiplier: 1.5, criticalShift: 1 });
    expect(attackSizeEffect(-1)).toEqual({ sizeId: 'small', steps: -1, hitMultiplier: 0.75, criticalShift: -1 });
    expect(attackSizeEffect(0).hitMultiplier).toBe(1);
  });

  it('clamps sizes outside the scale and treats missing ones as Medium', () => {
    expect(attackSizeEffect(20)).toMatchObject({ sizeId: 'leviathan', steps: 8, hitMultiplier: 8 });
    expect(attackSizeEffect(-9)).toMatchObject({ sizeId: 'minuscule', steps: -4, hitMultiplier: 0.25 });
    expect(clampSizeSteps(undefined)).toBe(0);
    expect(clampSizeSteps(null)).toBe(0);
    expect(clampSizeSteps(Number.NaN)).toBe(0);
  });

  it('shifts the critical by the attack size minus the target size', () => {
    expect(expectedCriticalShift(1, 0)).toBe(1);
    expect(expectedCriticalShift(1, 2)).toBe(-1);
    expect(expectedCriticalShift(0, null)).toBe(0);
  });

  it('formats multipliers in the language', () => {
    expect(formatMultiplier(1.5, 'es')).toBe('1,5');
    expect(formatMultiplier(0.67, 'en')).toBe('0.67');
  });
});

describe('AttackSizeChip', () => {
  it('renders nothing for a Medium attack unless forced', () => {
    const { container, rerender } = renderWithProviders(<AttackSizeChip steps={0} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<AttackSizeChip steps={0} showMedium />);
    expect(screen.getByText('size-medium (0)')).toBeInTheDocument();
  });

  it('shows the size and explains its effect on damage and critical', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AttackSizeChip steps={1} targetSteps={2} />);
    await user.click(screen.getByText('size-big (+1)'));
    expect(screen.getByText('attack-size-effect')).toBeInTheDocument();
    expect(screen.getByText('attack-size-damage')).toBeInTheDocument();
    expect(screen.getByText('attack-size-critical')).toBeInTheDocument();
    expect(screen.getByText('attack-size-vs-target')).toBeInTheDocument();
  });
});
