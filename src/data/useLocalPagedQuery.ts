import { useCallback, useState } from 'react';
import { PagedQuery } from './usePagedQuery';

export interface LocalPagedQueryOptions {
  pageSize?: number;
  /** Going back to the first page whenever it changes: the `key` of useListFilters, plus the sort. */
  resetKey?: string;
  /** Error of the load of the items, shown by ListPage. */
  error?: unknown;
  /** Reloads the items (the refresh button of ListPage). */
  refresh?: () => void;
}

/**
 * The pages of a list already in memory (a catalog loaded whole, filtered and sorted on the client), with the shape
 * of usePagedQuery so ListPage can show it. `items` undefined means still loading.
 */
export function useLocalPagedQuery<T>(
  items: T[] | undefined,
  { pageSize: initialPageSize = 24, resetKey, error, refresh }: LocalPagedQueryOptions = {}
): PagedQuery<T> {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [appliedKey, setAppliedKey] = useState(resetKey);
  if (resetKey !== appliedKey) {
    setAppliedKey(resetKey);
    setPage(0);
  }
  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(0);
  }, []);
  const noop = useCallback(() => undefined, []);

  const totalElements = items?.length ?? 0;
  const totalPages = Math.ceil(totalElements / pageSize);
  // The list may shrink under the current page (a reload): show its last page.
  const current = Math.max(0, Math.min(page, totalPages - 1));
  return {
    items: items?.slice(current * pageSize, (current + 1) * pageSize),
    page: current,
    pageSize,
    totalPages,
    totalElements,
    loading: !items && !error,
    error,
    setPage,
    setPageSize,
    refresh: refresh ?? noop,
  };
}
