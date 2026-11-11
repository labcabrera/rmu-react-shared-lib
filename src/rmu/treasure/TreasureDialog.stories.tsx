import React, { useState } from 'react';
import { Button } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { TreasureRoll } from '../../api/treasure.dto';
import { installFakeFetch, StoryAuth } from '../../test/story-api';
import TreasureDialog from './TreasureDialog';

// Invented lines and dice, not taken from any book.

const roll: TreasureRoll = {
  codes: { wealth: ['normal'], lifestyle: ['poor'], magic: ['rich'] },
  lines: [
    {
      kind: 'gold',
      gold: 12.5,
      dice: [
        { table: '7-1b', roll: 40, modifier: 0, total: 40, result: 'one roll' },
        { table: '7-1c', roll: 63, modifier: 5, total: 68, result: '125 sp' },
      ],
    },
    {
      kind: 'item',
      itemTypeId: 'gem-a',
      name: 'Blue stone',
      amount: 1,
      value: 8,
      carats: 1.5,
      dice: [{ table: '2-4e', roll: 77, modifier: 0, total: 77, result: 'gem-a' }],
    },
    {
      kind: 'item',
      itemTypeId: 'ring',
      name: 'Silver ring',
      amount: 1,
      value: 30,
      jewelryClass: 'fine',
      dice: [{ table: '7-1d', roll: 12, modifier: 0, total: 12, result: 'ring' }],
    },
    {
      kind: 'item',
      itemTypeId: 'sword',
      name: 'Sword',
      amount: 1,
      value: 100,
      magic: { baseItemTypeId: 'sword', kind: 'weapon', itemLevel: 5, bonuses: [{ kind: 'ob', value: 5 }], spells: [] },
      dice: [{ table: '7-1i', roll: 55, modifier: 20, total: 75, result: 'weapon +5' }],
    },
    { kind: 'note', text: 'Gear quality: +5 in total, +5 per item at most', dice: [] },
  ],
  warnings: ['A magic item kept its level after three rerolls'],
};

const Demo = ({ holder }: { holder: boolean }) => {
  const [open, setOpen] = useState(true);
  return (
    <StoryAuth>
      <Button onClick={() => setOpen(true)}>{'Open'}</Button>
      <TreasureDialog
        open={open}
        onClose={() => setOpen(false)}
        codes="c, n, x"
        gameId="g1"
        holder={holder ? { kind: 'faction', id: 'f1' } : null}
      />
    </StoryAuth>
  );
};

const meta: Meta<typeof Demo> = {
  title: 'RMU/Treasure/TreasureDialog',
  component: Demo,
  beforeEach: () =>
    installFakeFetch([
      { match: /\/treasure\/rolls$/, body: () => roll },
      { match: /\/treasure\/awards$/, body: () => ({ items: [], gold: 12.5 }) },
    ]),
};

export default meta;
type Story = StoryObj<typeof Demo>;

/** Roll the codes of the book; the lines can be awarded to the faction. */
export const WithHolder: Story = { args: { holder: true } };

/** Without a holder Award stays disabled (npcs passes a game and faction picker as `holderPicker`). */
export const WithoutHolder: Story = { args: { holder: false } };
