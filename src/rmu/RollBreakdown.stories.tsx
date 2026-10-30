import type { Meta, StoryObj } from '@storybook/react-vite';
import RollBreakdown from './RollBreakdown';

const meta = {
  title: 'RMU/RollBreakdown',
  component: RollBreakdown,
  args: {
    modifiers: [
      { key: 'bo', value: 94, group: 'offense', source: 'offensive-bonus' },
      { key: 'action-points', value: -25, group: 'offense', source: 'action-points' },
      { key: 'bd', value: -24, group: 'defense', source: 'defensive-bonus' },
      { key: 'parry', value: -20, group: 'defense', source: 'parry' },
      { key: 'positional-target', value: 15, group: 'situation', source: 'positional-target' },
    ],
  },
} satisfies Meta<typeof RollBreakdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BeforeTheRoll: Story = {};

export const WithRoll: Story = { args: { roll: 80 } };

/** Old actions stored their modifiers without group: they are shown in one list. */
export const WithoutGroups: Story = {
  args: {
    modifiers: [
      { key: 'bo', value: 60 },
      { key: 'bd', value: -12 },
    ],
    roll: 45,
  },
};

/** Spec 051: the rows explain themselves (click or tap; mouse hover previews) and the rules not applied fold below. */
export const WithExplanations: Story = {
  args: {
    modifiers: [
      { key: 'bo', value: 94, group: 'offense', source: 'offensive-bonus', rule: '§9.5', params: { bo: 94 } },
      { key: 'bd', value: -24, group: 'defense', source: 'defensive-bonus', rule: '§9.6', params: { bd: 24 } },
      {
        key: 'shield-block',
        value: -29,
        group: 'defense',
        source: 'shield',
        rule: '§9.6',
        params: { mode: 'partial', skill: 78, injury: -10 },
      },
      { key: 'parry', value: -20, group: 'defense', source: 'parry', rule: '§9.6', params: { parry: 20 } },
    ],
    skipped: [{ source: 'dodge', group: 'defense', reason: 'target-flatfooted', rule: '§9.6' }],
    roll: 80,
  },
};
