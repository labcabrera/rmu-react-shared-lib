import React from 'react';
import { Stack } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { StrategicItem } from '../../api/strategic-item.dto';
import ItemInventory from './ItemInventory';
import MoneyDisplay from './MoneyDisplay';
import PriceBreakdownView from './PriceBreakdownView';

const meta: Meta<typeof ItemInventory> = {
  title: 'RMU/Item/Economy',
  component: ItemInventory,
};

export default meta;
type Story = StoryObj<typeof ItemInventory>;

const base = { gameId: 'g', factionId: 'f', characterId: null, weapon: null, armor: null, shield: null, owner: 'u' };

const items = [
  {
    ...base,
    id: 'sword',
    itemTypeId: 'longsword',
    name: 'Realm blade',
    category: 'weapon',
    carried: true,
    amount: 1,
    info: { weight: 3, stackable: false },
    value: 30,
    modifiers: [
      {
        id: 'q1',
        type: 'quality',
        value: 5,
        appliesTo: 'attack',
        source: { kind: 'crafting' },
        description: 'Fine edge',
        createdAt: '',
      },
      { id: 'b1', type: 'breakage', value: -10, appliesTo: 'all', source: { kind: 'repair' }, createdAt: '' },
    ],
    condition: { breakagePenalty: -10, broken: false },
  },
  {
    ...base,
    id: 'arrows',
    itemTypeId: 'arrow',
    name: 'Arrows',
    category: 'ammunition',
    carried: false,
    amount: 40,
    info: { weight: 0.1, stackable: true },
    value: 0.1,
  },
  {
    ...base,
    id: 'shield',
    itemTypeId: 'normal-shield',
    name: 'Shield',
    category: 'shield',
    carried: false,
    amount: 1,
    info: { weight: 8, stackable: false },
    value: 12,
    condition: { breakagePenalty: 0, broken: true },
  },
] as unknown as StrategicItem[];

export const Armory: Story = {
  args: {
    items,
    equippedIds: ['sword'],
    groupings: ['category', 'carried'],
    actions: () => [
      { key: 'give', label: 'Give', onClick: () => undefined },
      { key: 'sell', label: 'Sell', onClick: () => undefined },
      { key: 'discard', label: 'Discard', onClick: () => undefined, danger: true },
    ],
  },
};

export const Empty: Story = { args: { items: [] } };

export const Money: StoryObj = {
  render: () => (
    <Stack spacing={1}>
      <MoneyDisplay gold={12.345} showIcon />
      <MoneyDisplay gold={-2.5} signed />
      <MoneyDisplay gold={0.07} />
    </Stack>
  ),
};

export const SaleBreakdown: StoryObj = {
  render: () => (
    <PriceBreakdownView
      price={{
        kind: 'sale',
        unitBase: 30,
        amount: 1,
        salePercent: 50,
        conditionPercent: 50,
        condition: 'damaged',
        trading: { total: 120, maneuverPercent: 120, pricePercent: 120 },
        unitPrice: 9,
        total: 9,
      }}
      funds={{ label: 'Coins of the character', gold: 4 }}
    />
  ),
};
