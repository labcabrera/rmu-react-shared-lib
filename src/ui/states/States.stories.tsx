import React from 'react';
import { Button, Stack } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { NotificationProvider, useNotify } from '../../app/NotificationProvider';
import { ApiError } from '../../data/api-error';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import LoadingState from './LoadingState';

const meta = {
  title: 'States/LoadingState',
  component: LoadingState,
} satisfies Meta<typeof LoadingState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Spinner: Story = {};

export const CardList: Story = { args: { variant: 'cards', count: 8 } };

export const Detail: Story = { args: { variant: 'detail' } };

export const Empty: Story = {
  render: () => (
    <EmptyState description="No item matches the filters." action={<Button variant="outlined">Create</Button>} />
  ),
};

export const ApiFailure: Story = {
  render: () => (
    <ErrorState error={new ApiError(500, 'Internal Server Error', '', '/api/items/v1/items')} onRetry={fn()} />
  ),
};

const NotificationButtons = () => {
  const notify = useNotify();
  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
      <Button onClick={() => notify.success('Item saved')}>Success</Button>
      <Button onClick={() => notify.info('Changes are saved automatically')}>Info</Button>
      <Button onClick={() => notify.warning('The realm has no races yet')}>Warning</Button>
      <Button onClick={() => notify.error(new ApiError(404, 'Not Found', '{"message":"Item not found"}', '/x'))}>
        API error
      </Button>
    </Stack>
  );
};

export const Notifications: Story = {
  render: () => (
    <NotificationProvider>
      <NotificationButtons />
    </NotificationProvider>
  ),
};
