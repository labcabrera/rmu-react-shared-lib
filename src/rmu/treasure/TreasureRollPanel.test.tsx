import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TreasureRoll, TreasureRollRequest } from '../../api/treasure.dto';
import { rollTreasure } from '../../api/treasure.api';
import { renderWithProviders } from '../../test/render';
import TreasureRollPanel from './TreasureRollPanel';

vi.mock('react-oidc-context', () => ({ useAuth: () => ({}) }));
vi.mock('../../api/treasure.api', () => ({ rollTreasure: vi.fn(), awardTreasure: vi.fn() }));

const codes = { wealth: [], lifestyle: [], magic: [] };
const die = (table: string, min = 1, max = 100) => ({ table, min, max, modifier: 0 });
const done: TreasureRoll = { codes, warnings: [], lines: [{ kind: 'gold', gold: 7, dice: [] }] };
const roll = vi.mocked(rollTreasure);
const sent = () => roll.mock.calls.map(([request]) => (request as TreasureRollRequest).dice);

/** The API of the test: asks for the given dice in order, then answers the treasure. */
const answerDice = (...asked: ReturnType<typeof die>[]) =>
  roll.mockImplementation(async (request) => {
    const next = asked[request.dice?.length ?? 0];
    return next ? { ...done, lines: [], pending: next } : done;
  });

describe('TreasureRollPanel (workspace spec 094)', () => {
  beforeEach(() => {
    roll.mockReset();
  });

  it('rolls every die in the browser and sends them all each time', async () => {
    answerDice(die('7-1f'), die('price', 10, 20));
    renderWithProviders(<TreasureRollPanel codes="n" />);
    await userEvent.click(screen.getByRole('button', { name: 'treasure-roll-all' }));
    await screen.findByText('treasure-result');
    const dice = sent();
    expect(dice).toHaveLength(3);
    expect(dice[0]).toEqual([]);
    expect(dice[1]).toHaveLength(1);
    expect(dice[2]?.[0]).toBe(dice[1]?.[0]);
    expect(dice[2]?.[1]).toBeGreaterThanOrEqual(10);
    expect(dice[2]?.[1]).toBeLessThanOrEqual(20);
  });

  it('asks for a die at a time, undoes the last one and tells which table is being rolled', async () => {
    answerDice(die('7-1f'), die('7-1g'));
    const onTableFocus = vi.fn();
    renderWithProviders(<TreasureRollPanel codes="n" onTableFocus={onTableFocus} />);
    await userEvent.click(screen.getByRole('button', { name: 'treasure-enter-dice' }));
    await waitFor(() => expect(onTableFocus).toHaveBeenCalledWith({ table: '7-1f', roll: null, modifier: 0 }));
    expect(screen.queryByText('treasure-result')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'treasure-roll-rest' }));
    await screen.findByText('treasure-result');
    expect(sent().at(-1)).toHaveLength(2);
  });

  it('goes back one die with undo', async () => {
    answerDice(die('7-1f'), die('7-1g'), die('7-1h'));
    renderWithProviders(<TreasureRollPanel codes="n" />);
    await userEvent.click(screen.getByRole('button', { name: 'treasure-enter-dice' }));
    const undo = await screen.findByRole('button', { name: 'treasure-undo-die' });
    expect(undo).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'roll-dice' }));
    await waitFor(() => expect(sent()).toHaveLength(2));
    await waitFor(() => expect(screen.getByRole('button', { name: 'treasure-undo-die' })).toBeEnabled());
    await userEvent.click(screen.getByRole('button', { name: 'treasure-undo-die' }));
    await waitFor(() => expect(sent().at(-1)).toEqual([]));
  });

  it('shows no award when the treasure is only looked at', async () => {
    answerDice();
    renderWithProviders(<TreasureRollPanel codes="n" readOnly />);
    await userEvent.click(screen.getByRole('button', { name: 'treasure-roll-all' }));
    await screen.findByText('treasure-result');
    expect(screen.queryByRole('button', { name: 'treasure-award' })).not.toBeInTheDocument();
  });

  it('shows the error of the API', async () => {
    roll.mockRejectedValue(new Error('boom'));
    renderWithProviders(<TreasureRollPanel codes="n" />);
    await userEvent.click(screen.getByRole('button', { name: 'treasure-roll-all' }));
    expect(await screen.findByText('boom')).toBeInTheDocument();
  });
});
