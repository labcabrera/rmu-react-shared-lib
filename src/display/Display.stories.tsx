import React from 'react';
import { Stack } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import CategorySeparator from './CategorySeparator';
import NotFound from './NotFound';
import StatRow from './StatRow';
import TechnicalInfo from './TechnicalInfo';

const meta = {
  title: 'Display/StatRow',
  component: StatRow,
  args: { label: 'Defensive bonus', value: 12 },
} satisfies Meta<typeof StatRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Success: Story = { args: { success: true } };

export const Danger: Story = { args: { value: -13, danger: true } };

export const Rows: Story = {
  render: () => (
    <Stack spacing={1}>
      <CategorySeparator text="Resume" />
      <StatRow label="Height" value="6.5'" />
      <StatRow label="Weight" value="250 lbs" />
      <StatRow label="Maneuver penalty" value={-10} danger />
      <StatRow label="Defensive bonus" value={12} success />
    </Stack>
  ),
};

export const TechnicalInfoPanel: Story = {
  render: () => (
    <TechnicalInfo>
      <pre>{JSON.stringify({ id: 'arming-sword', category: 'weapon' }, null, 2)}</pre>
    </TechnicalInfo>
  ),
};

export const NotFoundState: Story = { render: () => <NotFound /> };
