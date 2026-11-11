import type { Meta, StoryObj } from '@storybook/react-vite';
import ItemModifierChips from './ItemModifierChips';

const meta: Meta<typeof ItemModifierChips> = {
  title: 'RMU/Item/ItemModifierChips',
  component: ItemModifierChips,
};

export default meta;
type Story = StoryObj<typeof ItemModifierChips>;

const modifiers = [
  {
    id: 'b1',
    type: 'breakage' as const,
    value: -10,
    appliesTo: 'all' as const,
    source: { kind: 'tactical' as const, tacticalGameName: 'Ambush at the ford', round: 3 },
    createdAt: '2026-10-24T16:30:00Z',
  },
  {
    id: 'q1',
    type: 'quality' as const,
    value: 5,
    appliesTo: 'attack' as const,
    source: { kind: 'manual' as const },
    description: 'Dwarven steel',
    createdAt: '2026-10-20T10:00:00Z',
  },
  {
    id: 'b2',
    type: 'breakage' as const,
    value: -20,
    appliesTo: 'all' as const,
    broken: true,
    source: { kind: 'tactical' as const, tacticalGameName: 'Ambush at the ford', round: 5 },
    createdAt: '2026-10-24T16:32:00Z',
  },
];

export const Several: Story = { args: { modifiers } };
export const Folded: Story = { args: { modifiers, max: 1 } };
