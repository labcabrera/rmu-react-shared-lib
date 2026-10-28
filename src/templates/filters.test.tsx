import React from 'react';
import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FilterSchema, useListFilters } from '../data/useListFilters';
import { useLocalPagedQuery } from '../data/useLocalPagedQuery';
import { renderWithProviders } from '../test/render';
import FilterBar from './FilterBar';
import { FilterSection } from './FilterPanel';
import ListPage from './ListPage';

// Without an i18n instance, t() returns the key: labels below are translation keys.

type Thing = { id: string; name: string; kind: string };
const things: Thing[] = Array.from({ length: 30 }, (_, index) => ({
  id: `t${index}`,
  name: `Thing ${index}`,
  kind: index % 3 === 0 ? 'tool' : 'weapon',
}));

const schema: FilterSchema<Thing> = {
  kind: {
    kind: 'single',
    label: 'Kind',
    options: ['tool', 'weapon'],
    match: (thing, value) => thing.kind === value,
  },
};

/** Matches the `lg` up query (wide screens) when `wide`; never the phone one. */
const mockWide = (wide: boolean) =>
  vi.stubGlobal(
    'matchMedia',
    (query: string) =>
      ({
        matches: wide && query.includes('min-width') && !query.includes('max-width'),
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
      }) as MediaQueryList
  );

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

const Page = ({ layout }: { layout: 'top' | 'side' }) => {
  const filters = useListFilters(schema);
  const query = useLocalPagedQuery(things.filter(filters.match), { pageSize: 12, resetKey: filters.key });
  const kindButtons = (
    <>
      <button type="button" onClick={() => filters.set('kind', 'tool')}>
        tools
      </button>
      <span>{`kind=${filters.get('kind')}`}</span>
    </>
  );
  return (
    <ListPage
      breadcrumbs={[{ name: 'Things' }]}
      query={query}
      filterState={filters}
      filtersLayout={layout}
      filtersStorageKey="test.things"
      filters={
        layout === 'side' ? (
          <FilterSection title="Kind">{kindButtons}</FilterSection>
        ) : (
          <FilterBar>
            <span>search</span>
            {kindButtons}
          </FilterBar>
        )
      }
      renderItem={(thing) => <span>{thing.name}</span>}
    />
  );
};

describe('ListPage with filters', () => {
  it('shows the count and the chips of the active filters, removes them and pages a list in memory', async () => {
    renderWithProviders(<Page layout="top" />);
    expect(screen.getByRole('status')).toHaveTextContent('results-count');
    expect(screen.getByText('Thing 11')).toBeInTheDocument();
    expect(screen.queryByText('Thing 12')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'tools' }));
    expect(screen.getByText('kind=tool')).toBeInTheDocument();
    expect(screen.queryByText('Thing 1')).toBeNull();
    expect(screen.getByText('Thing 3')).toBeInTheDocument();
    const chip = screen.getByText('Kind').closest('.MuiChip-root') as HTMLElement;
    expect(chip).toHaveTextContent('tool');
    await userEvent.click(screen.getByRole('button', { name: 'clear' }));
    expect(screen.getByText('kind=')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'clear' })).toBeNull();
  });

  it('puts the side panel in a drawer below lg, with the count of active filters', async () => {
    mockWide(false);
    renderWithProviders(<Page layout="side" />);
    expect(screen.queryByRole('complementary')).toBeNull();
    const button = screen.getByRole('button', { name: /filters/ });
    await userEvent.click(button);
    await userEvent.click(await screen.findByRole('button', { name: 'tools' }));
    expect(button.closest('.MuiBadge-root')).toHaveTextContent('1');
  });

  it('shows a sticky side panel from lg that can be hidden, remembered per list', async () => {
    mockWide(true);
    const { unmount } = renderWithProviders(<Page layout="side" />);
    const panel = screen.getByRole('complementary', { name: 'filters' });
    expect(within(panel).getByRole('button', { name: 'Kind' })).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'hide-filters' }));
    expect(screen.queryByRole('complementary')).toBeNull();
    expect(localStorage.getItem('rmu.filters.test.things')).toBe('hidden');
    unmount();
    renderWithProviders(<Page layout="side" />);
    expect(screen.queryByRole('complementary')).toBeNull();
    act(() => screen.getByRole('button', { name: 'show-filters' }).click());
    expect(screen.getByRole('complementary', { name: 'filters' })).toBeInTheDocument();
  });

  it('folds a filter section and hides a hidden one', async () => {
    renderWithProviders(
      <>
        <FilterSection title="Open">
          <span>inside</span>
        </FilterSection>
        <FilterSection title="Hidden" hidden>
          <span>never</span>
        </FilterSection>
      </>
    );
    expect(screen.queryByText('never')).toBeNull();
    const toggle = screen.getByRole('button', { name: 'Open' });
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});
