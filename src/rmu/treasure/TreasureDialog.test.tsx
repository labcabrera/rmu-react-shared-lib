import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TreasureRoll } from '../../api/treasure.dto';
import { renderWithProviders } from '../../test/render';
import TreasureDialog from './TreasureDialog';

// Invented lines and dice, not taken from any book. Without i18n, t() gives the key (or the default value).
const auth = {};
vi.mock('react-oidc-context', () => ({ useAuth: () => auth }));
const rollTreasure = vi.fn();
const awardTreasure = vi.fn();
vi.mock('../../api/treasure.api', () => ({
  rollTreasure: (...args: unknown[]) => rollTreasure(...args),
  awardTreasure: (...args: unknown[]) => awardTreasure(...args),
}));

const roll: TreasureRoll = {
  codes: { wealth: ['normal'], lifestyle: ['poor'], magic: ['rich'] },
  lines: [
    { kind: 'gold', gold: 12, dice: [{ table: '7-1b', roll: 40, modifier: 0, total: 40, result: 'one roll' }] },
    {
      kind: 'item',
      itemTypeId: 'gem-a',
      name: 'Gem A',
      amount: 1,
      value: 8,
      carats: 1.5,
      dice: [{ table: '2-4e', roll: 77, modifier: 0, total: 77, result: 'gem-a' }],
    },
    {
      kind: 'item',
      itemTypeId: 'sword',
      name: 'Magic sword',
      amount: 1,
      value: 100,
      magic: { baseItemTypeId: 'sword', kind: 'weapon', itemLevel: 5, bonuses: [{ kind: 'ob', value: 5 }], spells: [] },
      dice: [],
    },
    { kind: 'note', text: 'Lifestyle note', dice: [] },
  ],
  warnings: ['A warning'],
};

beforeEach(() => {
  rollTreasure.mockReset().mockResolvedValue(roll);
  awardTreasure.mockReset().mockResolvedValue({ items: [], gold: 12 });
});

describe('TreasureDialog (spec 067)', () => {
  it('rolls the codes and shows the lines, the warnings and the dice', async () => {
    renderWithProviders(<TreasureDialog open onClose={() => {}} codes="c, n, x" gameId="g1" />);
    expect(screen.getByRole('textbox', { name: 'treasure-codes' })).toHaveValue('c, n, x');
    await userEvent.click(screen.getByRole('button', { name: 'treasure-roll-all' }));
    expect(rollTreasure).toHaveBeenCalledWith({ codes: 'c, n, x', wealthModifier: 0, gameId: 'g1', dice: [] }, auth);
    expect(await screen.findByText('A warning')).toBeInTheDocument();
    expect(screen.getByText('Gem A')).toBeInTheDocument();
    expect(screen.getByText('Lifestyle note')).toBeInTheDocument();
    expect(screen.getByText('magic-kind-weapon · magic-item-level-value · magic-bonus-ob +5')).toBeInTheDocument();
    // Gold, gem and sword can be awarded; the note cannot.
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
    await userEvent.click(screen.getAllByRole('button', { name: 'treasure-dice' })[0]);
    expect(await screen.findByText('7-1b')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'treasure-reroll' })).toBeInTheDocument();
  });

  it('keeps Award disabled without a holder and says so', async () => {
    renderWithProviders(<TreasureDialog open onClose={() => {}} codes="c" gameId="g1" />);
    await userEvent.click(screen.getByRole('button', { name: 'treasure-roll-all' }));
    await screen.findByText('Gem A');
    expect(screen.getByRole('button', { name: 'treasure-award' })).toBeDisabled();
    expect(screen.getByText('treasure-holder-required')).toBeInTheDocument();
  });

  it('awards the selected lines to the holder', async () => {
    const onAwarded = vi.fn();
    const onClose = vi.fn();
    const holder = { kind: 'faction' as const, id: 'f1' };
    renderWithProviders(
      <TreasureDialog open onClose={onClose} codes="c" gameId="g1" holder={holder} onAwarded={onAwarded} />
    );
    await userEvent.click(screen.getByRole('button', { name: 'treasure-roll-all' }));
    await screen.findByText('Gem A');
    // Leave the gem out.
    await userEvent.click(screen.getAllByRole('checkbox')[1]);
    await userEvent.click(screen.getByRole('button', { name: 'treasure-award' }));
    await waitFor(() => expect(onAwarded).toHaveBeenCalledWith({ items: [], gold: 12 }));
    const sent = awardTreasure.mock.calls[0][0];
    expect(sent.gameId).toBe('g1');
    expect(sent.holder).toEqual(holder);
    expect(sent.lines.map((line: { kind: string }) => line.kind)).toEqual(['gold', 'item']);
    expect(onClose).toHaveBeenCalled();
  });

  it('sends explicit qualities and needs some input to roll', async () => {
    renderWithProviders(<TreasureDialog open onClose={() => {}} />);
    expect(screen.getByRole('button', { name: 'treasure-roll-all' })).toBeDisabled();
    await userEvent.click(screen.getByRole('combobox', { name: 'treasure-magic' }));
    await userEvent.click(within(await screen.findByRole('listbox')).getByText('treasure-quality-rich'));
    await userEvent.click(screen.getByRole('button', { name: 'treasure-roll-all' }));
    expect(rollTreasure).toHaveBeenCalledWith({ codes: null, magic: ['rich'], wealthModifier: 0, gameId: null, dice: [] }, auth);
  });

  it('shows the error of the roll', async () => {
    rollTreasure.mockRejectedValue(new Error('boom'));
    renderWithProviders(<TreasureDialog open onClose={() => {}} codes="c" />);
    await userEvent.click(screen.getByRole('button', { name: 'treasure-roll-all' }));
    expect(await screen.findByText('boom')).toBeInTheDocument();
  });
});
