import React from 'react';
import { Stack } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import AddButton from './AddButton';
import BackButton from './BackButton';
import CancelButton from './CancelButton';
import ClearButton from './ClearButton';
import DeleteButton from './DeleteButton';
import DownloadButton from './DownloadButton';
import EditButton from './EditButton';
import NextButton from './NextButton';
import RefreshButton from './RefreshButton';
import SaveButton from './SaveButton';

// Every icon button wrapper of the lib, as they appear in the page header actions.
const AllButtons = ({ disabled, onClick }: { disabled: boolean; onClick: () => void }) => (
  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
    <RefreshButton onClick={onClick} />
    <AddButton onClick={onClick} />
    <EditButton onClick={onClick} disabled={disabled} />
    <SaveButton onClick={onClick} disabled={disabled} />
    <CancelButton onClick={onClick} disabled={disabled} />
    <DeleteButton onClick={onClick} disabled={disabled} />
    <DownloadButton onClick={onClick} disabled={disabled} />
    <ClearButton onClick={onClick} disabled={disabled} />
    <BackButton onClick={onClick} disabled={disabled} />
    <NextButton onClick={onClick} disabled={disabled} />
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
