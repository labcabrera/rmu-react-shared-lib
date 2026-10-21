import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/render';
import RollInput, { rollD100 } from './RollInput';

const dice = (...values: number[]) => {
  const queue = [...values];
  return () => queue.shift() as number;
};

describe('rollD100', () => {
  it('returns a plain d100 when it is not open-ended', () => {
    expect(rollD100(false, dice(98, 50))).toEqual({ total: 98, rolls: [98] });
  });

  it('adds while the dice are 96-100', () => {
    expect(rollD100(true, dice(97, 99, 40))).toEqual({ total: 236, rolls: [97, 99, 40] });
  });

  it('subtracts after 01-05, also the high rolls after it', () => {
    expect(rollD100(true, dice(3, 20))).toEqual({ total: -17, rolls: [3, 20] });
    expect(rollD100(true, dice(5, 96, 10))).toEqual({ total: -101, rolls: [5, 96, 10] });
  });

  it('keeps a middle roll as it is', () => {
    expect(rollD100(true, dice(50))).toEqual({ total: 50, rolls: [50] });
  });
});

describe('RollInput', () => {
  it('generates a roll with the button and shows the dice of an open-ended one', async () => {
    const onChange = vi.fn();
    const { rerender } = renderWithProviders(
      <RollInput value={null} onChange={onChange} openEnded random={dice(98, 30)} />
    );
    await userEvent.click(screen.getByRole('button', { name: 'roll-dice' }));
    expect(onChange).toHaveBeenCalledWith(128, { total: 128, rolls: [98, 30] });
    rerender(<RollInput value={128} onChange={onChange} openEnded random={dice(98, 30)} />);
    expect(screen.getByLabelText('roll')).toHaveValue('128');
    expect(screen.getByText('roll-dice-rolls')).toBeInTheDocument();
  });

  it('takes a typed roll and limits a plain one to 1-100', () => {
    const onChange = vi.fn();
    renderWithProviders(<RollInput value={null} onChange={onChange} label="Medicine roll" />);
    const input = screen.getByLabelText('Medicine roll');
    fireEvent.change(input, { target: { value: '150' } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenLastCalledWith(100);
  });

  it('hides the button when disabled', () => {
    renderWithProviders(<RollInput value={42} onChange={vi.fn()} disabled />);
    expect(screen.queryByRole('button', { name: 'roll-dice' })).not.toBeInTheDocument();
  });
});
