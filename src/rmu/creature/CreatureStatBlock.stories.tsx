import type { Meta, StoryObj } from '@storybook/react-vite';
import CreatureStatBlock from './CreatureStatBlock';
import { sampleCreature } from './creature-fixture';

const meta = {
  title: 'RMU/CreatureStatBlock',
  component: CreatureStatBlock,
  args: { npc: sampleCreature },
} satisfies Meta<typeof CreatureStatBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A minimal NPC: no movement, attacks, RRs or skills. */
export const Minimal: Story = {
  args: {
    npc: {
      ...sampleCreature,
      levelSpread: null,
      outlookType: null,
      archetype: null,
      movement: [],
      criticalSize: null,
      criticalCodes: {
        reduceSeverity: false,
        noKnockdown: false,
        stunImmune: false,
        bleedImmune: false,
        immunities: [],
      },
      deathHits: null,
      running: null,
      attacks: [],
      powerPoints: null,
      resistances: null,
      skills: [],
      encounter: null,
    },
  },
};
