import React from 'react';
import { Chip, Stack, Typography } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import RollCard from './RollCard';
import RollField from './RollField';
import { D100, HIGH_OPEN_D100 } from './presets';

const meta: Meta<typeof RollCard> = {
  title: 'Rolls/RollCard',
  component: RollCard,
};
export default meta;
type Story = StoryObj<typeof RollCard>;

/** The attack roll before it is entered. */
export const Pending: Story = {
  args: {
    title: 'Attack roll',
    statusText: 'Enter the attack roll.',
    field: <RollField spec={HIGH_OPEN_D100} label="Attack roll" value={null} onChange={fn()} />,
    total: 70,
    totalLabel: 'Expected total',
  },
};

/** An attack roll that causes a critical: the critical roll comes next. */
export const Attention: Story = {
  args: {
    title: 'Attack roll',
    status: 'attention',
    statusText: 'It causes a critical: enter the critical roll.',
    field: <RollField spec={HIGH_OPEN_D100} label="Attack roll" value={92} onChange={fn()} />,
    total: 162,
    chips: (
      <Stack direction="row" spacing={1}>
        <Chip color="error" label="24 dmg" />
        <Chip color="error" label="Critical SE → SF" />
      </Stack>
    ),
  },
};

/** A critical already rolled, with its result below. */
export const Done: Story = {
  args: {
    title: 'Critical roll',
    status: 'done',
    field: <RollField spec={D100} label="Critical roll" value={55} onChange={fn()} />,
    total: 55,
    chips: <Chip color="error" label="26 dmg" />,
    children: (
      <Typography variant="body2" color="text.secondary">
        Text of the critical result.
      </Typography>
    ),
  },
};
