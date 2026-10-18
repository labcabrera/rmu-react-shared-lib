import React from 'react';
import { Typography } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import DeleteDialog from './DeleteDialog';
import RmuDialog from './RmuDialog';

const meta = {
  title: 'Dialogs/RmuDialog',
  component: RmuDialog,
  args: {
    open: true,
    title: 'Add skill',
    subtitle: 'Shaktur',
    maxWidth: 'sm',
    children: <Typography>Dialog content.</Typography>,
    onCancel: fn(),
    onConfirm: fn(),
  },
} satisfies Meta<typeof RmuDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConfirmCancel: Story = {};

export const WithDelete: Story = { args: { onDelete: fn(), onConfirm: undefined } };

export const ConfirmDisabled: Story = { args: { onConfirmDisabled: true } };

export const Delete: Story = {
  render: () => (
    <DeleteDialog message="Are you sure you want to delete this item?" open onDelete={fn()} onClose={fn()} />
  ),
};
