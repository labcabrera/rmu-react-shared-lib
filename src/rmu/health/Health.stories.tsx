import React, { useState } from 'react';
import { Box, Button, Link, Stack } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { bleedingCut, permanentOrgan, recoveringBone, sampleInjuries } from '../../test/fixtures/injury';
import HealerPicker, { HealerCandidate, HealerSelection } from './HealerPicker';
import HpBreakdown from './HpBreakdown';
import InjuryCard from './InjuryCard';
import InjuryList from './InjuryList';
import InjurySourceLine from './InjurySourceLine';
import InjuryTypeChip from './InjuryTypeChip';

// Injuries and healing (spec 013 §7). Sample data only.

const meta = {
  title: 'RMU/Health',
  component: InjuryCard,
  args: { injury: bleedingCut },
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 560 }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof InjuryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bleeding: Story = {
  args: { actions: <Button size="small">Treat</Button>, onEdit: () => undefined },
};

export const Recovering: Story = { args: { injury: recoveringBone } };

export const Permanent: Story = { args: { injury: permanentOrgan } };

export const Dense: Story = { args: { dense: true } };

export const List: Story = {
  render: () => (
    <InjuryList
      injuries={sampleInjuries}
      showHealed
      renderActions={() => <Button size="small">Treat</Button>}
      renderGameLink={(id, label) => <Link href={`#/tactical/${id}`}>{label}</Link>}
    />
  ),
};

export const EmptyList: Story = { render: () => <InjuryList injuries={[]} /> };

export const TypesAndSource: Story = {
  render: () => (
    <Stack spacing={1}>
      <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
        {(['bone', 'cut-burn', 'muscle-tendon', 'organ', 'poison-disease', 'skin-tissue', 'unknown'] as const).map(
          (type) => (
            <InjuryTypeChip key={type} type={type} />
          )
        )}
      </Stack>
      <InjurySourceLine source={bleedingCut.source} />
    </Stack>
  ),
};

const healers: HealerCandidate[] = [
  { id: 'me', name: 'Wounded ranger', medicine: 25, herbalism: 10 },
  { id: 'healer', name: 'Village healer', medicine: 65, herbalism: 40 },
];

const HealerPickerDemo = () => {
  const [value, setValue] = useState<HealerSelection>({ mode: 'self' });
  return <HealerPicker characters={healers} selfId="me" value={value} onChange={setValue} />;
};

export const Healer: Story = { render: () => <HealerPickerDemo /> };

export const HitsBySource: Story = {
  render: () => (
    <HpBreakdown
      bySource={{
        byKind: { attack: -18, critical: -9, bleeding: -6, treatment: 4 },
        byAttacker: [
          { attackerId: 'orc-1', attackerName: 'Orc captain', amount: -27 },
          { attackerId: 'orc-2', attackerName: 'Orc archer', amount: -6 },
        ],
      }}
    />
  ),
};
