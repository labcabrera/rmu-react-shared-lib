import React from 'react';
import { Stack } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { effectIcon } from '../rmu/EffectList';
import RmuChip from './RmuChip';

const meta = {
  title: 'UI/RmuChip',
  component: RmuChip,
  args: { variant: 'rule', label: 'Big (+1)' },
} satisfies Meta<typeof RmuChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Rule: Story = { args: { hint: 'Damage ×1.5, critical one level higher' } };

/** The three variants side by side; switch the Storybook theme to compare light and dark. */
export const Variants: Story = {
  render: () => (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1}>
        <RmuChip variant="rule" label="Big (+1)" />
        <RmuChip variant="rule" label="Shield +25" />
      </Stack>
      <Stack direction="row" spacing={1}>
        <RmuChip variant="outcome" tone="error" label="Damage 12" />
        <RmuChip variant="outcome" tone="error" label="Critical C Slash" />
        <RmuChip variant="outcome" tone="warning" label="Fumble" />
        <RmuChip variant="outcome" label="No damage" />
      </Stack>
      <Stack direction="row" spacing={1}>
        <RmuChip variant="effect" tone="error" avatar={effectIcon('bleeding')} label="Bleeding 2" />
        <RmuChip variant="effect" tone="error" avatar={effectIcon('stunned')} label="Stunned 1 rnd" />
        <RmuChip variant="effect" tone="warning" avatar={effectIcon('fatigue')} label="Fatigue -5" />
        <RmuChip variant="effect" avatar={effectIcon('penalty')} label="Penalty -20" />
      </Stack>
    </Stack>
  ),
};
