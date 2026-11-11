import React, { useState } from 'react';
import { Box, Stack } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Realm } from '../api/realm.dto';
import EntityPicker, { EntityOption } from './EntityPicker';
import { AttackTablePicker, EnumPicker, ItemCategoryPicker, RarityPicker, RealmPicker } from './pickers';

// Sample data only.
const realms = [
  { id: 'r1', name: 'Middle Earth', imageUrl: 'images/generic/realm.png' },
  { id: 'r2', name: 'Shadow World' },
  { id: 'r3', name: 'Harnworld', imageUrl: 'images/missing.png' },
] as Realm[];

const professions: EntityOption[] = ['fighter', 'thief', 'rogue', 'ranger', 'mystic', 'healer', 'bard', 'monk'].map(
  (id) => ({ id, label: id[0].toUpperCase() + id.slice(1), imageUrl: `images/professions/${id}.png` })
);

const skills: EntityOption[] = Array.from({ length: 20 }, (_, index) => ({
  id: `skill-${index}`,
  label: `Skill ${index + 1}`,
  secondary: index % 3 ? undefined : 'Specialization required',
  group: ['Combat', 'Lore', 'Outdoor', 'Social'][index % 4],
  disabledReason: index === 5 ? 'No ranks' : undefined,
}));

const meta = {
  title: 'Selectors/EntityPicker',
  component: EntityPicker,
  args: { options: professions, value: null, onChange: () => undefined },
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 560 }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof EntityPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

const Single = ({ options, allowAll = false }: { options: EntityOption[]; allowAll?: boolean }) => {
  const [value, setValue] = useState<string | null>(null);
  return (
    <EntityPicker
      label="Profession"
      kind="profession"
      options={options}
      value={value}
      allowAll={allowAll}
      onChange={(id) => setValue(id)}
    />
  );
};

const Multiple = ({ options, variant }: { options: EntityOption[]; variant?: 'tiles' | 'select' }) => {
  const [value, setValue] = useState<string[]>([]);
  return (
    <EntityPicker
      mode="multiple"
      variant={variant}
      label="Skills"
      kind="skill"
      options={options}
      value={value}
      onChange={(ids) => setValue(ids)}
    />
  );
};

/** Eight options or fewer: chips with their image, a radio group. */
export const Tiles: Story = { render: () => <Single options={professions} allowAll /> };

/** More than eight options: a searchable select grouped by category, with the image in the options and the value. */
export const Select: Story = { render: () => <Single options={skills} /> };

/** Several values as checkboxes (tiles) or chips in the select. */
export const MultipleChoice: Story = {
  render: () => (
    <Stack spacing={3}>
      <Multiple options={professions} />
      <Multiple options={skills} variant="select" />
    </Stack>
  ),
};

const PresetsDemo = () => {
  const [realm, setRealm] = useState<string | null>('r1');
  const [category, setCategory] = useState<string | null>('armor');
  const [rarities, setRarities] = useState<string[]>(['rare']);
  const [table, setTable] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>('open');
  return (
    <Stack spacing={3}>
      <RealmPicker realms={realms} value={realm} onChange={setRealm} />
      <ItemCategoryPicker value={category} allowAll onChange={setCategory} />
      <ItemCategoryPicker
        variant="tiles"
        categories={['weapon', 'armor', 'shield', 'mount']}
        value={category}
        onChange={setCategory}
      />
      <RarityPicker mode="multiple" value={rarities} onChange={setRarities} />
      <AttackTablePicker tables={['arming-sword', 'battle-axe', 'dagger', 'mace']} value={table} onChange={setTable} />
      <EnumPicker label="Status" values={['created', 'open', 'closed']} value={status} onChange={setStatus} />
    </Stack>
  );
};

/** Presets: options, labels and fallback images of each entity (no network: tables are passed). */
export const Presets: Story = { render: () => <PresetsDemo /> };
