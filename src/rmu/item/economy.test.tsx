import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { StrategicItem } from '../../api/strategic-item.dto';
import { renderWithProviders } from '../../test/render';
import ItemInventory, { itemTotalValue, itemTotalWeight } from './ItemInventory';
import MoneyDisplay from './MoneyDisplay';
import PriceBreakdownView from './PriceBreakdownView';
import { formatMoney, toCoins } from './money';

// Without an i18n instance, t() returns the key: labels below are translation keys.

const item = (id: string, props: Partial<StrategicItem> = {}): StrategicItem =>
  ({
    id,
    gameId: 'g',
    factionId: 'f',
    characterId: null,
    itemTypeId: id,
    name: id,
    category: 'weapon',
    carried: false,
    weapon: null,
    armor: null,
    shield: null,
    amount: 1,
    info: { weight: 3, stackable: false },
    value: 10,
    owner: 'u',
    ...props,
  }) as StrategicItem;

describe('money (spec 023)', () => {
  it('splits gold into coins of ten', () => {
    expect(toCoins(12.345)).toEqual([
      { coin: 'gp', amount: 12 },
      { coin: 'sp', amount: 3 },
      { coin: 'bp', amount: 4 },
      { coin: 'cp', amount: 5 },
    ]);
    expect(toCoins(0.05)).toEqual([{ coin: 'bp', amount: 5 }]);
    expect(toCoins(0)).toEqual([{ coin: 'gp', amount: 0 }]);
    expect(formatMoney(-1.2)).toBe('-1 gp -2 sp');
  });

  it('shows the coins with their translated abbreviations', () => {
    renderWithProviders(<MoneyDisplay gold={7.5} signed />);
    expect(screen.getByLabelText('+7 coin-gp 5 coin-sp')).toBeInTheDocument();
  });
});

describe('PriceBreakdownView', () => {
  it('shows the percents of a sale and the gold after it', () => {
    renderWithProviders(
      <PriceBreakdownView
        price={{
          kind: 'sale',
          unitBase: 30,
          amount: 1,
          salePercent: 50,
          conditionPercent: 50,
          condition: 'damaged',
          unitPrice: 7.5,
          total: 7.5,
        }}
        funds={{ label: 'funds', gold: 2 }}
      />
    );
    expect(screen.getByText('price-sale-percent')).toBeInTheDocument();
    expect(screen.getAllByText('50%')).toHaveLength(2);
    expect(screen.getByLabelText('9 coin-gp 5 coin-sp')).toBeInTheDocument();
  });
});

describe('ItemInventory', () => {
  const items = [
    item('sword', { modifiers: [{ id: 'q', type: 'quality', value: 5, appliesTo: 'attack', createdAt: '' }] }),
    item('arrow', {
      category: 'ammunition',
      amount: 20,
      info: { weight: 0.1, stackable: true } as StrategicItem['info'],
      value: 0.1,
    }),
    item('gold-coin', {
      category: 'coins',
      amount: 50,
      info: { weight: 0.02, stackable: true } as StrategicItem['info'],
    }),
  ];

  it('totals the value and weight of every unit', () => {
    expect(itemTotalValue(items[1])).toBe(2);
    expect(itemTotalWeight(items[1])).toBe(2);
  });

  it('groups the items by category, hides the coins and offers the actions of each item', async () => {
    const sell = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <ItemInventory
        items={items}
        hideItemTypeIds={['gold-coin']}
        equippedIds={['sword']}
        actions={(target) => [{ key: 'sell', label: 'sell', onClick: sell, disabled: target.id === 'arrow' }]}
      />
    );
    expect(screen.getByText('weapon')).toBeInTheDocument();
    expect(screen.getByText('ammunition')).toBeInTheDocument();
    expect(screen.queryByText('gold-coin')).not.toBeInTheDocument();
    expect(screen.getByText('equipped')).toBeInTheDocument();
    await user.click(screen.getAllByLabelText('actions')[1]);
    await user.click(screen.getByText('sell'));
    expect(sell).toHaveBeenCalledWith(items[0]);
  });

  it('shows an empty state without items', () => {
    renderWithProviders(<ItemInventory items={[]} emptyTitle="nothing" />);
    expect(screen.getByText('nothing')).toBeInTheDocument();
  });
});
