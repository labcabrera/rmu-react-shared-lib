import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import OptionGroup from './OptionGroup';

const meta = {
  title: 'Inputs/OptionGroup',
  component: OptionGroup,
  args: {
    label: 'Pace',
    options: [
      { key: 'normal', label: 'Normal', value: 0 },
      { key: 'press', label: 'Press the attack', value: 10 },
      { key: 'reckless', label: 'Reckless', value: 20 },
      { key: 'cautious', label: 'Cautious', value: -10 },
    ],
    value: 'normal',
    onChange: () => {},
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value as string);
    return <OptionGroup {...args} multiple={false} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof OptionGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Exclusive: Story = {};

export const Small: Story = { args: { size: 'small' } };

export const Multiple: Story = {
  args: { value: '' },
  render: function Render() {
    const [value, setValue] = useState<string[]>(['stunned']);
    return (
      <OptionGroup
        multiple
        label="Target"
        options={[
          { key: 'stunned', label: 'Stunned', value: 20, auto: true, hint: 'From the target effects' },
          { key: 'surprised', label: 'Surprised', value: 25 },
          { key: 'prone', label: 'Prone', value: 30 },
          { key: 'ambush', label: 'Ambush' },
        ]}
        value={value}
        onChange={setValue}
      />
    );
  },
};
