import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Panel from '../layouts/Panel';
import { sampleCharacter } from '../test/fixtures/character';
import BonusDevPointsSummary from './character/BonusDevPointsSummary';
import StatBonusGrid from './character/StatBonusGrid';
import TraitTypeChip from './trait/TraitTypeChip';

// Generic detail blocks of spec 012: racial stat bonuses, trait type chips and the bonus DP summary.
// Sample data only.

const raceStats = { ag: 2, co: 0, em: -2, in: 1, me: 0, pr: 3, qu: 2, re: -1, sd: 0, st: -2 };

const meta = {
  title: 'RMU/Stat bonus grid',
  component: StatBonusGrid,
  args: { stats: raceStats },
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 720 }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof StatBonusGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RaceStats: Story = {};

export const Dense: Story = { args: { dense: true } };

export const InPanel: Story = {
  render: (args) => (
    <Panel title="Stats">
      <StatBonusGrid {...args} />
    </Panel>
  ),
};

export const TraitTypes: Story = {
  render: () => (
    <Stack direction="row" spacing={1}>
      <TraitTypeChip isTalent />
      <TraitTypeChip isTalent={false} />
      <TraitTypeChip isTalent size="medium" />
      <TraitTypeChip isTalent={false} size="medium" />
    </Stack>
  ),
};

export const BonusDevPoints: Story = {
  render: () => (
    <Stack spacing={2}>
      <BonusDevPointsSummary
        character={{
          ...sampleCharacter,
          experience: {
            ...sampleCharacter.experience,
            availableBonusDevPoints: 18,
            bonusDevPointsSpentThisLevel: 7,
            flawDevPoints: 5,
          },
        }}
      />
      <Typography variant="caption" color="text.secondary">
        Without bonus or flaw points it renders nothing.
      </Typography>
    </Stack>
  ),
};
