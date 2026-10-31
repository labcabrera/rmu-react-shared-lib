import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Npc } from '../../api/npc.dto';
import { NotificationProvider } from '../../app/NotificationProvider';
import { renderWithProviders } from '../../test/render';
import { NpcPicker } from './NpcPicker';

// Stable like the context value; invented NPCs, not taken from any book.
const auth = {};
vi.mock('react-oidc-context', () => ({ useAuth: () => auth }));
const fetchRealms = vi.fn(async () => ({ content: [{ id: 'core' }] }));
vi.mock('../../api/realm.api', () => ({ fetchGenericRealms: async () => (await fetchRealms()).content }));
const fetchNpcs = vi.fn();
vi.mock('../../api/npc.api', () => ({ fetchNpcs: (...args: unknown[]) => fetchNpcs(...args) }));

const npc = (id: string, name: string, extra: Partial<Npc> = {}) =>
  ({ id, name, category: 'animal', level: 3, group: null, source: null, imageUrl: null, ...extra }) as Npc;

const npcs = [
  npc('n1', 'Grey beast', { source: { key: 'grey-beast' } as Npc['source'] }),
  npc('n2', 'Stone guard', { category: 'artificial', level: 5 }),
  npc('n3', 'Marsh bird'),
];

describe('NpcPicker (spec 055)', () => {
  it('offers the given NPCs by translated name, grouped by category, and reports the NPC', async () => {
    const onChange = vi.fn();
    renderWithProviders(
      <NotificationProvider>
        <NpcPicker npcs={npcs} value={null} onChange={onChange} />
      </NotificationProvider>
    );
    await userEvent.click(screen.getByRole('combobox', { name: 'npc' }));
    const listbox = await screen.findByRole('listbox');
    // Without i18n, t() gives the default value: the stored name of a book creature without its `creature-<key>`.
    expect(within(listbox).getByText('Grey beast')).toBeInTheDocument();
    expect(within(listbox).getByText('npc-category-artificial')).toBeInTheDocument();
    await userEvent.type(screen.getByRole('combobox', { name: 'npc' }), 'marsh');
    expect(within(screen.getByRole('listbox')).queryByText('Stone guard')).not.toBeInTheDocument();
    await userEvent.click(screen.getByText('Marsh bird'));
    expect(onChange).toHaveBeenCalledWith('n3', npcs[2]);
    expect(fetchNpcs).not.toHaveBeenCalled();
  });

  it('loads the NPCs of the campaign realm and of the generic realms', async () => {
    fetchNpcs.mockResolvedValue({ content: npcs });
    renderWithProviders(
      <NotificationProvider>
        <NpcPicker realmId="middle-earth" value="n2" onChange={vi.fn()} />
      </NotificationProvider>
    );
    await waitFor(() => expect(screen.getByRole('combobox', { name: 'npc' })).toHaveValue('Stone guard'));
    expect(fetchNpcs).toHaveBeenCalledWith('realmId=in=(middle-earth,core)', 0, 1000, auth);
  });
});
