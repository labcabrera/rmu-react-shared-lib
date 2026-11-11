import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ManeuverModifier } from '../../api/maneuver-modifier.dto';
import { renderWithProviders } from '../../test/render';
import ManeuverModifierList, { ManeuverModifierWithOrigin } from './ManeuverModifierList';
import ManeuverProfilePanel from './ManeuverProfilePanel';

// Without an i18n instance, t() returns the key: labels below are translation keys.

const base: Omit<ManeuverModifier, 'id' | 'key' | 'type'> = { scope: {}, accessType: 'public', owner: 'admin' };

describe('ManeuverProfilePanel', () => {
  it('renders nothing without a profile or without values', () => {
    const { container, rerender } = renderWithProviders(<ManeuverProfilePanel />);
    expect(container).toBeEmptyDOMElement();
    rerender(<ManeuverProfilePanel profile={{}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the profile values in a titled panel', () => {
    renderWithProviders(
      <ManeuverProfilePanel
        profile={{
          defaultType: 'percent',
          resultTable: 'mm-table',
          movement: true,
          light: 'helpful',
          actionPoints: { min: 1, max: 3 },
        }}
      />
    );
    expect(screen.getByText('maneuver-profile')).toBeInTheDocument();
    expect(screen.getByText('maneuver-type-percent')).toBeInTheDocument();
    expect(screen.getByText('mm-table')).toBeInTheDocument();
    expect(screen.getByText('yes')).toBeInTheDocument();
    expect(screen.getByText('maneuver-movement-hint')).toBeInTheDocument();
    expect(screen.getByText('light-usage-helpful')).toBeInTheDocument();
    expect(screen.getByText('1 - 3')).toBeInTheDocument();
    expect(screen.queryByText('skill')).not.toBeInTheDocument();
  });

  it('marks each value as the skill own or inherited from the category', () => {
    renderWithProviders(
      <ManeuverProfilePanel
        bare
        profile={{ defaultType: 'absolute', movement: false, light: 'none' }}
        overrides={{ movement: false }}
      />
    );
    expect(screen.queryByText('maneuver-profile')).not.toBeInTheDocument();
    expect(screen.getAllByText('skill')).toHaveLength(1);
    expect(screen.getAllByText('category')).toHaveLength(2);
    expect(screen.queryByText('maneuver-movement-hint')).not.toBeInTheDocument();
  });
});

describe('ManeuverModifierList', () => {
  it('shows the empty text without modifiers', () => {
    const { rerender } = renderWithProviders(<ManeuverModifierList modifiers={[]} />);
    expect(screen.getByText('no-maneuver-modifiers')).toBeInTheDocument();
    rerender(<ManeuverModifierList modifiers={[]} emptyText="none" />);
    expect(screen.getByText('none')).toBeInTheDocument();
  });

  it('formats each value by type and shows the origin', () => {
    const modifiers: ManeuverModifierWithOrigin[] = [
      { ...base, id: '1', key: 'rope', type: 'flag', value: 10, description: 'With a rope', origin: 'skill' },
      {
        ...base,
        id: '2',
        key: 'surface',
        type: 'choice',
        options: [
          { key: 'smooth', value: -20 },
          { key: 'rough', value: 10 },
        ],
        origin: 'category',
      },
      { ...base, id: '3', key: 'distance', type: 'number', perUnit: -5, min: 1, max: 10 },
    ];
    renderWithProviders(<ManeuverModifierList modifiers={modifiers} />);
    expect(screen.getByText('rope')).toBeInTheDocument();
    expect(screen.getByText('With a rope')).toBeInTheDocument();
    expect(screen.getByText('+10')).toBeInTheDocument();
    expect(screen.getByText('surface.smooth -20')).toBeInTheDocument();
    expect(screen.getByText('surface.rough +10')).toBeInTheDocument();
    expect(screen.getByText('maneuver-number-per-unit, maneuver-number-range')).toBeInTheDocument();
    expect(screen.getByText('skill')).toBeInTheDocument();
    expect(screen.getByText('category')).toBeInTheDocument();
  });
});
