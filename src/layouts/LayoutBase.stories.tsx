import React from 'react';
import { Grid, Typography } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import EntityImage from '../avatars/EntityImage';
import AddButton from '../buttons/AddButton';
import DeleteButton from '../buttons/DeleteButton';
import EditButton from '../buttons/EditButton';
import RefreshButton from '../buttons/RefreshButton';
import RmuTextCard from '../cards/RmuTextCard';
import StatRow from '../display/StatRow';
import LayoutBase from './LayoutBase';
import Section from './Section';
import { gridSizeCard } from './grid';

const meta = {
  title: 'Layout/LayoutBase',
  component: LayoutBase,
  parameters: { layout: 'fullscreen' },
  args: {
    breadcrumbs: [{ name: 'Home', link: '/' }, { name: 'Items', link: '/items' }, { name: 'View' }],
    children: null,
  },
} satisfies Meta<typeof LayoutBase>;

export default meta;
type Story = StoryObj<typeof meta>;

// List page: header actions plus a card grid.
export const ListPage: Story = {
  args: {
    breadcrumbs: [{ name: 'Home', link: '/' }, { name: 'Items' }],
    actions: [<RefreshButton key="refresh" onClick={fn()} />, <AddButton key="add" onClick={fn()} />],
    children: (
      <Grid container spacing={1}>
        {['Arming sword', 'Broadsword', 'Battle axe', 'Arrow', 'Boots', 'Bucket'].map((name) => (
          <Grid key={name} size={gridSizeCard}>
            <RmuTextCard value={name} subtitle="Weapon" image="images/items/arming-sword.png" />
          </Grid>
        ))}
      </Grid>
    ),
  },
};

// Detail page: left panel with the avatar plus sections.
export const DetailPage: Story = {
  args: {
    actions: [
      <RefreshButton key="refresh" onClick={fn()} />,
      <EditButton key="edit" onClick={fn()} />,
      <DeleteButton key="delete" onClick={fn()} />,
    ],
    leftPanel: (
      <>
        <EntityImage image="images/items/arming-sword.png" onImageChange={fn()} />
        <Typography variant="h6">Arming sword</Typography>
        <Typography>Weapon</Typography>
      </>
    ),
    children: (
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Section title="Weapon">
            <StatRow label="Skill" value="Melee Weapon" />
            <StatRow label="Fumble" value={3} />
          </Section>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Section title="Information">
            <StatRow label="Weight" value="2.5 lbs" />
            <StatRow label="Strength" value={70} success />
            <StatRow label="Penalty" value={-10} danger />
          </Section>
        </Grid>
      </Grid>
    ),
  },
};
