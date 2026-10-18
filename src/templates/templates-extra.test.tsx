import React from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../data/api-error';
import SelectRealm from '../selectors/SelectRealm';
import { renderWithProviders } from '../test/render';
import DetailPage from './DetailPage';
import FormPage from './FormPage';

const state = (entity: unknown, error?: unknown) => ({
  entity,
  setEntity: vi.fn(),
  loading: false,
  error,
  notFound: error instanceof ApiError && error.status === 404,
  refresh: vi.fn(),
});

describe('FormPage with an entity being edited', () => {
  it('shows not found and disables save until the entity exists', () => {
    renderWithProviders(
      <FormPage
        breadcrumbs={[]}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        entity={state(undefined, new ApiError(404, '', '', '/x'))}
      >
        form
      </FormPage>
    );
    expect(screen.queryByText('form')).not.toBeInTheDocument();
    expect(screen.getByText('not-found')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'save' })).toBeDisabled();
  });

  it('renders the form once the entity is loaded', () => {
    renderWithProviders(
      <FormPage breadcrumbs={[]} onSave={vi.fn()} onCancel={vi.fn()} entity={state({ id: '1' })}>
        form
      </FormPage>
    );
    expect(screen.getByText('form')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'save' })).toBeEnabled();
  });
});

describe('DetailPage delete message', () => {
  it('can be built from the entity', async () => {
    renderWithProviders(
      <DetailPage
        breadcrumbs={[]}
        entity={state({ id: '1', name: 'Arming sword' }) as never}
        onDelete={vi.fn()}
        deleteMessage={(item: { name: string }) => `Delete ${item.name}?`}
      >
        {() => null}
      </DetailPage>
    );
    await userEvent.click(screen.getByRole('button', { name: 'delete' }));
    expect(within(screen.getByRole('dialog')).getByText('Delete Arming sword?')).toBeInTheDocument();
  });
});

describe('SelectRealm', () => {
  it('shows the selected realm and reports clearing as null', async () => {
    const onChange = vi.fn();
    renderWithProviders(
      <SelectRealm realms={[{ id: 'kulthea', name: 'Kulthea' } as never]} value="kulthea" onChange={onChange} />
    );
    const input = screen.getByRole('combobox', { name: 'realm' });
    expect(input).toHaveValue('Kulthea');
    await userEvent.click(input);
    await userEvent.click(screen.getByTitle(/clear/i));
    expect(onChange).toHaveBeenCalledWith(null, null);
  });
});
