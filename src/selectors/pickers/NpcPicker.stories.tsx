import React, { useState } from 'react';
import { Box } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Npc } from '../../api/npc.dto';
import { NpcPicker } from './NpcPicker';

// Invented NPCs, not taken from any book.
const npc = (id: string, name: string, extra: Partial<Npc> = {}) =>
  ({ id, name, category: 'animal', level: 3, group: null, source: null, imageUrl: null, ...extra }) as Npc;

const npcs = [
  npc('n1', 'Grey wolf', { group: 'dogs' }),
  npc('n2', 'Brown bear', { group: 'bears', level: 5 }),
  npc('n3', 'Stone guard', { category: 'artificial', level: 8 }),
  npc('n4', 'Hill bandit', { category: 'race', level: 2 }),
  npc('n5', 'Marsh eagle', { group: 'birds-of-prey' }),
];

const meta = {
  title: 'Selectors/NpcPicker',
  component: NpcPicker,
  args: { npcs, value: null, onChange: () => undefined },
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 480 }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof NpcPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

const Controlled = () => {
  const [value, setValue] = useState<string | null>('n1');
  return <NpcPicker npcs={npcs} value={value} onChange={setValue} />;
};

/** The NPCs given as a prop; with `realmId` instead it loads the campaign's and the generic realms' NPCs. */
export const Default: Story = { render: () => <Controlled /> };

export const Loading: Story = { args: { npcs: undefined, realmId: undefined } };
