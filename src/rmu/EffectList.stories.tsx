import type { Meta, StoryObj } from '@storybook/react-vite';
import EffectList from './EffectList';

const meta = {
  title: 'RMU/EffectList',
  component: EffectList,
  args: {
    effects: [
      { status: 'bleeding', value: 4 },
      { status: 'stunned', value: -25, rounds: 2 },
      { status: 'penalty', value: 0 },
    ],
    penalties: [
      { source: 'hp', value: -50 },
      { source: 'critical', value: -5 },
    ],
  },
} satisfies Meta<typeof EffectList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Dead: Story = { args: { effects: [{ status: 'dead' }], penalties: [] } };

export const OnlyPenalties: Story = { args: { effects: [] } };

export const Nothing: Story = {
  args: { effects: [{ status: 'penalty', value: 0 }], penalties: [{ source: 'hp', value: 0 }] },
};

/** Dense places (tables, list cards, the combat board): icon, abbreviation and value; full text on hover or tap. */
export const Compact: Story = {
  args: {
    variant: 'compact',
    effects: [
      { status: 'unconscious' },
      { status: 'bleeding', value: 4 },
      { status: 'stunned', value: -25, rounds: 2 },
    ],
  },
};
