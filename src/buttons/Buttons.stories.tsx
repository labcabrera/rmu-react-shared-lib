import React from 'react';
import { Stack } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import AddButton from './AddButton';
import CancelButton from './CancelButton';
import DeleteButton from './DeleteButton';
import DownloadButton from './DownloadButton';
import EditButton from './EditButton';
import RefreshButton from './RefreshButton';

// Every icon button wrapper of the lib, as they appear in the page header actions.
const AllButtons = ({ disabled, onClick }: { disabled: boolean; onClick: () => void }) => (
  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
    <RefreshButton onClick={onClick} />
    <AddButton onClick={onClick} />
    <EditButton onClick={onClick} disabled={disabled} />
    <CancelButton onClick={onClick} disabled={disabled} />
    <DeleteButton onClick={onClick} disabled={disabled} />
    <DownloadButton onClick={onClick} disabled={disabled} />
  </Stack>
);

const meta = {
  title: 'Buttons/Icon buttons',
  component: AllButtons,
  args: { disabled: false, onClick: fn() },
} satisfies Meta<typeof AllButtons>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Enabled: Story = {};

export const Disabled: Story = { args: { disabled: true } };
