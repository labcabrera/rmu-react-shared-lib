import React, { useState } from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/render';
import EntityPicker, { EntityOption } from './EntityPicker';

// Without an i18n instance, t() returns the key.

type Realm = { id: string; name: string };
const realms: Realm[] = [
  { id: 'r1', name: 'Middle Earth' },
  { id: 'r2', name: 'Harnworld' },
  { id: 'r3', name: 'Shadow World' },
];
const options: EntityOption<Realm>[] = realms.map((realm) => ({ id: realm.id, label: realm.name, entity: realm }));
const many = (count: number): EntityOption[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `o${index}`,
    label: `Option ${index}`,
    group: index % 2 ? 'odd' : 'even',
  }));

const Single = ({ onChange, allowAll = false }: { onChange: (id: string | null) => void; allowAll?: boolean }) => {
  const [value, setValue] = useState<string | null>('r1');
  return (
    <EntityPicker<Realm>
      label="Realm"
      kind="realm"
      options={options}
      value={value}
      allowAll={allowAll}
      onChange={(id, entity) => {
        setValue(id);
        onChange(id);
        if (id) expect(entity?.id).toBe(id);
      }}
    />
  );
};

describe('EntityPicker', () => {
  it('shows few options as a radio group of tiles and moves the selection with the arrow keys', async () => {
    const onChange = vi.fn();
    renderWithProviders(<Single onChange={onChange} />);
    const group = screen.getByRole('radiogroup', { name: 'Realm' });
    const radios = within(group).getAllByRole('radio');
    expect(radios.map((radio) => radio.getAttribute('aria-label'))).toEqual([
      'Middle Earth',
      'Harnworld',
      'Shadow World',
    ]);
    expect(radios[0]).toHaveAttribute('aria-checked', 'true');
    expect(radios.map((radio) => radio.tabIndex)).toEqual([0, -1, -1]);
    await userEvent.click(radios[2]);
    expect(onChange).toHaveBeenLastCalledWith('r3');
    expect(screen.getByRole('radio', { name: 'Shadow World' })).toHaveAttribute('aria-checked', 'true');
    screen.getByRole('radio', { name: 'Shadow World' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('r1');
    expect(screen.getByRole('radio', { name: 'Middle Earth' })).toHaveFocus();
  });

  it('offers "all" first, which reports null', async () => {
    const onChange = vi.fn();
    renderWithProviders(<Single onChange={onChange} allowAll />);
    const all = screen.getByRole('radio', { name: 'all' });
    expect(all).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(all);
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(screen.getByRole('radio', { name: 'all' })).toHaveAttribute('aria-checked', 'true');
  });

  it('chooses several tiles as checkboxes, up to max, and skips disabled ones', async () => {
    const onChange = vi.fn();
    const Multiple = () => {
      const [value, setValue] = useState<string[]>([]);
      return (
        <EntityPicker
          mode="multiple"
          label="AT"
          max={2}
          options={[...many(3), { id: 'x', label: 'Locked', disabledReason: 'nope' }]}
          value={value}
          onChange={(ids) => {
            setValue(ids);
            onChange(ids);
          }}
        />
      );
    };
    renderWithProviders(<Multiple />);
    const group = screen.getByRole('group', { name: 'AT' });
    expect(within(group).getAllByRole('checkbox')).toHaveLength(4);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Option 0' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Option 2' }));
    expect(onChange).toHaveBeenLastCalledWith(['o0', 'o2']);
    expect(screen.getByRole('checkbox', { name: 'Option 1' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('checkbox', { name: 'Locked' })).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(screen.getByRole('checkbox', { name: 'Option 0' }));
    expect(onChange).toHaveBeenLastCalledWith(['o2']);
  });

  it('switches to a searchable, grouped select above 8 options', async () => {
    const onChange = vi.fn();
    renderWithProviders(<EntityPicker label="Skill" options={many(9)} value={null} onChange={onChange} />);
    expect(screen.queryByRole('radiogroup')).toBeNull();
    const input = screen.getByRole('combobox', { name: 'Skill' });
    await userEvent.type(input, 'Option 7');
    const listbox = await screen.findByRole('listbox');
    expect(within(listbox).getByText('odd')).toBeInTheDocument();
    await userEvent.click(within(listbox).getByText('Option 7'));
    expect(onChange).toHaveBeenCalledWith('o7', undefined);
  });

  it('forces a variant and chooses several values in the select', async () => {
    const onChange = vi.fn();
    renderWithProviders(
      <EntityPicker
        mode="multiple"
        variant="select"
        label="Realms"
        options={options}
        value={['r2']}
        onChange={onChange}
      />
    );
    expect(screen.getByText('Harnworld')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('combobox', { name: 'Realms' }));
    await userEvent.click(within(await screen.findByRole('listbox')).getByText('Middle Earth'));
    expect(onChange).toHaveBeenCalledWith(['r2', 'r1'], [realms[1], realms[0]]);
  });
});
