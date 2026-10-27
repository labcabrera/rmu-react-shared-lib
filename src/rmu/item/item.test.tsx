import React from 'react';
import { screen } from '@testing-library/react';
import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { itemCondition, StrategicItemModifier } from '../../api/item-modifier.dto';
import { renderWithProviders } from '../../test/render';
import ItemConditionChip from './ItemConditionChip';
import ItemFeatureChips, { itemFeatureLines } from './ItemFeatureChips';
import ItemModifierChips from './ItemModifierChips';

// Without an i18n instance, t() returns the key: labels below are translation keys.

describe('itemCondition', () => {
  it('sums the breakage modifiers, never above 0, and finds a broken one', () => {
    expect(itemCondition(undefined)).toEqual({ breakagePenalty: 0, broken: false });
    expect(
      itemCondition([
        { id: 'a', type: 'breakage', value: -20, appliesTo: 'all', createdAt: '' },
        { id: 'b', type: 'quality', value: 10, appliesTo: 'breakage', createdAt: '' },
      ])
    ).toEqual({ breakagePenalty: -20, broken: false });
    expect(
      itemCondition([{ id: 'a', type: 'breakage', value: 5, appliesTo: 'all', createdAt: '' }]).breakagePenalty
    ).toBe(0);
    expect(
      itemCondition([{ id: 'a', type: 'breakage', value: 0, appliesTo: 'all', broken: true, createdAt: '' }]).broken
    ).toBe(true);
  });
});

describe('ItemConditionChip', () => {
  it('shows the penalty of a damaged item', () => {
    renderWithProviders(<ItemConditionChip condition={{ breakagePenalty: -20, broken: false }} />);
    expect(screen.getByLabelText(/item-condition-damaged -20/)).toBeInTheDocument();
  });

  it('shows a broken item', () => {
    renderWithProviders(<ItemConditionChip condition={{ breakagePenalty: -20, broken: true }} />);
    expect(screen.getByLabelText(/item-condition-broken/)).toBeInTheDocument();
  });

  it('shows nothing for an intact item unless asked', () => {
    const { container } = renderWithProviders(<ItemConditionChip condition={{ breakagePenalty: 0, broken: false }} />);
    expect(container).toBeEmptyDOMElement();
    renderWithProviders(<ItemConditionChip condition={undefined} showIntact />);
    expect(screen.getByLabelText(/item-condition-intact/)).toBeInTheDocument();
  });
});

describe('ItemModifierChips', () => {
  const modifier = (id: string, extra: Partial<StrategicItemModifier>): StrategicItemModifier => ({
    id,
    type: 'breakage',
    value: -10,
    appliesTo: 'all',
    createdAt: '',
    ...extra,
  });

  it('shows one badge per modifier with its kind and signed value', () => {
    renderWithProviders(
      <ItemModifierChips
        modifiers={[modifier('a', {}), modifier('b', { type: 'quality', value: 5, appliesTo: 'attack' })]}
      />
    );
    expect(screen.getByLabelText('item-modifier-type-breakage -10')).toBeInTheDocument();
    expect(screen.getByLabelText('item-modifier-type-quality +5')).toBeInTheDocument();
  });

  it('folds the modifiers above max into one badge', () => {
    renderWithProviders(
      <ItemModifierChips modifiers={[modifier('a', {}), modifier('b', {}), modifier('c', {})]} max={1} />
    );
    expect(screen.getAllByLabelText('item-modifier-type-breakage -10')).toHaveLength(1);
    expect(screen.getByLabelText('item-modifiers-more')).toBeInTheDocument();
  });

  it('shows nothing without modifiers', () => {
    const { container } = renderWithProviders(<ItemModifierChips modifiers={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('ItemFeatureChips (spec 041)', () => {
  // Invented values; without an i18n instance the labels are the keys
  const t = ((key: string, options?: object) =>
    options ? `${key} ${JSON.stringify(options)}` : key) as unknown as TFunction;

  it('lists the lot, the blocks, the full suit, the class and the improvised OB', () => {
    const lines = itemFeatureLines(
      {
        lotSize: 5,
        features: {
          container: { weight: 10, volume: null, liquid: 2, units: null },
          light: { radius: 8, durationHours: null },
          transport: { capacity: 100, speed: 15 },
          ammunition: { launchers: ['sling'], sizeAdjustment: 1 },
        },
        armor: { coverage: ['body', 'head'], class: 'heavy' },
        weapon: { modes: [{}, { obModifier: -20 }] },
      },
      t
    );
    expect(lines.map((line) => line.key)).toEqual([
      'lot',
      'weight',
      'liquid',
      'radius',
      'capacity',
      'speed',
      'launchers',
      'size',
      'coverage',
      'class',
      'improvised',
    ]);
    expect(lines.find((line) => line.key === 'size')!.label).toContain('"+1"');
    expect(lines.find((line) => line.key === 'improvised')!.label).toContain('"-20"');
  });

  it('shows nothing for an item without general equipment data or with a lot of one', () => {
    const { container } = renderWithProviders(<ItemFeatureChips item={{ lotSize: 1, features: null }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows a badge per line', () => {
    renderWithProviders(<ItemFeatureChips item={{ features: { light: { radius: 8, durationHours: 3 } } }} />);
    expect(screen.getByText('item-feature-light-radius')).toBeInTheDocument();
    expect(screen.getByText('item-feature-light-duration')).toBeInTheDocument();
  });
});
