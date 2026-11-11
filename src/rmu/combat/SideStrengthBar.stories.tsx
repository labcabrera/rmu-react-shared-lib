import React from 'react';
import { Box, Stack } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import SideStrengthBar from './SideStrengthBar';
import { sideStrength, SideStrengthActor } from './side-strength';

// Strength bars of the sides of a tactical game (spec 100). Sample data only.

const member = (factionId: string, level: number, hp: [number, number], status?: string): SideStrengthActor => ({
  factionId,
  level,
  hp: { current: hp[0], max: hp[1] },
  effects: status ? [{ status }] : [],
});

const ACTORS: SideStrengthActor[] = [
  member('maela', 8, [-4, 90], 'dead'),
  member('maela', 4, [30, 45]),
  member('maela', 2, [0, 25], 'unconscious'),
  member('maela', 2, [20, 25], 'fear-routed'),
  member('maela', 2, [25, 25]),
  member('orcs', 3, [28, 35]),
  member('orcs', 3, [35, 35]),
  member('wolves', 2, [10, 30], 'dying'),
];

const [company, horde] = sideStrength(ACTORS, [
  { id: 'company', factionIds: ['maela'] },
  { id: 'horde', factionIds: ['orcs', 'wolves'] },
]);

const meta: Meta<typeof SideStrengthBar> = {
  title: 'Combat/SideStrengthBar',
  component: SideStrengthBar,
};
export default meta;

type Story = StoryObj<typeof SideStrengthBar>;

export const Default: Story = {
  render: () => (
    <Box sx={{ maxWidth: 360 }}>
      <SideStrengthBar label="Maela's company" color="#4f8fe6" strength={company} leaderName="Maela" />
    </Box>
  ),
};

export const DenseStrip: Story = {
  render: () => (
    <Stack direction="row" spacing={2} sx={{ overflowX: 'auto' }}>
      <Box sx={{ minWidth: 220 }}>
        <SideStrengthBar label="Maela's company" color="#4f8fe6" strength={company} leaderName="Maela" dense />
      </Box>
      <Box sx={{ minWidth: 220 }}>
        <SideStrengthBar label="Orc horde" color="#d9534f" strength={horde} dense />
      </Box>
    </Stack>
  ),
};
