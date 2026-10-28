import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { renderHook, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Item } from '../../api/item.dto';
import { useListFilters } from '../../data/useListFilters';
import { catalogItem, sampleCatalog } from '../../test/fixtures/items';
import { renderWithProviders } from '../../test/render';
import ItemCard, { itemMetrics } from './ItemCard';
import ItemCatalogBrowser from './ItemCatalogBrowser';
import { itemCatalogFilters, normalizeText, sortItems, weaponSkillImage, weaponSkillLabel } from './item-catalog';

// A Spanish translation of a few item names, as i18n would give; other keys are returned as is.
const names: Record<string, string> = { 'battle-axe': 'Hacha de batalla', dagger: 'Daga', lantern: 'Linterna' };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (key: string, options?: any) => names[key] ?? options?.defaultValue ?? key;

const filtered = (search: string, owner?: string) => {
  const { result } = renderHook(() => useListFilters(itemCatalogFilters(t, { owner })), {
    wrapper: ({ children }) => <MemoryRouter initialEntries={[`/items${search}`]}>{children}</MemoryRouter>,
  });
  return sampleCatalog.filter(result.current.match).map((item) => item.id);
};

describe('item catalog filters', () => {
  it('finds items by translated name, without case or accents', () => {
    expect(filtered('?q=HACHA')).toEqual(['battle-axe']);
    expect(normalizeText('Canción')).toBe('cancion');
  });

  it('filters armor by AT (4 pieces and the full suit), slot and class', () => {
    expect(filtered('?category=armor&at=8')).toEqual([
      'plate-head',
      'plate-body',
      'plate-arms',
      'plate-legs',
      'plate-full',
    ]);
    expect(filtered('?category=armor&slot=full')).toEqual(['plate-full']);
    expect(filtered('?category=armor&slot=head')).toEqual(['plate-head', 'leather-helmet']);
    expect(filtered('?category=armor&class=light')).toEqual(['leather-helmet']);
  });

  it('ignores contextual filters of another category', () => {
    expect(filtered('?category=weapon&at=8')).toEqual(['battle-axe', 'dagger']);
  });

  it('filters weapons by skill, hands and attack', () => {
    expect(filtered('?category=weapon&skill=melee-weapon@blade')).toEqual(['dagger']);
    expect(filtered('?category=weapon&hands=two-hands')).toEqual(['battle-axe']);
    expect(filtered('?category=weapon&attack=thrown')).toEqual(['dagger']);
  });

  it('filters by rarity, features and owner', () => {
    expect(filtered('?rarity=uncommon')).toEqual(['leather-helmet']);
    expect(filtered('?feature=light')).toEqual(['lantern']);
    expect(filtered('?feature=container,light')).toEqual([]);
    expect(filtered('?mine=true', 'user-1')).toEqual(['dagger']);
    // Without a user «only mine» does not apply.
    expect(filtered('?mine=true')).toHaveLength(sampleCatalog.length);
  });

  it('sorts by name, cost, weight or AT, with the items without the value last', () => {
    const ids = (sort: string, dir = 'asc') => sortItems(sampleCatalog, sort, dir, t).map((item) => item.id);
    expect(ids('name').slice(0, 3)).toEqual(['backpack', 'dagger', 'battle-axe']);
    expect(ids('cost', 'desc')[0]).toBe('plate-full');
    expect(ids('cost').slice(-1)).toEqual(['backpack']);
    expect(ids('weight', 'desc').slice(0, 2)).toEqual(['plate-full', 'battle-axe']);
    expect(ids('at')[0]).toBe('leather-helmet');
  });

  it('labels and illustrates weapon skills', () => {
    expect(weaponSkillLabel('melee-weapon@greater-blade', t)).toBe('greater-blade');
    expect(weaponSkillLabel('shield', t)).toBe('shield');
    expect(weaponSkillImage('melee-weapon@blade')).toBe('images/items/category-melee-weapon@blade.png');
    expect(weaponSkillImage('ranged-weapon@sling')).toBe('images/items/category-weapon.png');
  });
});

describe('ItemCard', () => {
  const byId = (id: string) => sampleCatalog.find((item) => item.id === id)!;

  it('shows the metrics of each type', () => {
    expect(itemMetrics(byId('plate-full'), t).map((metric) => [metric.label, metric.value])).toEqual([
      ['at-short', 8],
      ['maneuver-penalty-short', '-10'],
      ['enc-short', '+6'],
    ]);
    expect(itemMetrics(byId('normal-shield'), t).map((metric) => metric.value)).toEqual(['+20', 2]);
    expect(itemMetrics(byId('battle-axe'), t).map((metric) => metric.value)).toEqual(['hafted', 4, 'two-hands']);
  });

  it('renders the name, category, rarity, weight, cost and actions', () => {
    renderWithProviders(
      <ItemCard item={byId('battle-axe')} actions={<button type="button">buy</button>} onClick={() => undefined} />
    );
    expect(screen.getByRole('heading', { name: 'battle-axe' })).toBeInTheDocument();
    expect(screen.getByText('weapon')).toBeInTheDocument();
    expect(screen.getByText('common')).toBeInTheDocument();
    expect(screen.getByText('6 lbs')).toBeInTheDocument();
    expect(screen.getByLabelText('10 coin-gp')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'buy' })).toBeInTheDocument();
  });
});

describe('ItemCatalogBrowser', () => {
  const Browser = ({ items, mode }: { items: Item[] | undefined; mode?: 'cards' | 'table' }) => {
    const filters = useListFilters(itemCatalogFilters(t));
    return <ItemCatalogBrowser items={items} filters={filters} mode={mode} layout="drawer" />;
  };

  it('shows the catalog with its count and filters it from the drawer', async () => {
    renderWithProviders(<Browser items={sampleCatalog} />);
    expect(screen.getByRole('status')).toHaveTextContent('results-count');
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(sampleCatalog.length);
    await userEvent.click(screen.getByRole('button', { name: /filters/ }));
    const rarity = await screen.findByRole('group', { name: 'rarity' });
    await userEvent.click(within(rarity).getByRole('checkbox', { name: 'uncommon' }));
    expect(screen.getAllByRole('heading', { level: 3, hidden: true }).map((h) => h.textContent)).toEqual([
      'leather-helmet',
    ]);
  });

  it('shows the armor filters only for armor, pages and shows a table', async () => {
    const many = Array.from({ length: 30 }, (_, index) =>
      catalogItem({ id: `item-${String(index).padStart(2, '0')}` })
    );
    const { unmount } = renderWithProviders(<Browser items={many} />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(24);
    expect(screen.queryByRole('group', { name: 'at-short', hidden: true })).toBeNull();
    unmount();
    renderWithProviders(<Browser items={sampleCatalog} mode="table" />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('shows a skeleton while the catalog loads', () => {
    renderWithProviders(<Browser items={undefined} />);
    expect(screen.getAllByLabelText('loading').length).toBeGreaterThan(0);
  });
});
