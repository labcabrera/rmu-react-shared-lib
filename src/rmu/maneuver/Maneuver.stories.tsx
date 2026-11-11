import React from 'react';
import { Box, Grid } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ManeuverModifier } from '../../api/maneuver-modifier.dto';
import Panel from '../../layouts/Panel';
import ManeuverModifierList, { ManeuverModifierWithOrigin } from './ManeuverModifierList';
import ManeuverProfilePanel from './ManeuverProfilePanel';

// Maneuver profile and modifiers of a skill (spec 012 §3). Sample data only.

const base: Omit<ManeuverModifier, 'id' | 'key' | 'type'> = { scope: {}, accessType: 'public', owner: 'admin' };

const modifiers: ManeuverModifierWithOrigin[] = [
  { ...base, id: 'rope', key: 'rope', type: 'flag', value: 20, description: 'Using a rope', origin: 'skill' },
  {
    ...base,
    id: 'surface',
    key: 'surface',
    type: 'choice',
    options: [
      { key: 'smooth', value: -30 },
      { key: 'rough', value: 0 },
      { key: 'handholds', value: 20 },
    ],
    origin: 'category',
  },
  {
    ...base,
    id: 'distance',
    key: 'distance',
    type: 'number',
    perUnit: -5,
    min: 1,
    max: 10,
    description: 'Per 10 feet',
    origin: 'category',
  },
];

const meta = {
  title: 'RMU/Maneuver profile',
  component: ManeuverProfilePanel,
  args: {
    profile: { defaultType: 'percent', resultTable: 'maneuver-table', movement: true, light: 'helpful' },
    overrides: { defaultType: 'percent' },
  },
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 480 }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof ManeuverProfilePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SkillProfile: Story = {};

export const CategoryProfile: Story = {
  args: {
    profile: { defaultType: 'absolute', movement: false, light: 'none', actionPoints: { min: 1, max: 4 } },
    overrides: undefined,
  },
};

export const Bare: Story = { args: { bare: true } };

export const SkillDetail: Story = {
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 'none' }}>
        <Story />
      </Box>
    ),
  ],
  render: (args) => (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 5 }}>
        <ManeuverProfilePanel {...args} />
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <Panel title="Maneuver modifiers">
          <ManeuverModifierList modifiers={modifiers} />
        </Panel>
      </Grid>
    </Grid>
  ),
};

export const NoModifiers: Story = { render: () => <ManeuverModifierList modifiers={[]} /> };
