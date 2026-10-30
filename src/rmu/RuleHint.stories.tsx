import React from 'react';
import { Stack, Typography } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FieldHint } from './RuleHint';

const meta = {
  title: 'RMU/FieldHint',
  component: FieldHint,
  args: {
    title: 'Lethality',
    description: 'Scales the critical results. Higher values make combat deadlier; 0 is the book value.',
    reference: '§9.8',
  },
  render: (args) => (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
      <Typography>Lethality</Typography>
      <FieldHint {...args} />
    </Stack>
  ),
} satisfies Meta<typeof FieldHint>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Spec 052: the help of a form field; click or tap pins it, a resting mouse previews it. */
export const NextToALabel: Story = {};
