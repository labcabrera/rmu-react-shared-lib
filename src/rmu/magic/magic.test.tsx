import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ItemEnchantment } from '../../api/enchantment.dto';
import type { ItemGemSetting, MagicItemFeature } from '../../api/magic-item.dto';
import { renderWithProviders } from '../../test/render';
import ItemEnchantmentInfo from '../alchemy/ItemEnchantmentInfo';
import GemTraits from './GemTraits';
import MagicItemInfo from './MagicItemInfo';
import { magicBonusText, magicItemSummary, magicSpellUseText } from './magic-format';

// Without an i18n instance, t() returns the key (or the defaultValue): labels below are translation keys.
// Synthetic data only.

const t = (key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key;

const magic: MagicItemFeature = {
  itemLevel: 10,
  kind: 'weapon',
  days: 12,
  standardPrice: 150,
  basePrice: 5,
  attunement: true,
  charges: null,
  realm: 'essence',
  bonuses: [
    { kind: 'ob', value: 10 },
    { kind: 'db', value: 5, against: 'undead' },
  ],
  spells: [{ name: 'Spell One', level: 3, list: null, use: 'daily', perDay: 2 }],
  section: '6.5',
};

describe('magic format', () => {
  it('writes a bonus with its target and creature type', () => {
    expect(magicBonusText({ kind: 'ob', value: 10 }, t)).toBe('magic-bonus-ob +10');
    expect(magicBonusText({ kind: 'skill', value: 15, target: 'skill-x', against: 'undead' }, t)).toBe(
      'magic-bonus-skill +15 · skill-x · magic-bonus-against'
    );
  });

  it('writes the use of a spell', () => {
    expect(magicSpellUseText('daily', 3, t)).toBe('magic-spell-per-day');
    expect(magicSpellUseText('charges', null, t)).toBe('magic-spell-use-charges');
  });

  it('summarises a magic item', () => {
    expect(magicItemSummary({ kind: 'weapon', itemLevel: 10, bonuses: [{ kind: 'ob', value: 5 }] }, t)).toBe(
      'magic-kind-weapon · magic-item-level-value · magic-bonus-ob +5'
    );
  });
});

describe('MagicItemInfo', () => {
  it('shows a catalog block: level, kind, attunement, days, price, bonuses and spells', () => {
    renderWithProviders(<MagicItemInfo magic={magic} />);
    expect(screen.getByText('item-magic')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('magic-kind-weapon')).toBeInTheDocument();
    expect(screen.getByText('yes')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('magic-bonus-ob +10')).toBeInTheDocument();
    expect(screen.getByText('magic-bonus-db +5 · magic-bonus-against')).toBeInTheDocument();
    expect(screen.getByText('magic-spell-line')).toBeInTheDocument();
    expect(screen.getByText('magic-spell-per-day')).toBeInTheDocument();
  });

  it('shows the enchantment of an item with its charges and source', () => {
    const enchantment: ItemEnchantment = {
      source: 'treasure',
      projectId: null,
      kind: 'charged',
      attunement: false,
      itemLevel: 5,
      spells: [{ name: 'Spell Two', level: 5, listCode: 'list-a' }],
      properties: [{ kind: 'rr', value: 10, target: 'channeling' }],
    };
    renderWithProviders(<MagicItemInfo enchantment={enchantment} charges={{ current: 0, max: 20 }} bare />);
    expect(screen.queryByText('item-magic')).not.toBeInTheDocument();
    expect(screen.getByText('magic-kind-charged')).toBeInTheDocument();
    expect(screen.getByText('magic-charges-value')).toBeInTheDocument();
    expect(screen.getByText('magic-source-treasure')).toBeInTheDocument();
    expect(screen.getByText('magic-bonus-rr +10 · channeling')).toBeInTheDocument();
    expect(screen.getByText('enchantment-spell-line')).toBeInTheDocument();
  });

  it('renders nothing without a block or an enchantment', () => {
    const { container } = renderWithProviders(<MagicItemInfo />);
    expect(container).toBeEmptyDOMElement();
  });

  it('is what ItemEnchantmentInfo shows for an enchantment that is not of alchemy', () => {
    renderWithProviders(
      <ItemEnchantmentInfo
        item={{
          enchantment: { source: 'catalog', projectId: null, itemLevel: 3, spells: [], properties: [] },
          charges: null,
        }}
      />
    );
    expect(screen.getByText('item-enchantment')).toBeInTheDocument();
    expect(screen.getByText('magic-source-catalog')).toBeInTheDocument();
  });
});

describe('GemTraits', () => {
  it('shows the magic traits of a catalog gem', () => {
    renderWithProviders(
      <GemTraits gem={{ magic: { spells: 'Spell text', stats: ['strength'], skills: null, other: 'Other text' } }} />
    );
    expect(screen.getByText('gem-traits')).toBeInTheDocument();
    expect(screen.getByText('Spell text')).toBeInTheDocument();
    expect(screen.getByText('strength')).toBeInTheDocument();
    expect(screen.getByText('Other text')).toBeInTheDocument();
    expect(screen.queryByText('gem-magic-skills')).not.toBeInTheDocument();
  });

  it('shows a set gem with its carats, cut and value', () => {
    const setting: ItemGemSetting = {
      itemTypeId: 'gem-a',
      name: 'Gem A',
      carats: 2,
      cutFactor: 5,
      value: 40,
      magic: null,
      setAt: '2026-11-02T10:00:00.000Z',
    };
    renderWithProviders(<GemTraits setting={setting} />);
    expect(screen.getByText('Gem A')).toBeInTheDocument();
    expect(screen.getByText('gem-carats-value')).toBeInTheDocument();
    expect(screen.getByText('gem-cut-factor-value')).toBeInTheDocument();
  });

  it('renders nothing for a gem without traits', () => {
    const { container } = renderWithProviders(<GemTraits gem={{ magic: null }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
