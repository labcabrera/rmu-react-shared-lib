import React, { useState } from 'react';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import { Box, Typography } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import CharacterPicker, { CharacterOption } from './CharacterPicker';

// Sample data only.
const OPTIONS: CharacterOption[] = [
  { id: 'a', name: 'Aragorn', factionId: 'f1', factionName: 'Fellowship', color: '#4f8cc9', secondary: 'Fighter · 8' },
  { id: 'b', name: 'Boromir', factionId: 'f1', factionName: 'Fellowship', color: '#4f8cc9', badges: ['Stunned'] },
  { id: 'o', name: 'Orc captain', factionId: 'f2', factionName: 'Mordor', color: '#c94f4f', secondary: 'Fighter · 4' },
  { id: 'u', name: 'Uruk', factionId: 'f2', factionName: 'Mordor', color: '#c94f4f', disabledReason: 'Dead' },
];

const many = Array.from({ length: 16 }, (_, index) => ({
  id: `c${index}`,
  name: `Character ${index + 1}`,
  factionId: index % 2 ? 'f1' : 'f2',
  factionName: index % 2 ? 'Fellowship' : 'Mordor',
}));

const meta = {
  title: 'Selectors/CharacterPicker',
  component: CharacterPicker,
  args: { options: OPTIONS, value: null, onChange: () => undefined },
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 720 }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof CharacterPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

const Single = (props: { relation?: 'friends' | 'enemies' | 'all'; options?: CharacterOption[]; extra?: boolean }) => {
  const [value, setValue] = useState<string | null>(null);
  return (
    <CharacterPicker
      label="Target"
      options={props.options ?? OPTIONS}
      relation={props.relation}
      factionId="f1"
      allowShowAll
      extraOptions={props.extra ? [{ id: 'armory', name: 'Armory', icon: <WarehouseIcon /> }] : undefined}
      renderDetails={(option) => (
        <Typography variant="caption" color="text.secondary">
          {option.factionName}
        </Typography>
      )}
      value={value}
      onChange={setValue}
    />
  );
};

const Multiple = ({ compact = false, options = OPTIONS }: { compact?: boolean; options?: CharacterOption[] }) => {
  const [value, setValue] = useState<string[]>([]);
  return (
    <CharacterPicker
      mode="multiple"
      label="Actors"
      variant={compact ? 'compact' : 'auto'}
      groupByFaction
      options={options}
      value={value}
      onChange={setValue}
    />
  );
};

export const SingleEnemies: Story = { render: () => <Single relation="enemies" /> };
export const SingleWithExtraEntry: Story = { render: () => <Single relation="friends" extra /> };
export const MultipleCards: Story = { render: () => <Multiple /> };
export const MultipleCompact: Story = { render: () => <Multiple compact /> };
export const AutoCompactLongList: Story = { render: () => <Multiple options={many} /> };
