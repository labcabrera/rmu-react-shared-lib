import React from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../data/api-error';
import { rsqlAnd } from '../data/rsql';
import { EntityState } from '../data/useEntity';
import { PagedQuery } from '../data/usePagedQuery';
import { renderWithProviders } from '../test/render';
import DataTable from '../ui/DataTable';
import DetailPage from './DetailPage';
import FormPage from './FormPage';
import ListPage from './ListPage';

type Item = { id: string; name: string };

const query = (overrides: Partial<PagedQuery<Item>> = {}): PagedQuery<Item> => ({
  items: [
    { id: '1', name: 'Arming sword' },
    { id: '2', name: 'Broadsword' },
  ],
  page: 0,
  pageSize: 24,
  totalPages: 3,
  totalElements: 50,
  loading: false,
  error: undefined,
  setPage: vi.fn(),
  setPageSize: vi.fn(),
  refresh: vi.fn(),
  ...overrides,
});

const entityState = (overrides: Partial<EntityState<Item>> = {}): EntityState<Item> => ({
  entity: { id: '1', name: 'Arming sword' },
  setEntity: vi.fn(),
  loading: false,
  error: undefined,
  notFound: false,
  refresh: vi.fn(),
  ...overrides,
});

describe('ListPage', () => {
  const renderList = (q: PagedQuery<Item>, onAdd = vi.fn()) =>
    renderWithProviders(
      <ListPage
        breadcrumbs={[{ name: 'Items' }]}
        query={q}
        onAdd={onAdd}
        renderItem={(item) => <span>{item.name}</span>}
      />
    );

  it('renders the items, the pagination and the header actions', async () => {
    const q = query();
    const onAdd = vi.fn();
    renderList(q, onAdd);
    expect(screen.getByText('Broadsword')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'refresh' }));
    await userEvent.click(screen.getByRole('button', { name: 'add' }));
    expect(q.refresh).toHaveBeenCalled();
    expect(onAdd).toHaveBeenCalled();
  });

  it('shows the empty, loading and error states', () => {
    const { unmount } = renderList(query({ items: [] }));
    expect(screen.getByText('no-results')).toBeInTheDocument();
    unmount();
    const loading = renderList(query({ items: undefined }));
    expect(screen.getByLabelText('loading')).toBeInTheDocument();
    loading.unmount();
    renderList(query({ items: undefined, error: new ApiError(500, '', '', '/x') }));
    expect(screen.getByRole('alert')).toHaveTextContent('error-server');
  });
});

describe('DetailPage', () => {
  it('renders the entity and confirms before deleting', async () => {
    const onDelete = vi.fn();
    renderWithProviders(
      <DetailPage breadcrumbs={[{ name: 'Items' }]} entity={entityState()} onDelete={onDelete} onEdit={vi.fn()}>
        {(item) => <h1>{item.name}</h1>}
      </DetailPage>
    );
    expect(screen.getByRole('heading', { name: 'Arming sword' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'delete' }));
    expect(onDelete).not.toHaveBeenCalled();
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'delete' }));
    expect(onDelete).toHaveBeenCalledWith({ id: '1', name: 'Arming sword' });
  });

  it('shows not found for a 404', () => {
    renderWithProviders(
      <DetailPage breadcrumbs={[]} entity={entityState({ entity: undefined, notFound: true })}>
        {() => null}
      </DetailPage>
    );
    expect(screen.getByText('not-found')).toBeInTheDocument();
  });
});

describe('FormPage', () => {
  it('cancels directly when there are no changes and asks first when dirty', async () => {
    const onCancel = vi.fn();
    const { rerender } = renderWithProviders(
      <FormPage breadcrumbs={[]} onSave={vi.fn()} onCancel={onCancel}>
        form
      </FormPage>
    );
    await userEvent.click(screen.getByRole('button', { name: 'cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);

    rerender(
      <FormPage breadcrumbs={[]} onSave={vi.fn()} onCancel={onCancel} dirty saveDisabled>
        form
      </FormPage>
    );
    expect(screen.getByRole('button', { name: 'save' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole('button', { name: 'discard' }));
    expect(onCancel).toHaveBeenCalledTimes(2);
  });
});

describe('generic components', () => {
  it('rsqlAnd joins the non-empty conditions', () => {
    expect(
      rsqlAnd([
        ['name=re=', 'sword'],
        ['category==', ''],
        ['realmId==', undefined],
        ['info.rarity==', 'common'],
      ])
    ).toBe('name=re=sword;info.rarity==common');
    expect(rsqlAnd([['name=re=', null]])).toBe('');
  });

  it('DataTable renders a table with the columns', () => {
    renderWithProviders(
      <DataTable
        rows={[{ id: '1', name: 'Arming sword' }]}
        getKey={(row) => row.id}
        columns={[{ key: 'name', header: 'Name', render: (row) => row.name }]}
      />
    );
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Arming sword' })).toBeInTheDocument();
  });
});
