import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/render';
import MagicItemDialog, { buildMagicItemRequest } from './MagicItemDialog';

// Invented catalog and prices, not taken from any book. Without i18n, t() gives the key (or the default value).
const auth = {};
vi.mock('react-oidc-context', () => ({ useAuth: () => auth }));
const quoteMagicItem = vi.fn();
const createMagicItem = vi.fn();
vi.mock('../../api/treasure.api', () => ({
  quoteMagicItem: (...args: unknown[]) => quoteMagicItem(...args),
  createMagicItem: (...args: unknown[]) => createMagicItem(...args),
}));
vi.mock('../item/ItemCatalogBrowser', () => ({
  useItemCatalog: () => ({
    items: [
      { id: 'sword', name: 'Sword', category: 'weapon', imageUrl: null },
      { id: 'ring', name: 'Ring', category: 'jewelry', imageUrl: null },
    ],
  }),
}));

beforeEach(() => {
  quoteMagicItem.mockReset().mockResolvedValue({ days: 7, itemLevel: 4, price: 32.5, breakdown: ['Line one'] });
  createMagicItem.mockReset().mockResolvedValue({ id: 'i1' });
});

const holder = { kind: 'character' as const, id: 'c1' };

describe('MagicItemDialog (spec 067)', () => {
  it('quotes the item once a base is chosen and creates it for the holder', async () => {
    const onCreated = vi.fn();
    renderWithProviders(
      <MagicItemDialog
        open
        onClose={() => {}}
        gameId="g1"
        holder={holder}
        onCreated={onCreated}
        baseItemTypeId="sword"
      />
    );
    await waitFor(() => expect(quoteMagicItem).toHaveBeenCalled(), { timeout: 2000 });
    expect(quoteMagicItem.mock.calls[0][0]).toMatchObject({ baseItemTypeId: 'sword', kind: 'weapon', bonuses: [] });
    expect(await screen.findByText('Line one')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'create' }));
    await waitFor(() => expect(onCreated).toHaveBeenCalledWith({ id: 'i1' }));
    expect(createMagicItem.mock.calls[0][0]).toMatchObject({
      baseItemTypeId: 'sword',
      gameId: 'g1',
      characterId: 'c1',
      payer: 'none',
    });
  });

  it('cannot create without a base item, and adds bonus and spell rows', async () => {
    renderWithProviders(<MagicItemDialog open onClose={() => {}} gameId="g1" holder={holder} onCreated={() => {}} />);
    expect(screen.getByRole('button', { name: 'create' })).toBeDisabled();
    expect(screen.getByText('magic-choose-base')).toBeInTheDocument();
    const [addBonus, addSpell] = screen.getAllByRole('button', { name: 'add' });
    await userEvent.click(addBonus);
    expect(screen.getByRole('combobox', { name: 'magic-bonus' })).toBeInTheDocument();
    await userEvent.click(addSpell);
    expect(screen.getByRole('textbox', { name: 'spell' })).toBeInTheDocument();
    await userEvent.click(screen.getAllByRole('button', { name: 'remove' })[0]);
    expect(screen.queryByRole('combobox', { name: 'magic-bonus' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('combobox', { name: 'magic-base-item' }));
    await userEvent.click(within(await screen.findByRole('listbox')).getByText('Ring'));
    expect(screen.getByRole('button', { name: 'create' })).toBeEnabled();
  });

  it('renders nothing when closed', () => {
    const { container } = renderWithProviders(
      <MagicItemDialog open={false} onClose={() => {}} gameId="g1" holder={holder} onCreated={() => {}} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe('buildMagicItemRequest', () => {
  it('leaves out the empty rows and keeps the standard table', () => {
    const request = buildMagicItemRequest({
      baseItemTypeId: 'sword',
      name: ' ',
      kind: 'weapon',
      itemLevel: null,
      bonuses: [
        { kind: 'ob', value: 10, target: '', against: 'undead' },
        { kind: 'db', value: null, target: '', against: '' },
      ],
      spells: [
        { name: 'Spell', level: 3, list: '', use: 'charges', perDay: 2 },
        { name: '', level: 1, list: '', use: 'daily', perDay: 1 },
      ],
      charges: 10,
      attunement: false,
      price: null,
      standardTable: 'weapon',
      standardBonus: 10,
      material: 'wood',
    });
    expect(request).toEqual({
      baseItemTypeId: 'sword',
      name: null,
      kind: 'weapon',
      itemLevel: null,
      bonuses: [{ kind: 'ob', value: 10, target: null, against: 'undead' }],
      spells: [{ name: 'Spell', level: 3, list: null, use: 'charges', perDay: null }],
      charges: 10,
      attunement: false,
      price: null,
      standard: { table: 'weapon', bonus: 10 },
    });
  });
});
