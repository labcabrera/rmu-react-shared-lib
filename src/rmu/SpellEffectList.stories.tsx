import type { Meta, StoryObj } from '@storybook/react-vite';
import { SpellEffect } from '../api/spell.dto';
import SpellEffectList from './SpellEffectList';

// Effects of invented spells (spec 028). Sample data only, not taken from any book.

const effects: SpellEffect[] = [
  {
    kind: 'attack',
    appliesTo: 'area',
    requiresFailedRr: false,
    attackTable: 'fire-ball',
    attackSize: 'medium',
    criticalType: 'H',
    ob: 'list-ranks',
    radius: 10,
  },
  { kind: 'critical', appliesTo: 'target', requiresFailedRr: false, criticalType: 'L', severityOffset: -1 },
  {
    kind: 'condition',
    appliesTo: 'target',
    requiresFailedRr: true,
    status: 'stunned',
    rounds: 3,
    value: -20,
    note: 'Sample effect: the sparks keep the target off balance.',
  },
  {
    kind: 'modifier',
    appliesTo: 'self',
    requiresFailedRr: false,
    stat: 'db',
    value: 10,
    filter: ['melee', 'missile'],
    duration: {
      type: 'per-level',
      value: 1,
      scale: 'minute',
      perLevel: 1,
      perFailure: null,
      concentration: false,
      raw: null,
    },
  },
  { kind: 'heal', appliesTo: 'target', requiresFailedRr: false, hits: 15, bleeding: 'all', tier: 'healing' },
  {
    kind: 'afflict',
    appliesTo: 'target',
    requiresFailedRr: true,
    afflictionType: 'disease',
    severity: 'medium',
    onset: '1 day',
    effects: [
      { kind: 'modifier', stat: 'maneuver', value: -10 },
      { kind: 'damage', hits: 2 },
    ],
    curedBy: ['sample-cleansing'],
  },
  { kind: 'cure', appliesTo: 'target', requiresFailedRr: false, removes: ['poison', 'asleep'] },
  { kind: 'dispel', appliesTo: 'area', requiresFailedRr: true, scope: 'list' },
  { kind: 'information', appliesTo: 'self', requiresFailedRr: false, note: 'Sample note: reveals a hidden mark.' },
];

const meta = {
  title: 'RMU/SpellEffectList',
  component: SpellEffectList,
  args: { effects },
} satisfies Meta<typeof SpellEffectList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = { args: { effects: [] } };
