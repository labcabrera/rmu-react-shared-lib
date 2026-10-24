import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { itemCondition, StrategicItemModifier } from '../../api/item-modifier.dto';
import { renderWithProviders } from '../../test/render';
import ItemConditionChip from './ItemConditionChip';
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
