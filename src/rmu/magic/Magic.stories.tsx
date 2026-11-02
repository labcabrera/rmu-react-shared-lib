import React, { useState } from 'react';
import { Button, Stack } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ItemGemSetting, MagicItemFeature, MagicItemQuote } from '../../api/magic-item.dto';
import { installFakeFetch, StoryAuth } from '../../test/story-api';
import GemTraits from './GemTraits';
import MagicItemDialog from './MagicItemDialog';
import MagicItemInfo from './MagicItemInfo';

// Invented magic items, gems and prices, not taken from any book.

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
  spells: [{ name: 'Glow', level: 3, list: null, use: 'daily', perDay: 2 }],
  section: '6.5',
};

const gemMagic = { spells: 'Light spells +1', stats: ['intuition'], skills: null, other: null };

const setting: ItemGemSetting = {
  itemTypeId: 'gem-a',
  name: 'Blue stone',
  carats: 2,
  cutFactor: 5,
  value: 40,
  magic: gemMagic,
  setAt: '2026-11-02T10:00:00.000Z',
};

const meta: Meta<typeof MagicItemInfo> = {
  title: 'RMU/Magic/Magic items',
  component: MagicItemInfo,
};

export default meta;
type Story = StoryObj<typeof MagicItemInfo>;

/** The `features.magic` block of a catalog item. */
export const CatalogBlock: Story = { args: { magic } };

/** The enchantment of an owned item, with its charges. */
export const OwnedItem: Story = {
  args: {
    enchantment: {
      source: 'treasure',
      projectId: null,
      kind: 'charged',
      attunement: false,
      itemLevel: 5,
      spells: [{ name: 'Spark', level: 5, listCode: 'list-a' }],
      properties: [{ kind: 'rr', value: 10, target: 'essence' }],
    },
    charges: { current: 7, max: 20 },
  },
};

/** The traits of a catalog gem and of a gem set in an item. */
export const Gems: Story = {
  render: () => (
    <Stack spacing={2} sx={{ maxWidth: 420 }}>
      <GemTraits gem={{ magic: gemMagic }} />
      <GemTraits setting={setting} />
    </Stack>
  ),
};

const quote: MagicItemQuote = {
  days: 9,
  itemLevel: 6,
  price: 42.5,
  breakdown: ['Standard weapon +10: 9 days', 'Base item: 1.5 gp'],
};

const DialogDemo = () => {
  const [open, setOpen] = useState(true);
  return (
    <StoryAuth>
      <Button onClick={() => setOpen(true)}>{'Open'}</Button>
      <MagicItemDialog
        open={open}
        onClose={() => setOpen(false)}
        gameId="g1"
        holder={{ kind: 'faction', id: 'f1' }}
        allowPayment
        onCreated={() => undefined}
      />
    </StoryAuth>
  );
};

/** Create a magic item: the quote is asked to the (fake) server as the form changes. */
export const CreateDialog: Story = {
  render: () => <DialogDemo />,
  beforeEach: () =>
    installFakeFetch([
      {
        match: /\/items\?/,
        body: () => ({
          content: [
            { id: 'sword', name: 'Sword', category: 'weapon', imageUrl: null, info: {} },
            { id: 'ring', name: 'Ring', category: 'jewelry', imageUrl: null, info: {} },
          ],
          pagination: { page: 0, size: 1000, totalElements: 2, totalPages: 1 },
        }),
      },
      { match: /\/items\/magic\/quote$/, body: () => quote },
      { match: /\/items\/magic$/, body: () => ({ id: 'new-item' }) },
    ]),
};
