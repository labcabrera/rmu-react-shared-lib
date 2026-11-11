import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Typography } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Item } from '../../api/item.dto';
import { Realm } from '../../api/realm.dto';
import { useListFilters } from '../../data/useListFilters';
import { catalogItem, sampleCatalog } from '../../test/fixtures/items';
import ItemCard from './ItemCard';
import ItemCatalogBrowser from './ItemCatalogBrowser';
import MoneyDisplay from './MoneyDisplay';
import { itemCatalogFilters } from './item-catalog';

// Sample data only: no network.
const realms = [{ id: 'realm-1', name: 'Middle Earth' }] as Realm[];
const catalog: Item[] = [
  ...sampleCatalog,
  ...Array.from({ length: 40 }, (_, index) =>
    catalogItem({
      id: ['rope', 'candle', 'bucket', 'chisel', 'hammer'][index % 5] + `-${index}`,
      category: ['tools', 'light', 'container', 'tools', 'tools'][index % 5],
      imageUrl: `images/items/${['rope', 'candle', 'bucket', 'chisel', 'hammer'][index % 5]}.png`,
    })
  ),
];
const byId = (id: string) => sampleCatalog.find((item) => item.id === id)!;

const Browser = ({ layout, mode, buy }: { layout: 'side' | 'drawer'; mode: 'cards' | 'table'; buy: boolean }) => {
  const { t } = useTranslation();
  const filters = useListFilters(itemCatalogFilters(t, { realms, owner: 'user-1' }));
  const [selected, setSelected] = useState<string>();
  return (
    <ItemCatalogBrowser
      items={catalog}
      filters={filters}
      realms={realms}
      layout={layout}
      mode={mode}
      selectedId={selected}
      onSelect={(item) => setSelected(item.id)}
      actions={buy ? () => <Button size="small">{t('buy')}</Button> : undefined}
      storageKey="stories.items"
    />
  );
};

const meta = {
  title: 'Items/ItemCatalogBrowser',
  component: Browser,
  args: { layout: 'side', mode: 'cards', buy: false },
  argTypes: {
    layout: { control: 'inline-radio', options: ['side', 'drawer'] },
    mode: { control: 'inline-radio', options: ['cards', 'table'] },
  },
} satisfies Meta<typeof Browser>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The items list: side filters from `lg`, armor and weapon filters with their category, sort and paging. */
export const SidePanel: Story = {};

/** The strategic market: filters in a drawer and a buy button on each card. */
export const MarketWithActions: Story = { args: { layout: 'drawer', buy: true } };

export const Table: Story = { args: { mode: 'table' } };

/** Cards of an armor, a shield, a weapon and an item without image or price. */
export const Cards: Story = {
  render: () => (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 1 }}>
      <ItemCard item={byId('plate-full')} onClick={() => undefined} />
      <ItemCard item={byId('normal-shield')} onClick={() => undefined} />
      <ItemCard item={byId('battle-axe')} onClick={() => undefined} selected />
      <ItemCard
        item={byId('backpack')}
        price={
          <Typography component="span" variant="subtitle2">
            <MoneyDisplay gold={1.5} variant="subtitle2" />
          </Typography>
        }
        actions={<Button size="small">Craft</Button>}
      />
    </Box>
  ),
};
