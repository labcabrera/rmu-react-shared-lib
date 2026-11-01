import React from 'react';
import type { AuthContextProps } from 'react-oidc-context';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { EntityType } from '../../api/common.dto';
import { renderWithProviders } from '../../test/render';
import EntitySourceChip from './EntitySourceChip';
import EntitySourceField from './EntitySourceField';
import { entitySourceFilter, entitySourceOf } from './entity-source';

let auth = {} as AuthContextProps;
vi.mock('react-oidc-context', () => ({ useAuth: () => auth }));

const authWith = (groups: string[]) => ({ user: { profile: { sub: 'u1', groups } } }) as unknown as AuthContextProps;
const t = (key: string) => key;

describe('entity source', () => {
  it('counts a missing source as user', () => {
    expect(entitySourceOf({ entitySource: 'system' })).toBe('system');
    expect(entitySourceOf({})).toBe('user');
    expect(entitySourceOf({ entitySource: null })).toBe('user');
    expect(entitySourceOf(undefined)).toBe('user');
  });

  it('filters by source on the client and as RSQL', () => {
    const filter = entitySourceFilter<{ entitySource?: EntityType }>(t);
    expect(filter.kind).toBe('single');
    expect(filter.options).toEqual(['system', 'user']);
    expect(filter.label).toBe('entity-source');
    expect(filter.format!('system')).toBe('entity-source-system');
    expect(filter.match!({ entitySource: 'system' }, 'system')).toBe(true);
    expect(filter.match!({ entitySource: 'user' }, 'system')).toBe(false);
    expect(filter.match!({}, 'user')).toBe(true);
    expect(filter.match!({}, 'system')).toBe(false);
    expect(filter.toRsql!('system')).toBe('entitySource==system');
    expect(filter.toRsql!('user')).toBe('entitySource!=system');
  });

  it('shows the chip only for rulebook entities', () => {
    const { rerender } = renderWithProviders(<EntitySourceChip entity={{ entitySource: 'system' }} />);
    expect(screen.getByTestId('entity-source-chip')).toHaveTextContent('entity-source-system');
    rerender(<EntitySourceChip entity={{ entitySource: 'user' }} />);
    expect(screen.queryByTestId('entity-source-chip')).toBeNull();
    rerender(<EntitySourceChip entity={undefined} />);
    expect(screen.queryByTestId('entity-source-chip')).toBeNull();
  });

  it('renders the source field only for admins', async () => {
    auth = authWith(['rmu-user']);
    const { container, rerender } = renderWithProviders(<EntitySourceField value="user" onChange={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();

    auth = authWith(['rmu-admin']);
    const onChange = vi.fn();
    rerender(<EntitySourceField value={undefined} onChange={onChange} />);
    const select = screen.getByRole('combobox', { name: 'entity-source' });
    expect(select).toHaveValue('entity-source-user');
    await userEvent.click(select);
    await userEvent.click(screen.getByRole('option', { name: /entity-source-system/ }));
    expect(onChange).toHaveBeenCalledWith('system');
  });
});
