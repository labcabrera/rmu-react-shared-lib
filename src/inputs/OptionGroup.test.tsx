import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/render';
import OptionGroup, { optionCellWidth } from './OptionGroup';

const PACE = [
  { key: 'normal', label: 'Normal', value: 0 },
  { key: 'press', label: 'Press', value: 10 },
  { key: 'reckless', label: 'Reckless', value: -10 },
];

describe('OptionGroup (spec 085)', () => {
  it('shows an exclusive group as radios with their values, the neutral 0 included', () => {
    const onChange = vi.fn();
    renderWithProviders(<OptionGroup label="Pace" options={PACE} value="normal" onChange={onChange} />);
    expect(screen.getByRole('radiogroup', { name: 'Pace' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Normal/ })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('+10')).toBeInTheDocument();
    expect(screen.getByText('-10')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: /Press/ }));
    expect(onChange).toHaveBeenCalledWith('press');
  });

  it('does not report the choice already selected', () => {
    const onChange = vi.fn();
    renderWithProviders(<OptionGroup options={PACE} value="normal" onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: /Normal/ }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('reports the selected choice again with reselect, so that it can be cleared', () => {
    const onChange = vi.fn();
    renderWithProviders(<OptionGroup options={PACE} value="normal" onChange={onChange} reselect />);
    fireEvent.click(screen.getByRole('radio', { name: /Normal/ }));
    expect(onChange).toHaveBeenCalledWith('normal');
  });

  it('toggles the options of a multiple group one by one', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <OptionGroup
        multiple
        label="Target"
        options={[
          { key: 'stunned', label: 'Stunned', value: 20 },
          { key: 'prone', label: 'Prone', value: 30 },
        ]}
        value={['stunned']}
        onChange={onChange}
      />
    );
    expect(screen.getByRole('group', { name: 'Target' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Stunned/ })).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(screen.getByRole('checkbox', { name: /Prone/ }));
    expect(onChange).toHaveBeenCalledWith(['stunned', 'prone']);
    fireEvent.click(screen.getByRole('checkbox', { name: /Stunned/ }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('shows no badge for options without a value', () => {
    renderWithProviders(
      <OptionGroup multiple options={[{ key: 'ambush', label: 'Ambush' }]} value={[]} onChange={() => {}} />
    );
    expect(screen.getByRole('checkbox', { name: 'Ambush' })).toBeInTheDocument();
  });

  it('gives every option the width of the longest one', () => {
    const short = optionCellWidth([{ key: 'a', label: 'A', value: 0 }]);
    const long = optionCellWidth([
      { key: 'a', label: 'A', value: 0 },
      { key: 'b', label: 'A much longer option', value: -100 },
    ]);
    expect(long).toBeGreaterThan(short);
  });
});
