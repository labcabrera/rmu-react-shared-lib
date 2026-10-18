import React, { useState } from 'react';
import { Button, Stack } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import RmuTextCard from '../cards/RmuTextCard';
import CardGrid from '../templates/CardGrid';

const items = Array.from({ length: 16 }, (_, index) => ({ id: `item-${index}`, name: `Item ${index + 1}` }));

// Staggered entry of a card grid and the hover lift of clickable cards. "Replay" remounts the grid.
const MotionDemo = () => {
  const [run, setRun] = useState(0);
  return (
    <Stack spacing={2}>
      <Button variant="outlined" onClick={() => setRun((value) => value + 1)} sx={{ alignSelf: 'flex-start' }}>
        Replay
      </Button>
      <CardGrid
        key={run}
        items={items}
        getKey={(item) => item.id}
        renderItem={(item) => (
          <RmuTextCard value={item.name} subtitle="Weapon" image="images/items/arming-sword.png" onClick={() => {}} />
        )}
      />
    </Stack>
  );
};

const meta = { title: 'Theme/Motion', component: MotionDemo } satisfies Meta<typeof MotionDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CardEntryAndHover: Story = {};
