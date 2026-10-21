import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/render';
import OpenEndedRollInput, { computeOpenEndedResult } from './OpenEndedRollInput';

const typeAndBlur = (input: HTMLElement, text: string) => {
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: text } });
  fireEvent.blur(input);
};

describe('computeOpenEndedResult', () => {
  it.each([
    [[50], 50],
    [[97, 40], 137],
    [[97, 98, 3], 198],
    [[3, 40], -37],
    [[3, 97, 10], -104],
  ])('resolves %j to %d', (rolls, expected) => {
    expect(computeOpenEndedResult(rolls)).toBe(expected);
  });

  it.each([[[null]], [[97, null]], [[97, 98]], [[3, null]]])('waits for more dice in %j', (rolls) => {
    expect(computeOpenEndedResult(rolls)).toBeUndefined();
  });
});

describe('OpenEndedRollInput', () => {
  it('reports the result once, on blur', () => {
    const onChange = vi.fn();
    renderWithProviders(<OpenEndedRollInput onChange={onChange} />);
    const input = screen.getByRole('textbox');

    typeAndBlur(input, '80');
    fireEvent.focus(input);
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(80, { unmodified: 80, rolls: [80] });
  });

  it('commits a field on Enter', () => {
    const onChange = vi.fn();
    renderWithProviders(<OpenEndedRollInput onChange={onChange} />);
    const input = screen.getByRole('textbox');

    input.focus();
    fireEvent.change(input, { target: { value: '42' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(42, { unmodified: 42, rolls: [42] });
  });

  it('asks for another die on an open-ended roll', () => {
    const onChange = vi.fn();
    renderWithProviders(<OpenEndedRollInput onChange={onChange} />);

    typeAndBlur(screen.getByRole('textbox'), '98');
    expect(onChange).not.toHaveBeenCalled();
    typeAndBlur(screen.getAllByRole('textbox')[1], '20');

    expect(onChange).toHaveBeenCalledWith(118, { unmodified: 98, rolls: [98, 20] });
  });

  it('reports the first die as the unmodified roll', () => {
    const onChange = vi.fn();
    renderWithProviders(<OpenEndedRollInput onChange={onChange} />);

    typeAndBlur(screen.getByRole('textbox'), '66');

    expect(onChange).toHaveBeenCalledWith(66, { unmodified: 66, rolls: [66] });
  });

  it('reports the dice of a negative open-ended roll', () => {
    const onChange = vi.fn();
    renderWithProviders(<OpenEndedRollInput onChange={onChange} />);

    typeAndBlur(screen.getByRole('textbox'), '3');
    typeAndBlur(screen.getAllByRole('textbox')[1], '40');

    expect(onChange).toHaveBeenCalledWith(-37, { unmodified: 3, rolls: [3, 40] });
  });

  it('shows a stored roll without reporting it again', () => {
    const onChange = vi.fn();
    renderWithProviders(<OpenEndedRollInput value={55} onChange={onChange} />);

    expect(screen.getByRole('textbox')).toHaveValue('55');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows a stored open-ended roll as a caption', () => {
    renderWithProviders(<OpenEndedRollInput value={130} onChange={vi.fn()} />);

    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(screen.getByText(/130/)).toBeInTheDocument();
  });

  it('uses the label prop for the first field', () => {
    renderWithProviders(<OpenEndedRollInput label="Attack roll" onChange={vi.fn()} />);

    expect(screen.getByLabelText('Attack roll')).toBeInTheDocument();
  });
});
