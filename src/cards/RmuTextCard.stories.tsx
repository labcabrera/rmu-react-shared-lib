import React from 'react';
import { Grid } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { gridSizeCard } from '../layouts/grid';
import RmuTextCard from './RmuTextCard';

const meta = {
  title: 'Cards/RmuTextCard',
  component: RmuTextCard,
  args: { value: 'Arming sword', subtitle: 'Weapon', image: 'images/items/arming-sword.png', onClick: fn() },
} satisfies Meta<typeof RmuTextCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const PositiveValue: Story = { args: { value: 8, subtitle: 'Strength', applyColor: true } };

export const NegativeValue: Story = { args: { value: -8, subtitle: 'Empathy', applyColor: true } };

export const ExplicitColors: Story = {
  render: (args) => (
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, md: 6 }}>
        <RmuTextCard {...args} value="Red" color="red" applyColor />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <RmuTextCard {...args} value="Green" color="green" applyColor />
      </Grid>
    </Grid>
  ),
};

export const LongText: Story = {
  args: { value: 'Brigandine torso armor with an unusually long name', subtitle: 'Armor' },
};

export const Locked: Story = { args: { lock: true } };

export const WithoutImage: Story = { args: { image: null } };

// The card grid used by every list page.
export const ListGrid: Story = {
  render: (args) => (
    <Grid container spacing={1}>
      {['Arming sword', 'Broadsword', 'Battle axe', 'Arrow', 'Boots', 'Bucket', 'Cage', 'Candle'].map((name) => (
        <Grid key={name} size={gridSizeCard}>
          <RmuTextCard {...args} value={name} />
        </Grid>
      ))}
    </Grid>
  ),
};
