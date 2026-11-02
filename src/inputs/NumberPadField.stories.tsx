import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import NumberPadField from './NumberPadField';

const meta = {
  title: 'Inputs/NumberPadField',
  component: NumberPadField,
  args: { label: 'Bonus', value: 5, onChange: () => {}, integer: true, signed: true },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <NumberPadField {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof NumberPadField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Opens in a popover with a mouse on a large screen, in a dialog on touch screens and narrow windows. */
export const Auto: Story = {};

export const Dialog: Story = { args: { presentation: 'dialog' } };

export const Bounded: Story = {
  args: { label: 'Hit points', value: 12, min: 0, max: 40, allowNegatives: false, signed: false },
};

export const Decimal: Story = { args: { label: 'Distance', value: 2.5, integer: false, signed: false, suffix: 'ft' } };
