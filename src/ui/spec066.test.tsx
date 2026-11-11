import React, { useState } from 'react';
import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import DeleteDialog from '../dialogs/DeleteDialog';
import RmuDialog from '../dialogs/RmuDialog';
import { keyValueColor, KeyValueList } from '../display/KeyValuePanel';
import NumberPad, { outOfRange, parsePadText } from '../inputs/NumberPad';
import NumberPadField from '../inputs/NumberPadField';
import Panel from '../layouts/Panel';
import SearchField from '../templates/SearchField';
import { renderWithProviders } from '../test/render';
import DataTable from './DataTable';
import OptionsHelpDialog, { OptionsHelpButton } from './OptionsHelpDialog';
import SelectableCard from './SelectableCard';
import EmptyState from './states/EmptyState';

// Without an i18n instance, t() returns the key: labels below are translation keys.

const display = () => screen.getByTestId('number-pad-display').textContent?.trim();
const key = (name: string) => userEvent.click(screen.getByRole('button', { name }));

describe('NumberPad (spec 066)', () => {
  it('replaces the starting value with the first key and accepts the typed number', async () => {
    const onConfirm = vi.fn();
    renderWithProviders(<NumberPad value={12} integer onConfirm={onConfirm} onCancel={vi.fn()} />);
    expect(display()).toBe('12');
    await key('4');
    await key('2');
    expect(display()).toBe('42');
    await key('accept');
    expect(onConfirm).toHaveBeenCalledWith(42);
  });

  it('toggles the sign, adds the steps and clears', async () => {
    const onConfirm = vi.fn();
    renderWithProviders(<NumberPad value={3} integer onConfirm={onConfirm} onCancel={vi.fn()} />);
    await key('+5');
    expect(display()).toBe('8');
    await key('number-pad-sign');
    expect(display()).toBe('-8');
    await key('number-pad-backspace');
    expect(display()).toBe('-');
    await key('clear');
    await key('accept');
    expect(onConfirm).toHaveBeenCalledWith(null);
  });

  it('flags a value out of range and does not accept it', async () => {
    const onConfirm = vi.fn();
    renderWithProviders(<NumberPad value={null} min={0} max={20} integer onConfirm={onConfirm} onCancel={vi.fn()} />);
    expect(screen.getByText('number-pad-range')).toBeInTheDocument();
    await key('3');
    await key('5');
    expect(screen.getByRole('button', { name: 'accept' })).toBeDisabled();
    // Without negatives below a min of 0, the sign key is off and the steps stop at the bound.
    expect(screen.getByRole('button', { name: 'number-pad-sign' })).toBeDisabled();
    await key('-5');
    expect(display()).toBe('20');
  });

  it('takes decimals and the physical keyboard', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    renderWithProviders(<NumberPad value={null} onConfirm={onConfirm} onCancel={onCancel} />);
    const group = screen.getByRole('group');
    for (const k of ['1', ',', '5']) fireEvent.keyDown(group, { key: k });
    expect(display()).toBe('1.5');
    fireEvent.keyDown(group, { key: '-' });
    fireEvent.keyDown(group, { key: 'Enter' });
    expect(onConfirm).toHaveBeenCalledWith(-1.5);
    fireEvent.keyDown(group, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalled();
  });

  it('parses the display text and checks the bounds', () => {
    expect(parsePadText('-')).toBeNull();
    expect(parsePadText('0.')).toBe(0);
    expect(parsePadText('-12')).toBe(-12);
    expect(outOfRange(5, 0, 4)).toBe(true);
    expect(outOfRange(null, 0, 4)).toBe(false);
  });
});

describe('NumberPadField (spec 066)', () => {
  it('opens the keypad in a dialog and reports the new value', async () => {
    const Harness = () => {
      const [value, setValue] = useState<number | null>(2);
      return <NumberPadField label="bonus" value={value} onChange={setValue} integer presentation="dialog" signed />;
    };
    renderWithProviders(<Harness />);
    const field = screen.getByRole('textbox', { name: 'bonus' });
    expect(field).toHaveValue('+2');
    expect(field).toHaveAttribute('inputmode', 'none');
    await userEvent.click(field);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await key('7');
    await key('accept');
    expect(field).toHaveValue('+7');
  });

  it('does not open when disabled', async () => {
    renderWithProviders(<NumberPadField label="x" value={1} onChange={vi.fn()} disabled presentation="dialog" />);
    await userEvent.click(screen.getByRole('textbox', { name: 'x' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('OptionsHelpDialog (spec 066)', () => {
  const options = [
    { key: 'a', label: 'Option A', value: '×2', defaultValue: 1, description: 'What A does' },
    { key: 'b', label: 'Option B', description: 'What B does' },
  ];

  it('lists every option with its value, default and explanation', () => {
    renderWithProviders(<OptionsHelpDialog open title="Settings" options={options} onClose={vi.fn()} />);
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('What B does')).toBeInTheDocument();
    expect(screen.getByText('×2')).toBeInTheDocument();
    expect(screen.getByText('options-help-default: 1')).toBeInTheDocument();
  });

  it('opens from its button', async () => {
    renderWithProviders(<OptionsHelpButton title="Settings" options={options} />);
    await userEvent.click(screen.getByRole('button', { name: 'options-help' }));
    expect(await screen.findByText('What A does')).toBeInTheDocument();
  });
});

describe('Panel, KeyValueList and EmptyState variants (spec 066)', () => {
  it('colours penalties: red below zero, dimmed at zero', () => {
    expect(keyValueColor(-5, 'penalty')).toBe('error.main');
    expect(keyValueColor(0, 'penalty')).toBe('text.disabled');
    expect(keyValueColor(3, 'penalty')).toBe('text.primary');
    expect(keyValueColor('x', 'danger')).toBe('error.main');
    renderWithProviders(<KeyValueList dense rows={[{ label: 'Ranged', value: -5, tone: 'penalty' }]} />);
    expect(screen.getByText('-5')).toBeInTheDocument();
  });

  it('renders an outlined panel without title', () => {
    renderWithProviders(
      <Panel variant="outlined" dense>
        <span>content</span>
      </Panel>
    );
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('shows the dense empty state as a status line', () => {
    renderWithProviders(<EmptyState dense title="nothing" />);
    expect(screen.getByRole('status')).toHaveTextContent('nothing');
  });
});

describe('DataTable empty and paging (spec 066)', () => {
  const columns = [{ key: 'name', header: 'name', render: (row: { id: string }) => row.id }];

  it('shows the empty title instead of an empty table', () => {
    renderWithProviders(<DataTable columns={columns} rows={[]} getKey={(row) => row.id} emptyTitle="no rows" />);
    expect(screen.getByText('no rows')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('pages under the table', async () => {
    const onPageChange = vi.fn();
    renderWithProviders(
      <DataTable
        columns={columns}
        rows={[{ id: 'a' }]}
        getKey={(row) => row.id}
        cardsOnMobile={false}
        pagination={{ page: 0, totalPages: 3, onPageChange }}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /page 2/i }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});

describe('DeleteDialog, SelectableCard and SearchField (spec 066)', () => {
  it('confirms a delete through ConfirmDialog', async () => {
    const onDelete = vi.fn();
    renderWithProviders(<DeleteDialog open message="sure?" onDelete={onDelete} onClose={vi.fn()} />);
    expect(screen.getByText('delete-confirmation')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'delete' }));
    expect(onDelete).toHaveBeenCalled();
  });

  it('selects a card with the keyboard and tells its state', () => {
    const onClick = vi.fn();
    renderWithProviders(
      <SelectableCard selected={false} onClick={onClick} aria-label="tile">
        x
      </SelectableCard>
    );
    const tile = screen.getByRole('button', { name: 'tile' });
    expect(tile).toHaveAttribute('aria-pressed', 'false');
    fireEvent.keyDown(tile, { key: 'Enter' });
    expect(onClick).toHaveBeenCalled();
  });

  it('reports every key without delay and follows an outside reset', async () => {
    const onChange = vi.fn();
    const { rerender } = renderWithProviders(<SearchField value="" onChange={onChange} delay={0} label="find" />);
    await userEvent.type(screen.getByRole('textbox', { name: 'find' }), 'ab');
    expect(onChange).toHaveBeenLastCalledWith('ab');
    rerender(<SearchField value="zz" onChange={onChange} delay={0} label="find" />);
    await act(async () => {});
    expect(screen.getByRole('textbox', { name: 'find' })).toHaveValue('zz');
  });
});

describe('RmuDialog dismiss (spec 066)', () => {
  it('closes with Escape without a Close button', async () => {
    const onDismiss = vi.fn();
    renderWithProviders(
      <RmuDialog open title="t" onDismiss={onDismiss} buttons={<span>ok</span>}>
        body
      </RmuDialog>
    );
    expect(screen.queryByRole('button', { name: 'close' })).not.toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(onDismiss).toHaveBeenCalled();
  });
});
