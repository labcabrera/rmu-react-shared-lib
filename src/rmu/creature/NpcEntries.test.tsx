import React from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Npc } from '../../api/npc.dto';
import { NotificationProvider } from '../../app/NotificationProvider';
import { renderWithProviders } from '../../test/render';
import { NpcEntryDialog, NpcEntryList } from './NpcEntries';

vi.mock('react-oidc-context', () => ({ useAuth: () => ({}) }));

// Invented NPCs, not taken from any book.
const npcs = [
  { id: 'n1', name: 'Grey beast', category: 'animal', level: 3, group: null, source: null, imageUrl: null },
  { id: 'n2', name: 'Stone guard', category: 'artificial', level: 5, group: null, source: null, imageUrl: null },
] as unknown as Npc[];

const renderDialog = (props: Partial<React.ComponentProps<typeof NpcEntryDialog>> = {}) => {
  const onSave = vi.fn();
  renderWithProviders(
    <NotificationProvider>
      <NpcEntryDialog open title="Add" npcs={npcs} withNotes onSave={onSave} onClose={vi.fn()} {...props} />
    </NotificationProvider>
  );
  return onSave;
};

describe('NPC entries (spec 055)', () => {
  it('takes the name of the NPC as alias until one is written', async () => {
    const onSave = renderDialog();
    const confirm = screen.getByRole('button', { name: 'confirm' });
    expect(confirm).toBeDisabled();
    await userEvent.click(screen.getByRole('combobox', { name: /npc/ }));
    await userEvent.click(within(await screen.findByRole('listbox')).getByText('Stone guard'));
    expect(screen.getByRole('textbox', { name: 'npc-alias' })).toHaveValue('Stone guard');
    await userEvent.clear(screen.getByRole('textbox', { name: 'npc-count' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'npc-count' }), '3');
    await userEvent.type(screen.getByRole('textbox', { name: 'notes' }), 'At the gate');
    await userEvent.click(confirm);
    expect(onSave).toHaveBeenCalledWith({ npcId: 'n2', name: 'Stone guard', count: 3, notes: 'At the gate' });
  });

  it('keeps the specimens between 1 and 50', async () => {
    const onSave = renderDialog({ entry: { npcId: 'n1', name: 'Pack', count: 2 } });
    await userEvent.clear(screen.getByRole('textbox', { name: 'npc-count' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'npc-count' }), '75');
    await userEvent.click(screen.getByRole('button', { name: 'confirm' }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'Pack', count: 50 }));
  });

  it('lists the entries with the NPC name under an alias and their buttons', async () => {
    const onRemove = vi.fn();
    renderWithProviders(
      <NpcEntryList
        npcs={npcs}
        entries={[{ npcId: 'n2', name: 'Gate guards', count: 4, notes: 'Night shift' }]}
        onEdit={vi.fn()}
        onRemove={onRemove}
      />
    );
    const item = screen.getByRole('listitem');
    expect(within(item).getByText('Gate guards')).toBeInTheDocument();
    expect(within(item).getByText(/Stone guard/)).toBeInTheDocument();
    expect(within(item).getByText('Night shift')).toBeInTheDocument();
    await userEvent.click(within(item).getByRole('button', { name: 'delete' }));
    expect(onRemove).toHaveBeenCalledWith(0);
  });
});
