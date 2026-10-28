import React, { ReactNode } from 'react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FilterSchema, useListFilters } from './useListFilters';
import { useLocalPagedQuery } from './useLocalPagedQuery';

type Thing = { name: string; category: string; at?: number; rarity: string };

const schema: FilterSchema<Thing> = {
  q: {
    kind: 'text',
    label: 'Name',
    toRsql: (value) => `name=re=${value}`,
    match: (thing, value) => thing.name.toLowerCase().includes(String(value).toLowerCase()),
  },
  category: {
    kind: 'single',
    label: 'Category',
    options: ['weapon', 'armor'],
    format: (value) => value.toUpperCase(),
    toRsql: (value) => `category==${value}`,
    match: (thing, value) => thing.category === value,
  },
  at: {
    kind: 'multiple',
    label: 'AT',
    options: ['2', '3', '8'],
    when: (values) => values.category === 'armor',
    toRsql: (value) => `armor.at=in=(${(value as string[]).join(',')})`,
    match: (thing, value) => (value as string[]).includes(String(thing.at)),
  },
  rarity: { kind: 'single', label: 'Rarity', match: (thing, value) => thing.rarity === value },
  sort: { kind: 'single', label: 'Sort', options: ['name', 'cost'], defaultValue: 'name', chip: false },
};

let location = '';
const LocationProbe = () => {
  location = useLocation().search;
  return null;
};

const wrapper =
  (initial = '/items') =>
  ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={['/home', initial]} initialIndex={1}>
      <LocationProbe />
      {children}
    </MemoryRouter>
  );

const things: Thing[] = [
  { name: 'Battle axe', category: 'weapon', rarity: 'common' },
  { name: 'Plate helmet', category: 'armor', at: 8, rarity: 'common' },
  { name: 'Leather helmet', category: 'armor', at: 2, rarity: 'rare' },
];

describe('useListFilters', () => {
  it('reads the URL and ignores unknown values and inactive contextual filters', () => {
    const { result } = renderHook(() => useListFilters(schema), {
      wrapper: wrapper('/items?category=potion&at=8&rarity=rare&sort=bogus'),
    });
    expect(result.current.values).toEqual({ rarity: 'rare', sort: 'name' });
    expect(result.current.isActive('at')).toBe(false);
    expect(result.current.activeCount).toBe(1);
  });

  it('applies contextual filters and builds chips, rsql and match', () => {
    const { result } = renderHook(() => useListFilters(schema), {
      wrapper: wrapper('/items?q=helm&category=armor&at=8,9,3'),
    });
    expect(result.current.getAll('at')).toEqual(['8', '3']);
    expect(result.current.activeCount).toBe(3);
    expect(result.current.chips.map((chip) => [chip.id, chip.filterLabel, chip.label])).toEqual([
      ['q', 'Name', 'helm'],
      ['category', 'Category', 'ARMOR'],
      ['at:8', 'AT', '8'],
      ['at:3', 'AT', '3'],
    ]);
    expect(result.current.rsql).toBe('name=re=helm;category==armor;armor.at=in=(8,3)');
    expect(things.filter(result.current.match).map((thing) => thing.name)).toEqual(['Plate helmet']);
  });

  it('writes with replace, toggles values and drops the params of filters that stop applying', () => {
    const { result } = renderHook(
      () => ({ filters: useListFilters(schema), navigate: useNavigate(), path: useLocation().pathname }),
      { wrapper: wrapper() }
    );
    act(() => result.current.filters.set('category', 'armor'));
    act(() => result.current.filters.toggle('at', '8'));
    act(() => result.current.filters.toggle('at', '2'));
    expect(location).toBe('?category=armor&at=8%2C2');
    act(() => result.current.filters.toggle('at', '8'));
    expect(result.current.filters.getAll('at')).toEqual(['2']);
    act(() => result.current.filters.set('category', 'weapon'));
    expect(location).toBe('?category=weapon');
    act(() => result.current.navigate(-1));
    // Every change replaced the entry: going back leaves the list.
    expect(result.current.path).toBe('/home');
  });

  it('debounces text, removes one chip and clears all but the controls', async () => {
    const { result } = renderHook(() => useListFilters(schema, { debounce: 20 }), {
      wrapper: wrapper('/items?category=armor&at=2,8&sort=cost'),
    });
    act(() => result.current.set('q', 'hel'));
    expect(result.current.get('q')).toBe('hel');
    expect(location).not.toContain('q=');
    await waitFor(() => expect(location).toContain('q=hel'));
    const chip = result.current.chips.find((each) => each.id === 'at:2')!;
    act(() => chip.onDelete());
    expect(result.current.getAll('at')).toEqual(['8']);
    act(() => result.current.clearAll());
    expect(location).toBe('?sort=cost');
    expect(result.current.activeCount).toBe(0);
  });

  it('changes its key when the applied filters change', () => {
    const { result } = renderHook(() => useListFilters(schema), { wrapper: wrapper() });
    const before = result.current.key;
    act(() => result.current.set('rarity', 'rare'));
    expect(result.current.key).not.toBe(before);
  });
});

describe('useLocalPagedQuery', () => {
  const list = Array.from({ length: 30 }, (_, index) => index);

  it('pages a list in memory and goes back to the first page when the reset key changes', () => {
    const { result, rerender } = renderHook(
      ({ items, resetKey }) => useLocalPagedQuery(items, { pageSize: 12, resetKey }),
      { initialProps: { items: list as number[] | undefined, resetKey: 'a' } }
    );
    expect(result.current.items).toEqual(list.slice(0, 12));
    expect(result.current.totalPages).toBe(3);
    expect(result.current.totalElements).toBe(30);
    act(() => result.current.setPage(2));
    expect(result.current.items).toEqual(list.slice(24));
    rerender({ items: list.slice(0, 20), resetKey: 'b' });
    expect(result.current.page).toBe(0);
    act(() => result.current.setPageSize(24));
    expect(result.current.items).toHaveLength(20);
    rerender({ items: undefined, resetKey: 'b' });
    expect(result.current.items).toBeUndefined();
    expect(result.current.loading).toBe(true);
  });
});
