import React, { useState } from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/render';
import CharacterPicker, { CharacterOption, filterByRelation } from './CharacterPicker';

const OPTIONS: CharacterOption[] = [
  { id: 'a', name: 'Aragorn', factionId: 'f1', factionName: 'Fellowship' },
  { id: 'b', name: 'Boromir', factionId: 'f1', factionName: 'Fellowship' },
  { id: 'o', name: 'Orc', factionId: 'f2', factionName: 'Mordor' },
  { id: 'u', name: 'Uruk', factionId: 'f2', factionName: 'Mordor', disabledReason: 'dead' },
];

const many = (count: number): CharacterOption[] =>
  Array.from({ length: count }, (_, index) => ({ id: `c${index}`, name: `Character ${index}`, factionId: 'f1' }));

describe('filterByRelation', () => {
  it('keeps friends, enemies or everyone, and ignores the relation without a faction', () => {
    expect(filterByRelation(OPTIONS, 'friends', 'f1').map((o) => o.id)).toEqual(['a', 'b']);
    expect(filterByRelation(OPTIONS, 'enemies', 'f1').map((o) => o.id)).toEqual(['o', 'u']);
    expect(filterByRelation(OPTIONS, 'all', 'f1')).toHaveLength(4);
    expect(filterByRelation(OPTIONS, 'enemies')).toHaveLength(4);
  });
});

describe('CharacterPicker', () => {
  it('chooses one enemy and collapses to it, with a button to change it', async () => {
    const onChange = vi.fn();
    const Harness = () => {
      const [value, setValue] = useState<string | null>(null);
      return (
        <CharacterPicker
          label="target"
          options={OPTIONS}
          relation="enemies"
          factionId="f1"
          value={value}
          onChange={(id) => {
            setValue(id);
            onChange(id);
          }}
        />
      );
    };
    renderWithProviders(<Harness />);
    const group = screen.getByRole('radiogroup', { name: 'target' });
    expect(
      within(group)
        .getAllByRole('radio')
        .map((radio) => radio.getAttribute('aria-label'))
    ).toEqual(['Orc', 'Uruk']);
    expect(screen.getByRole('radio', { name: 'Uruk' })).toBeDisabled();
    await userEvent.click(screen.getByRole('radio', { name: 'Orc' }));
    expect(onChange).toHaveBeenCalledWith('o');
    expect(screen.queryByRole('radiogroup')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'change' }));
    expect(screen.getByRole('radio', { name: 'Orc' })).toHaveAttribute('aria-checked', 'true');
  });

  it('widens the relation to everyone with the show all switch', async () => {
    renderWithProviders(
      <CharacterPicker
        options={OPTIONS}
        relation="enemies"
        factionId="f1"
        allowShowAll
        value={null}
        onChange={vi.fn()}
      />
    );
    expect(screen.queryByRole('radio', { name: 'Boromir' })).toBeNull();
    await userEvent.click(screen.getByLabelText('show-all-actors'));
    expect(screen.getByRole('radio', { name: 'Boromir' })).toBeInTheDocument();
  });

  it('toggles several characters and leaves out the excluded ones', async () => {
    const onChange = vi.fn();
    renderWithProviders(
      <CharacterPicker mode="multiple" options={OPTIONS} exclude={['a']} value={['b']} onChange={onChange} />
    );
    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Aragorn' })).toBeNull();
    expect(screen.getByRole('checkbox', { name: 'Boromir' })).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(screen.getByRole('checkbox', { name: 'Orc' }));
    expect(onChange).toHaveBeenLastCalledWith(['b', 'o']);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Boromir' }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('shows why an option cannot be chosen', () => {
    renderWithProviders(<CharacterPicker mode="multiple" options={OPTIONS} value={[]} onChange={vi.fn()} />);
    expect(screen.getByText('dead')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Uruk' })).toBeDisabled();
  });

  it('groups the cards by faction', () => {
    renderWithProviders(<CharacterPicker options={OPTIONS} groupByFaction value={null} onChange={vi.fn()} />);
    expect(screen.getByText('Fellowship')).toBeInTheDocument();
    expect(screen.getByText('Mordor')).toBeInTheDocument();
  });

  it('offers extra entries that are not filtered by relation', () => {
    renderWithProviders(
      <CharacterPicker
        options={OPTIONS}
        relation="friends"
        factionId="f2"
        extraOptions={[{ id: 'armory', name: 'Armory' }]}
        value={null}
        onChange={vi.fn()}
      />
    );
    expect(screen.getAllByRole('radio').map((radio) => radio.getAttribute('aria-label'))).toEqual([
      'Armory',
      'Orc',
      'Uruk',
    ]);
  });

  it('adds a search field above eight cards', async () => {
    const { rerender } = renderWithProviders(<CharacterPicker options={many(8)} value={null} onChange={vi.fn()} />);
    expect(screen.queryByLabelText('search')).toBeNull();
    rerender(<CharacterPicker options={many(9)} value={null} onChange={vi.fn()} />);
    await userEvent.type(screen.getByLabelText('search'), 'Character 7');
    expect(screen.getAllByRole('radio')).toHaveLength(1);
  });

  it('switches to the compact list above twelve options', () => {
    const { rerender } = renderWithProviders(<CharacterPicker options={many(12)} value={null} onChange={vi.fn()} />);
    expect(screen.getAllByRole('radio')).toHaveLength(12);
    rerender(<CharacterPicker label="healer" options={many(13)} value={null} onChange={vi.fn()} />);
    expect(screen.queryByRole('radio')).toBeNull();
    expect(screen.getByRole('combobox', { name: 'healer' })).toBeInTheDocument();
  });

  it('keeps the options of each faction together in the compact list', async () => {
    const mixed = [OPTIONS[0], OPTIONS[2], OPTIONS[1]];
    renderWithProviders(
      <CharacterPicker variant="compact" label="actor" groupByFaction options={mixed} value={null} onChange={vi.fn()} />
    );
    await userEvent.click(screen.getByRole('combobox', { name: 'actor' }));
    expect(screen.getAllByText('Fellowship')).toHaveLength(1);
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['AAragorn', 'BBoromir', 'OOrc']);
  });

  it('chooses from the compact list', async () => {
    const onChange = vi.fn();
    renderWithProviders(
      <CharacterPicker
        mode="multiple"
        variant="compact"
        label="actors"
        options={OPTIONS}
        value={[]}
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByRole('combobox', { name: 'actors' }));
    await userEvent.click(screen.getByRole('option', { name: /Orc/ }));
    expect(onChange).toHaveBeenLastCalledWith(['o']);
  });
});
