import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { SpellAlchemy } from '../../api/enchantment.dto';
import type { ItemEnchantment } from '../../api/enchantment.dto';
import { renderWithProviders } from '../../test/render';
import ItemEnchantmentInfo from './ItemEnchantmentInfo';
import SpellAlchemyInfo from './SpellAlchemyInfo';
import { alchemyEffectValue } from './alchemy-format';

// Without an i18n instance, t() returns the key: labels below are translation keys. Synthetic data only.

describe('alchemyEffectValue', () => {
  it('signs the bonuses and multiplies the power points', () => {
    expect(alchemyEffectValue({ kind: 'attack', value: 5 })).toBe('+5');
    expect(alchemyEffectValue({ kind: 'skill', value: -5 })).toBe('-5');
    expect(alchemyEffectValue({ kind: 'pp-multiplier', value: 2 })).toBe('×2');
  });
});

describe('SpellAlchemyInfo', () => {
  const alchemy: SpellAlchemy = {
    failureTable: 'bonus',
    perItem: true,
    alters: false,
    effect: { kind: 'defense', value: 10 },
  };

  it('shows the failure table, the batch and alter flags and the effect', () => {
    renderWithProviders(<SpellAlchemyInfo spell={{ alchemy }} />);
    expect(screen.getByText('spell-alchemy')).toBeInTheDocument();
    expect(screen.getByText('alchemy-failure-table-bonus')).toBeInTheDocument();
    expect(screen.getByText('yes')).toBeInTheDocument();
    expect(screen.getByText('no')).toBeInTheDocument();
    expect(screen.getByText('alchemy-effect-defense +10')).toBeInTheDocument();
  });

  it('says when the spell has no effect, and renders bare without the panel title', () => {
    renderWithProviders(<SpellAlchemyInfo spell={{ alchemy: { ...alchemy, effect: null } }} bare />);
    expect(screen.getByText('alchemy-effect-none')).toBeInTheDocument();
    expect(screen.queryByText('spell-alchemy')).not.toBeInTheDocument();
  });

  it('renders nothing for a spell without alchemy data', () => {
    const { container } = renderWithProviders(<SpellAlchemyInfo spell={{ alchemy: null }} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('ItemEnchantmentInfo', () => {
  const enchantment: ItemEnchantment = {
    projectId: 'p1',
    itemLevel: 7,
    alchemistId: 'c1',
    alchemistName: 'Alchemist A',
    spells: [
      { spellId: 's1', name: 'Spell One', level: 7, listCode: 'list-a' },
      { spellId: 's2', name: 'Spell Two', level: 3, listCode: 'list-b' },
    ],
    properties: [
      { kind: 'spell-adder', value: 2 },
      { kind: 'skill', value: 15, target: 'skill-x' },
    ],
    completedAt: '2026-11-01T10:00:00.000Z',
  };

  it('shows the level, the alchemist, the spells and the properties', () => {
    renderWithProviders(<ItemEnchantmentInfo item={{ enchantment }} />);
    expect(screen.getByText('item-enchantment')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('Alchemist A')).toBeInTheDocument();
    expect(screen.getAllByText('enchantment-spell-line')).toHaveLength(2);
    expect(screen.getByText('alchemy-effect-spell-adder +2')).toBeInTheDocument();
    expect(screen.getByText('alchemy-effect-skill +15 · skill-x')).toBeInTheDocument();
  });

  it('leaves out the properties row when there are none', () => {
    renderWithProviders(<ItemEnchantmentInfo item={{ enchantment: { ...enchantment, properties: [] } }} />);
    expect(screen.queryByText('enchantment-properties')).not.toBeInTheDocument();
  });

  it('renders nothing for an item that is not enchanted', () => {
    const { container } = renderWithProviders(<ItemEnchantmentInfo item={{ enchantment: null }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
