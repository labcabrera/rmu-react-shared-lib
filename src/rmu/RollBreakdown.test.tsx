import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test/render';
import RollBreakdown from './RollBreakdown';

const modifiers = [
  { key: 'bd', value: -24, group: 'defense' as const },
  { key: 'bo', value: 94, group: 'offense' as const },
  { key: 'action-points', value: -25, group: 'offense' as const },
];

describe('RollBreakdown', () => {
  it('groups the modifiers, attacker first, with signed values', () => {
    renderWithProviders(<RollBreakdown modifiers={modifiers} />);

    const groups = screen.getAllByText(/^modifier-group-/).map((element) => element.textContent);
    expect(groups).toEqual(['modifier-group-offense', 'modifier-group-defense']);
    expect(screen.getByText('+94')).toBeInTheDocument();
    // The defense group has one modifier: its row and its subtotal.
    expect(screen.getAllByText('-24')).toHaveLength(2);
  });

  it('adds the roll to the total', () => {
    renderWithProviders(<RollBreakdown modifiers={modifiers} roll={80} />);

    expect(screen.getByText('+80')).toBeInTheDocument();
    expect(screen.getByText('125')).toBeInTheDocument();
  });

  it('shows modifiers without group in a single list without subtotals', () => {
    renderWithProviders(<RollBreakdown modifiers={[{ key: 'bo', value: 60 }]} />);

    expect(screen.getByText('modifier-group-other')).toBeInTheDocument();
    expect(screen.getAllByText('+60')).toHaveLength(1);
  });
});
