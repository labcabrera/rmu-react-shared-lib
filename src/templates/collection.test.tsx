import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import EntityCard from '../cards/EntityCard';
import { PagedQuery } from '../data/usePagedQuery';
import { renderWithProviders } from '../test/render';
import PreviewDrawer from '../ui/PreviewDrawer';
import ListPage from './ListPage';

type Skill = { id: string; category: string };

const skills: Skill[] = [
  { id: 'climbing', category: 'athletic' },
  { id: 'swimming', category: 'athletic' },
  { id: 'perception', category: 'awareness' },
];

const query: PagedQuery<Skill> = {
  items: skills,
  page: 0,
  pageSize: 24,
  totalPages: 1,
  totalElements: 3,
  loading: false,
  error: undefined,
  setPage: vi.fn(),
  setPageSize: vi.fn(),
  refresh: vi.fn(),
};

const renderList = (onSelect = vi.fn()) =>
  renderWithProviders(
    <ListPage
      breadcrumbs={[{ name: 'skills' }]}
      query={query}
      renderItem={(skill) => <span>card {skill.id}</span>}
      collection={{
        modes: ['cards', 'table', 'grouped'],
        storageKey: 'test.skills',
        columns: [
          { key: 'name', header: 'name', render: (skill) => skill.id },
          { key: 'category', header: 'category', render: (skill) => skill.category },
        ],
        groupBy: (skill) => skill.category,
        onSelect,
      }}
    />
  );

describe('ListPage collection views', () => {
  afterEach(() => localStorage.clear());

  it('starts with the first view and switches to a table with clickable rows', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderList(onSelect);
    expect(screen.getByText('card climbing')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'view-table' }));
    expect(screen.getByRole('columnheader', { name: 'category' })).toBeInTheDocument();
    await user.click(screen.getByText('perception'));
    expect(onSelect).toHaveBeenCalledWith(skills[2]);
  });

  it('groups rows and remembers the chosen view', async () => {
    const user = userEvent.setup();
    const { unmount } = renderList();
    await user.click(screen.getByRole('button', { name: 'view-grouped' }));
    expect(screen.getByText('athletic', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getAllByRole('table')).toHaveLength(2);
    unmount();
    renderList();
    expect(screen.getAllByRole('table')).toHaveLength(2);
  });
});

describe('EntityCard', () => {
  it('shows title, metrics and reacts to clicks', async () => {
    const onClick = vi.fn();
    renderWithProviders(
      <EntityCard title="Channeling" subtitle="Realm" metrics={[{ label: 'skills', value: 12 }]} onClick={onClick} />
    );
    expect(screen.getByRole('heading', { name: 'Channeling' })).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('renders an image by default and none with noImage', () => {
    const { container, rerender } = renderWithProviders(<EntityCard title="Climbing" image="images/climb.png" />);
    expect(container.querySelector('img')).not.toBeNull();
    rerender(<EntityCard title="Climbing" image="images/climb.png" noImage locked lockedLabel="private" />);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByLabelText('private')).toBeInTheDocument();
  });

  it('clamps the description to the given lines', () => {
    renderWithProviders(<EntityCard title="Campaign" description="A long story" descriptionLines={3} />);
    expect(screen.getByText('A long story')).toHaveStyle({ WebkitLineClamp: '3' });
  });
});

describe('PreviewDrawer', () => {
  it('shows the item and opens the full page', async () => {
    const onOpen = vi.fn();
    renderWithProviders(
      <PreviewDrawer open title="Climbing" onClose={vi.fn()} onOpen={onOpen}>
        <span>details</span>
      </PreviewDrawer>
    );
    expect(screen.getByText('details')).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'open' }));
    expect(onOpen).toHaveBeenCalled();
  });
});
