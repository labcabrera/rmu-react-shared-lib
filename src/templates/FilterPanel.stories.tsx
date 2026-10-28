import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import EntityCard from '../cards/EntityCard';
import { FilterSchema, useListFilters } from '../data/useListFilters';
import { useLocalPagedQuery } from '../data/useLocalPagedQuery';
import ClearableTextField from '../inputs/ClearableTextField';
import { EnumPicker } from '../selectors/pickers';
import { gridSizeShowcase } from './CollectionView';
import FilterBar from './FilterBar';
import { FilterSection } from './FilterPanel';
import ListPage from './ListPage';

// Sample data only.
type Creature = { id: string; name: string; kind: string; size: string; level: number };
const kinds = ['animal', 'undead', 'demon', 'dragon'];
const sizes = ['small', 'medium', 'large', 'huge'];
const creatures: Creature[] = Array.from({ length: 60 }, (_, index) => ({
  id: `c${index}`,
  name: `${['Wolf', 'Ghoul', 'Imp', 'Drake', 'Bear', 'Wraith'][index % 6]} ${index + 1}`,
  kind: kinds[index % 4],
  size: sizes[(index * 7) % 4],
  level: (index % 10) + 1,
}));

const schema: FilterSchema<Creature> = {
  q: { kind: 'text', label: 'Name', match: (c, value) => c.name.toLowerCase().includes(String(value).toLowerCase()) },
  kind: { kind: 'single', label: 'Kind', options: kinds, match: (c, value) => c.kind === value },
  size: {
    kind: 'multiple',
    label: 'Size',
    options: sizes,
    when: (values) => values.kind === 'dragon' || values.kind === 'animal',
    match: (c, value) => (value as string[]).includes(c.size),
  },
};

const CreatureList = ({ layout }: { layout: 'top' | 'side' }) => {
  const filters = useListFilters(schema);
  const query = useLocalPagedQuery(creatures.filter(filters.match), { pageSize: 12, resetKey: filters.key });
  const name = <ClearableTextField label="Name" value={filters.get('q')} onChange={(v) => filters.set('q', v ?? '')} />;
  const kind = (
    <EnumPicker
      label="Kind"
      values={kinds}
      allowAll
      value={filters.get('kind') || null}
      onChange={(id) => filters.set('kind', id)}
    />
  );
  const size = (
    <EnumPicker
      mode="multiple"
      label="Size"
      values={sizes}
      value={filters.getAll('size')}
      onChange={(ids) => filters.set('size', ids)}
    />
  );
  return (
    <ListPage
      breadcrumbs={[{ name: 'Creatures' }]}
      query={query}
      filterState={filters}
      filtersLayout={layout}
      filtersStorageKey={`stories.creatures.${layout}`}
      filters={
        layout === 'side' ? (
          <>
            <FilterSection title="Search" collapsible={false}>
              {name}
            </FilterSection>
            <FilterSection title="Kind">{kind}</FilterSection>
            <FilterSection title="Size (animals and dragons)" hidden={!filters.isActive('size')}>
              {size}
            </FilterSection>
          </>
        ) : (
          <FilterBar>
            {name}
            {kind}
          </FilterBar>
        )
      }
      collection={{ modes: ['cards'], storageKey: 'stories.creatures', cardSize: gridSizeShowcase }}
      renderItem={(creature) => (
        <EntityCard
          title={creature.name}
          subtitle={creature.kind}
          image="images/generic/npcs.png"
          metrics={[
            { label: 'Level', value: creature.level },
            { label: 'Size', value: creature.size },
          ]}
        />
      )}
    />
  );
};

const meta = {
  title: 'Templates/FilterPanel',
  component: CreatureList,
  parameters: { layout: 'fullscreen' },
  args: { layout: 'side' },
} satisfies Meta<typeof CreatureList>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ListPage with `filtersLayout="side"`: a sticky column from `lg` that can be hidden, the drawer below, filters in the
 * URL, chips and «clear». The size filter shows only for animals and dragons.
 */
export const SideLayout: Story = {};

/** The same list with the filters above the results. */
export const TopLayout: Story = { args: { layout: 'top' } };
