import React, { useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../test/render';
import ModifierSelections, {
  ModifierSelectionValues,
  SelectableModifier,
  selectedPriceFactors,
  selectedRollModifiers,
} from './ModifierSelections';

// Invented modifiers, not the rulebook ones
const MODIFIERS: SelectableModifier[] = [
  { key: 'friend', type: 'flag', value: 20 },
  {
    key: 'mood',
    type: 'choice',
    options: [
      { key: 'bad', value: -10 },
      { key: 'good', value: 5 },
    ],
  },
  { key: 'days', type: 'number', perUnit: 2, min: 0, max: 10 },
];

describe('ModifierSelections (spec 048)', () => {
  it('turns the selections into roll modifiers and price factors', () => {
    const values: ModifierSelectionValues = { friend: true, mood: 'bad', days: 3 };
    expect(selectedRollModifiers(MODIFIERS, values)).toEqual([
      { key: 'friend', value: 20 },
      { key: 'mood', value: -10 },
      { key: 'days', value: 6 },
    ]);
    expect(selectedPriceFactors(MODIFIERS, values)).toEqual([
      { key: 'friend' },
      { key: 'mood', option: 'bad' },
      { key: 'days', units: 3 },
    ]);
    expect(selectedRollModifiers(MODIFIERS, { days: 0, mood: 'none' })).toEqual([]);
  });

  it('toggles a flag and chooses an option, clearing it when chosen again', async () => {
    let last: ModifierSelectionValues = {};
    const Harness = () => {
      const [value, setValue] = useState<ModifierSelectionValues>({});
      return (
        <ModifierSelections
          modifiers={MODIFIERS}
          value={value}
          onChange={(next) => {
            last = next;
            setValue(next);
          }}
        />
      );
    };
    renderWithProviders(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'friend +20' }));
    expect(last).toEqual({ friend: true });
    await userEvent.click(screen.getByRole('button', { name: 'mood.good +5' }));
    expect(last).toEqual({ friend: true, mood: 'good' });
    expect(screen.getByRole('button', { name: 'mood.good +5' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'mood.good +5' }));
    expect(last).toEqual({ friend: true });
  });
});
