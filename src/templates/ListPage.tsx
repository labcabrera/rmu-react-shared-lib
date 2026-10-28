import React, { cloneElement, isValidElement, ReactElement, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import { Box, Button, Chip, Fab, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import RefreshButton from '../buttons/RefreshButton';
import { ListFilters } from '../data/useListFilters';
import { PagedQuery } from '../data/usePagedQuery';
import RmuPagination from '../display/RmuPagination';
import LayoutBase from '../layouts/LayoutBase';
import EmptyState from '../ui/states/EmptyState';
import ErrorState from '../ui/states/ErrorState';
import LoadingState from '../ui/states/LoadingState';
import CollectionView, { CollectionConfig, CollectionModeSwitch, useCollectionMode } from './CollectionView';
import FilterBar from './FilterBar';
import { FilterPanel } from './FilterPanel';
import { bottomOffset, usePhone } from './responsive';
import { Breadcrumb } from './types';

/** What ListPage reads of useListFilters: the chips of the results bar, the count and "clear". */
export type ListPageFilterState = Pick<ListFilters, 'chips' | 'activeCount' | 'clearAll'>;

export interface ListPageProps<T> {
  breadcrumbs: Breadcrumb[];
  /**
   * State from usePagedQuery (filtered by the API) or useLocalPagedQuery (a list filtered in memory): the page handles
   * loading, error, empty and pagination with it.
   */
  query: PagedQuery<T>;
  renderItem: (item: T) => ReactNode;
  getKey?: (item: T) => string;
  /**
   * Filters. With `filtersLayout="top"`, shown above the results (usually a FilterBar). With `side`, the content of
   * the side panel (FilterSection elements).
   */
  filters?: ReactNode;
  /**
   * `top` (default): the filters above the results. `side` (spec 046, decision 6): a sticky 280 px column from `lg`
   * that can be hidden, and the filters drawer below it.
   */
  filtersLayout?: 'top' | 'side';
  /** State of useListFilters: adds the results bar (count, chips of the active filters, "clear") and the counters. */
  filterState?: ListPageFilterState;
  /** End of the results bar: the sort of the list. */
  resultsActions?: ReactNode;
  /** Key under which the visibility of the side panel is remembered; the collection's storageKey by default. */
  filtersStorageKey?: string;
  /** Shown instead of the default skeleton while the first page loads. */
  loading?: ReactNode;
  onAdd?: () => void;
  /** Extra header actions, shown before refresh and add. */
  actions?: ReactNode[];
  emptyState?: ReactNode;
  /** Other views of the items (table, grouped) and the size of the cards; without it, a card grid. */
  collection?: CollectionConfig<T>;
  children?: ReactNode;
}

const panelKeyOf = (key: string) => `rmu.filters.${key}`;

/** Whether the side filter panel of a list is shown, remembered per list in localStorage. */
export const useFilterPanelOpen = (storageKey: string) => {
  const [open, setOpenState] = useState(() => {
    try {
      return localStorage.getItem(panelKeyOf(storageKey)) !== 'hidden';
    } catch {
      return true;
    }
  });
  const setOpen = (next: boolean) => {
    setOpenState(next);
    try {
      localStorage.setItem(panelKeyOf(storageKey), next ? 'shown' : 'hidden');
    } catch {
      // Storage unavailable: the choice lasts until the page is left.
    }
  };
  return [open, setOpen] as const;
};

/** Button that hides or shows the side filter panel. */
export const FilterPanelToggle = ({ open, onChange }: { open: boolean; onChange: (open: boolean) => void }) => {
  const { t } = useTranslation();
  return (
    <Button
      size="small"
      variant="text"
      startIcon={open ? <FilterListOffIcon /> : <FilterListIcon />}
      onClick={() => onChange(!open)}
      aria-expanded={open}
    >
      {open ? t('hide-filters') : t('show-filters')}
    </Button>
  );
};

/** Count of results, chips of the active filters with "clear", and the sort (spec 046, decision 6). */
export const ListResultsBar = ({
  count,
  filterState,
  actions,
  panelToggle,
}: {
  count: number | undefined;
  filterState?: ListPageFilterState;
  actions?: ReactNode;
  panelToggle?: ReactNode;
}) => {
  const { t } = useTranslation();
  const chips = filterState?.chips ?? [];
  return (
    <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1, minHeight: 40 }}>
      {panelToggle}
      {count !== undefined && (
        <Typography variant="body2" color="text.secondary" role="status" sx={{ mr: 1 }}>
          {t('results-count', { count })}
        </Typography>
      )}
      {chips.map((chip) => (
        <Chip
          key={chip.id}
          size="small"
          onDelete={chip.onDelete}
          label={
            <>
              <Box component="span" sx={{ color: 'text.secondary', mr: 0.5 }}>
                {chip.filterLabel}
              </Box>
              {chip.label}
            </>
          }
        />
      ))}
      {filterState && filterState.activeCount > 0 && (
        <Button size="small" onClick={filterState.clearAll}>
          {t('clear')}
        </Button>
      )}
      {actions && <Box sx={{ ml: 'auto' }}>{actions}</Box>}
    </Stack>
  );
};

/**
 * Standard list page: header with refresh/add, filters (above the results or in a side panel), card grid or table,
 * states and pagination.
 */
export default function ListPage<T>({
  breadcrumbs,
  query,
  renderItem,
  getKey = (item) => (item as { id: string }).id,
  filters,
  filtersLayout = 'top',
  filterState,
  resultsActions,
  filtersStorageKey,
  loading,
  onAdd,
  actions = [],
  emptyState,
  collection,
  children,
}: ListPageProps<T>) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPhone = usePhone();
  const isWide = useMediaQuery(theme.breakpoints.up('lg'));
  const { items, error } = query;
  const modes = collection?.modes ?? ['cards'];
  const [mode, setMode] = useCollectionMode(collection?.storageKey ?? 'default', modes);
  const [panelOpen, setPanelOpen] = useFilterPanelOpen(filtersStorageKey ?? collection?.storageKey ?? 'default');
  const side = filtersLayout === 'side' && !!filters;
  const headerActions = [
    ...(modes.length > 1 ? [<CollectionModeSwitch key="mode" modes={modes} value={mode} onChange={setMode} />] : []),
    ...actions.map((action, index) => <React.Fragment key={`action-${index}`}>{action}</React.Fragment>),
    <RefreshButton key="refresh" onClick={query.refresh} />,
    ...(onAdd && !isPhone
      ? [
          <Button key="add" variant="contained" size="small" startIcon={<AddIcon />} onClick={onAdd} sx={{ ml: 1 }}>
            {t('add')}
          </Button>,
        ]
      : []),
  ];

  let content: ReactNode;
  if (error && !items) content = <ErrorState error={error} onRetry={query.refresh} />;
  else if (!items) content = loading ?? <LoadingState variant="cards" />;
  else if (items.length === 0) content = emptyState ?? <EmptyState />;
  else
    content = <CollectionView items={items} getKey={getKey} renderItem={renderItem} mode={mode} config={collection} />;

  const panelToggle = side && isWide && <FilterPanelToggle open={panelOpen} onChange={setPanelOpen} />;
  const resultsBar = (filterState || resultsActions || panelToggle) && (
    <ListResultsBar
      count={items ? query.totalElements : undefined}
      filterState={filterState}
      actions={resultsActions}
      panelToggle={panelToggle}
    />
  );
  const results = (
    <>
      {resultsBar}
      {content}
      {items && query.totalPages > 0 && (
        <RmuPagination
          page={query.page}
          pageSize={query.pageSize}
          totalPages={query.totalPages}
          setPage={query.setPage}
          setPageSize={query.setPageSize}
        />
      )}
    </>
  );

  // A FilterBar given by the page gets the count of active filters for its phone button.
  const topFilters =
    filterState &&
    isValidElement(filters) &&
    filters.type === FilterBar &&
    (filters.props as { activeCount?: number }).activeCount === undefined
      ? cloneElement(filters as ReactElement<{ activeCount?: number }>, { activeCount: filterState.activeCount })
      : filters;

  let body: ReactNode;
  if (!side) {
    body = (
      <>
        {topFilters}
        {results}
      </>
    );
  } else if (isWide) {
    body = (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: panelOpen ? '280px minmax(0, 1fr)' : 'minmax(0, 1fr)',
          gap: 2,
          alignItems: 'start',
        }}
      >
        {panelOpen && (
          <Box
            component="aside"
            aria-label={t('filters')}
            sx={{
              position: 'sticky',
              top: 16,
              maxHeight: 'calc(100vh - 32px)',
              overflowY: 'auto',
              pr: 1,
            }}
          >
            <FilterPanel>{filters}</FilterPanel>
          </Box>
        )}
        <Box sx={{ minWidth: 0 }}>{results}</Box>
      </Box>
    );
  } else {
    body = (
      <>
        <FilterBar variant="drawer" activeCount={filterState?.activeCount ?? 0}>
          <FilterPanel>{filters}</FilterPanel>
        </FilterBar>
        {results}
      </>
    );
  }

  return (
    <LayoutBase breadcrumbs={breadcrumbs} actions={headerActions} allowSticky={side}>
      {body}
      {children}
      {onAdd && isPhone && (
        <Fab
          color="primary"
          aria-label={t('add')}
          onClick={onAdd}
          sx={{ position: 'fixed', right: 16, bottom: bottomOffset(16), zIndex: (theme) => theme.zIndex.speedDial }}
        >
          <AddIcon />
        </Fab>
      )}
    </LayoutBase>
  );
}
