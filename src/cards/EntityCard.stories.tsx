import React from 'react';
import { Chip, Grid } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import EntityCard from './EntityCard';

const description =
  'A long running campaign in the northern marches, where the factions fight over the old mountain passes ' +
  'and the ruins of the dwarven holds. The players start as caravan guards.';

const meta = {
  title: 'Cards/EntityCard',
  component: EntityCard,
  args: {
    title: 'The northern marches',
    subtitle: 'Essence',
    image: 'images/generic/configuration.png',
    chips: <Chip size="small" label="Open" />,
    description,
    onClick: () => undefined,
  },
  decorators: [
    (Story) => (
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Story />
        </Grid>
      </Grid>
    ),
  ],
} satisfies Meta<typeof EntityCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ThreeDescriptionLines: Story = {
  args: { descriptionLines: 3, metrics: [{ label: 'Gold', value: '1,250' }] },
};

export const Compact: Story = {
  args: {
    title: 'Climbing',
    subtitle: 'Athletic',
    noImage: true,
    chips: (
      <>
        <Chip size="small" label="AG" />
        <Chip size="small" label="ST" />
      </>
    ),
    description: 'Scaling cliffs, walls and trees.',
  },
};

export const CompactLocked: Story = {
  args: { noImage: true, locked: true, lockedLabel: 'Private' },
};
