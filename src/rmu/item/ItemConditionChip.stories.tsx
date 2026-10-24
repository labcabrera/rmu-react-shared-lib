import type { Meta, StoryObj } from '@storybook/react-vite';
import ItemConditionChip from './ItemConditionChip';

const meta: Meta<typeof ItemConditionChip> = {
  title: 'RMU/Item/ItemConditionChip',
  component: ItemConditionChip,
};

export default meta;
type Story = StoryObj<typeof ItemConditionChip>;

export const Damaged: Story = { args: { condition: { breakagePenalty: -20, broken: false } } };
export const Broken: Story = { args: { condition: { breakagePenalty: -30, broken: true } } };
export const Intact: Story = { args: { condition: { breakagePenalty: 0, broken: false }, showIntact: true } };
