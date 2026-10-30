import React, { useState } from 'react';
import { Button, Stack } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Npc } from '../../api/npc.dto';
import { NpcEntry, NpcEntryDialog, NpcEntryList } from './NpcEntries';

// Invented NPCs, not taken from any book.
const npcs = [
  { id: 'n1', name: 'Grey wolf', category: 'animal', level: 3, group: 'dogs', source: null, imageUrl: null },
  { id: 'n2', name: 'Stone guard', category: 'artificial', level: 8, group: null, source: null, imageUrl: null },
] as unknown as Npc[];

const meta = {
  title: 'RMU/Creature/NpcEntries',
  component: NpcEntryList,
  args: { npcs, entries: [] },
} satisfies Meta<typeof NpcEntryList>;

export default meta;
type Story = StoryObj<typeof meta>;

const Editor = () => {
  const [entries, setEntries] = useState<NpcEntry[]>([
    { npcId: 'n1', name: 'Grey wolf', count: 3 },
    { npcId: 'n2', name: 'Gate guards', count: 2, notes: 'Only at night' },
  ]);
  const [editing, setEditing] = useState<number | 'new' | null>(null);
  return (
    <Stack spacing={2} sx={{ maxWidth: 560 }}>
      <NpcEntryList
        npcs={npcs}
        entries={entries}
        onEdit={setEditing}
        onRemove={(index) => setEntries(entries.filter((_, each) => each !== index))}
      />
      <Button onClick={() => setEditing('new')}>Add</Button>
      <NpcEntryDialog
        open={editing !== null}
        title="NPC"
        npcs={npcs}
        withNotes
        entry={typeof editing === 'number' ? entries[editing] : undefined}
        onClose={() => setEditing(null)}
        onSave={(entry) => {
          setEntries(
            typeof editing === 'number' ? entries.map((e, i) => (i === editing ? entry : e)) : [...entries, entry]
          );
          setEditing(null);
        }}
      />
    </Stack>
  );
};

/** A list with its add, edit and remove dialog. */
export const Default: Story = { render: () => <Editor /> };

export const Empty: Story = {};
