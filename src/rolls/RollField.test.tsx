import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/render';
import { D100, OPEN_D100, TWO_D10 } from './presets';
import RollField from './RollField';
import { RollSpec } from './roll.types';

const dice = (...values: number[]) => {
  const queue = [...values];
  return () => queue.shift() as number;
};

const setup = (spec: RollSpec, value: number | null = null, random?: () => number) => {
  const onChange = vi.fn();
  const view = renderWithProviders(
    <RollField spec={spec} value={value} onChange={onChange} label="attack-roll" presentation="popover" random={random} />
  );
  return { onChange, ...view };
};

const openPad = async () => {
  await userEvent.click(screen.getByRole('textbox', { name: 'attack-roll' }));
  return screen.findByTestId('roll-pad');
};

const press = async (pad: HTMLElement, ...keys: string[]) => {
  for (const key of keys) await userEvent.click(within(pad).getByRole('button', { name: key }));
};

describe('RollField', () => {
  it('enters an open-ended roll die by die and shows its dice', async () => {
    const { onChange, rerender } = setup(OPEN_D100);
    const pad = await openPad();
    await press(pad, '9', '7');
    expect(within(pad).getByText('roll-pad-next-die-adds')).toBeInTheDocument();
    await press(pad, '4', '5', 'confirm');
    expect(onChange).toHaveBeenCalledWith({ total: 142, rolls: [97, 45], unmodified: 97 });

    // The caller keeps only the total: the field still shows the dice of its last roll.
    rerender(<RollField spec={OPEN_D100} value={142} onChange={onChange} label="attack-roll" presentation="popover" />);
    expect(screen.getByRole('textbox', { name: 'attack-roll' })).toHaveValue('142 (97+45)');
  });

  it('keeps subtracting on a low open-ended roll', async () => {
    const { onChange } = setup(OPEN_D100);
    const pad = await openPad();
    await press(pad, '0', '3');
    expect(within(pad).getByText('roll-pad-next-die-subtracts')).toBeInTheDocument();
    await press(pad, '9', '8', '2', '0', 'confirm');
    expect(onChange).toHaveBeenCalledWith({ total: -115, rolls: [3, 98, 20], unmodified: 3 });
  });

  it('reads 00 as 100 and calls onChange only on confirm', async () => {
    const { onChange } = setup(D100);
    const pad = await openPad();
    await press(pad, '0', '0');
    expect(onChange).not.toHaveBeenCalled();
    await press(pad, 'confirm');
    expect(onChange).toHaveBeenCalledWith({ total: 100, rolls: [100], unmodified: 100 });
  });

  it('confirms a short die with the confirm key', async () => {
    const { onChange } = setup(D100);
    const pad = await openPad();
    await press(pad, '5', 'confirm');
    expect(onChange).toHaveBeenCalledWith({ total: 5, rolls: [5], unmodified: 5 });
  });

  it('sums the two dice of 2d10, with 0 as 10', async () => {
    const { onChange } = setup(TWO_D10);
    const pad = await openPad();
    await press(pad, '0', '3', 'confirm');
    expect(onChange).toHaveBeenCalledWith({ total: 13, rolls: [10, 3], unmodified: 13 });
  });

  it('takes the physical keyboard', async () => {
    const { onChange } = setup(D100);
    await openPad();
    await userEvent.keyboard('4');
    await userEvent.keyboard('{Backspace}');
    await userEvent.keyboard('45{Enter}');
    expect(onChange).toHaveBeenCalledWith({ total: 45, rolls: [45], unmodified: 45 });
  });

  it('rolls at random in the keypad and with the dice button', async () => {
    const { onChange } = setup(OPEN_D100, null, dice(97, 30, 50));
    await userEvent.click(screen.getByRole('button', { name: 'roll-dice' }));
    expect(onChange).toHaveBeenLastCalledWith({ total: 127, rolls: [97, 30], unmodified: 97 });

    const pad = await openPad();
    await press(pad, 'roll-pad-random');
    expect(within(pad).getByText('roll-pad-total')).toBeInTheDocument();
    await press(pad, 'confirm');
    expect(onChange).toHaveBeenLastCalledWith({ total: 50, rolls: [50], unmodified: 50 });
  });

  it('shows a stored total without dice and does not open when disabled', async () => {
    const onChange = vi.fn();
    renderWithProviders(<RollField spec={OPEN_D100} value={142} onChange={onChange} label="attack-roll" disabled />);
    expect(screen.getByRole('textbox', { name: 'attack-roll' })).toHaveValue('142');
    expect(screen.queryByRole('button', { name: 'roll-dice' })).not.toBeInTheDocument();
  });

  it('closes on cancel without changing the roll', async () => {
    const { onChange } = setup(D100, 45);
    const pad = await openPad();
    await press(pad, 'cancel');
    await waitFor(() => expect(screen.queryByTestId('roll-pad')).not.toBeInTheDocument());
    expect(onChange).not.toHaveBeenCalled();
  });

  it('opens as a bottom sheet', async () => {
    const onChange = vi.fn();
    renderWithProviders(<RollField spec={D100} value={null} onChange={onChange} label="attack-roll" presentation="sheet" />);
    const pad = await openPad();
    await press(pad, '4', '5', 'confirm');
    expect(onChange).toHaveBeenCalledWith({ total: 45, rolls: [45], unmodified: 45 });
  });

  it('empties an optional roll with the clear button', async () => {
    const onClear = vi.fn();
    renderWithProviders(
      <RollField spec={D100} value={45} onChange={vi.fn()} onClear={onClear} label="attack-roll" placeholder="by-server" />
    );
    await userEvent.click(screen.getByRole('button', { name: 'clear' }));
    expect(onClear).toHaveBeenCalled();
    expect(screen.queryByTestId('roll-pad')).not.toBeInTheDocument();
  });
});
