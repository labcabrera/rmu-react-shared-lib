import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import RmuPagination from './RmuPagination';

const meta = {
  title: 'Display/RmuPagination',
  component: RmuPagination,
  args: { page: 0, pageSize: 24, totalPages: 5, setPage: () => {}, setPageSize: () => {} },
  render: function Render(args) {
    const [page, setPage] = useState(args.page);
    const [pageSize, setPageSize] = useState(args.pageSize);
    return <RmuPagination {...args} page={page} pageSize={pageSize} setPage={setPage} setPageSize={setPageSize} />;
  },
} satisfies Meta<typeof RmuPagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FivePages: Story = {};

export const ManyPages: Story = { args: { totalPages: 40, page: 12 } };

export const SinglePage: Story = { args: { totalPages: 1 } };
