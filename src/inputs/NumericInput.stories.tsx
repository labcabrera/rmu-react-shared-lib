import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import NumericInput from './NumericInput';
import NumericReadonlyInput from './NumericReadonlyInput';

const meta = {
  title: 'Inputs/NumericInput',
  component: NumericInput,
  args: { label: 'Weight', value: 2.5, onChange: () => {} },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <NumericInput {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof NumericInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Decimal: Story = {};

export const Integer: Story = { args: { label: 'Level', value: 3, integer: true, allowNegatives: false } };

export const WithError: Story = { args: { label: 'Strength', value: null, error: true } };

export const ReadOnly: Story = {
  render: () => <NumericReadonlyInput label="Cost average" name="cost" value={0.18} />,
};
