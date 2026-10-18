import React, { useState } from 'react';
import { Grid, MenuItem, TextField } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Page } from '../api/api';
import RmuTextCard from '../cards/RmuTextCard';
import { ApiError } from '../data/api-error';
import { rsqlAnd } from '../data/rsql';
import { useEntity } from '../data/useEntity';
import { usePagedQuery } from '../data/usePagedQuery';
import StatRow from '../display/StatRow';
import Section from '../layouts/Section';
import ConfirmDialog from '../ui/ConfirmDialog';
import DataTable from '../ui/DataTable';
import EntitySelect from '../ui/EntitySelect';
import DetailPage from './DetailPage';
import FilterBar from './FilterBar';
import FormPage from './FormPage';
import ListPage from './ListPage';
import SearchField from './SearchField';

type Item = { id: string; name: string; category: string; imageUrl: string };

const names = [
  'Arming sword',
  'Broadsword',
  'Battle axe',
  'Arrow',
  'Boots',
  'Bucket',
  'Cage',
  'Candle',
  'Chain',
  'Chisel',
];
const allItems: Item[] = Array.from({ length: 50 }, (_, index) => ({
  id: `item-${index}`,
  name: `${names[index % names.length]} ${Math.floor(index / names.length) + 1}`,
  category: index % 3 === 0 ? 'weapon' : 'tools',
  imageUrl: 'images/items/arming-sword.png',
}));

// In-memory stand-in for an API list endpoint that understands `name=re=` and `category==`.
const fakeFetch = (rsql: string, page: number, size: number): Promise<Page<Item>> => {
  const name = /name=re=([^;]*)/.exec(rsql)?.[1]?.toLowerCase();
  const category = /category==([^;]*)/.exec(rsql)?.[1];
  const filtered = allItems.filter(
    (item) => (!name || item.name.toLowerCase().includes(name)) && (!category || item.category === category)
  );
  const content = filtered.slice(page * size, page * size + size);
  const pagination = { page, size, totalElements: filtered.length, totalPages: Math.ceil(filtered.length / size) };
  return new Promise((resolve) => setTimeout(() => resolve({ content, pagination }), 400));
};

const ListExample = ({ failing = false }: { failing?: boolean }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const query = usePagedQuery({
    fetcher: failing ? () => Promise.reject(new ApiError(500, 'Internal Server Error', '', '/x')) : fakeFetch,
    rsql: rsqlAnd([
      ['name=re=', name],
      ['category==', category],
    ]),
    pageSize: 12,
  });
  return (
    <ListPage
      breadcrumbs={[{ name: 'Home', link: '/' }, { name: 'Items' }]}
      query={query}
      onAdd={fn()}
      filters={
        <FilterBar>
          <SearchField value={name} onChange={setName} />
          <TextField select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} fullWidth>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="weapon">Weapon</MenuItem>
            <MenuItem value="tools">Tools</MenuItem>
          </TextField>
        </FilterBar>
      }
      renderItem={(item) => <RmuTextCard value={item.name} subtitle={item.category} image={item.imageUrl} />}
    />
  );
};

const DetailExample = ({ id }: { id: string }) => {
  const entity = useEntity(id, (itemId) =>
    itemId === 'missing'
      ? Promise.reject(new ApiError(404, 'Not Found', '', '/x'))
      : fakeFetch('', 0, 50).then((page) => page.content[0])
  );
  return (
    <DetailPage
      breadcrumbs={[{ name: 'Home', link: '/' }, { name: 'Items', link: '/items' }, { name: 'View' }]}
      entity={entity}
      onEdit={fn()}
      onDelete={fn()}
      leftPanel={(item) => <RmuTextCard value={item.name} subtitle={item.category} image={item.imageUrl} />}
    >
      {(item) => (
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Section title="Information">
              <StatRow label="Name" value={item.name} />
              <StatRow label="Category" value={item.category} />
            </Section>
          </Grid>
        </Grid>
      )}
    </DetailPage>
  );
};

const FormExample = () => {
  const [name, setName] = useState('Arming sword');
  const [realm, setRealm] = useState<string | null>(null);
  return (
    <FormPage
      breadcrumbs={[{ name: 'Home', link: '/' }, { name: 'Items', link: '/items' }, { name: 'Edit' }]}
      onSave={fn()}
      onCancel={fn()}
      dirty={name !== 'Arming sword' || realm !== null}
      saveDisabled={!name}
    >
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth required />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <EntitySelect
            label="Realm"
            value={realm}
            onChange={setRealm}
            options={[
              { id: 'middle-earth', name: 'Middle-earth' },
              { id: 'kulthea', name: 'Kulthea' },
            ]}
          />
        </Grid>
      </Grid>
    </FormPage>
  );
};

const meta = {
  title: 'Templates/Pages',
  component: ListExample,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ListExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const List: Story = {};

export const ListWithError: Story = { args: { failing: true } };

export const Detail: Story = { render: () => <DetailExample id="item-0" /> };

export const DetailNotFound: Story = { render: () => <DetailExample id="missing" /> };

export const Form: Story = { render: () => <FormExample /> };

export const Table: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <DataTable
      rows={allItems.slice(0, 5)}
      getKey={(row) => row.id}
      columns={[
        { key: 'name', header: 'Name', render: (row) => row.name },
        { key: 'category', header: 'Category', render: (row) => row.category },
        { key: 'attack', header: 'Attack table', render: () => 'Arming sword' },
        { key: 'fumble', header: 'Fumble table', render: () => 'Melee one hand' },
        { key: 'size', header: 'Size adjustment', render: () => 0, align: 'right' },
      ]}
    />
  ),
};

export const Confirm: Story = {
  render: () => (
    <ConfirmDialog
      open
      title="Unsaved changes"
      message="Discard the changes?"
      confirmLabel="Discard"
      destructive
      onConfirm={fn()}
      onClose={fn()}
    />
  ),
};
