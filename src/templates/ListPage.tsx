import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import { Button, Fab } from '@mui/material';
import RefreshButton from '../buttons/RefreshButton';
import { PagedQuery } from '../data/usePagedQuery';
import RmuPagination from '../display/RmuPagination';
import LayoutBase from '../layouts/LayoutBase';
import EmptyState from '../ui/states/EmptyState';
import ErrorState from '../ui/states/ErrorState';
import LoadingState from '../ui/states/LoadingState';
import CardGrid from './CardGrid';
import { bottomOffset, usePhone } from './responsive';
import { Breadcrumb } from './types';

export interface ListPageProps<T> {
  breadcrumbs: Breadcrumb[];
  /** State from usePagedQuery: the page handles loading, error, empty and pagination with it. */
  query: PagedQuery<T>;
  renderItem: (item: T) => ReactNode;
  getKey?: (item: T) => string;
  /** Filters shown above the results, usually a FilterBar. */
  filters?: ReactNode;
  onAdd?: () => void;
  /** Extra header actions, shown before refresh and add. */
  actions?: ReactNode[];
  emptyState?: ReactNode;
  children?: ReactNode;
}

/** Standard list page: header with refresh/add, filters, card grid, states and pagination. */
export default function ListPage<T>({
  breadcrumbs,
  query,
  renderItem,
  getKey = (item) => (item as { id: string }).id,
  filters,
  onAdd,
  actions = [],
  emptyState,
  children,
}: ListPageProps<T>) {
  const { t } = useTranslation();
  const isPhone = usePhone();
  const { items, error } = query;
  const headerActions = [
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
  else if (!items) content = <LoadingState variant="cards" />;
  else if (items.length === 0) content = emptyState ?? <EmptyState />;
  else content = <CardGrid items={items} renderItem={renderItem} getKey={getKey} />;

  return (
    <LayoutBase breadcrumbs={breadcrumbs} actions={headerActions}>
      {filters}
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
