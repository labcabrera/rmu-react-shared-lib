import React from 'react';
import { Box } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import KeyValuePanel from './KeyValuePanel';

const meta = {
  title: 'Display/KeyValuePanel',
  component: KeyValuePanel,
  args: {
    title: 'Physical',
    rows: [
      { label: 'Average height (male)', value: '5\'10"' },
      { label: 'Average height (female)', value: '5\'5"' },
      { label: 'Average weight (male)', value: '180 lbs', hint: 'Medium build' },
      { label: 'Recovery multiplier', value: 'x1.0' },
    ],
  },
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 420 }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof KeyValuePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InPanel: Story = {};

export const Bare: Story = { args: { title: undefined } };
