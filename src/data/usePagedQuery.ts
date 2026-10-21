import { useCallback, useEffect, useRef, useState } from 'react';
import { Page } from '../api/api';

export type PagedFetcher<T> = (rsql: string, page: number, size: number, sort?: string) => Promise<Page<T>>;

export interface PagedQueryOptions<T> {
  fetcher: PagedFetcher<T>;
  /** RSQL filter. Changing it goes back to the first page. */
  rsql?: string;
  /** Sort expression passed to the fetcher as is (e.g. `name` or `-createdAt`). Changing it goes back to the first page. */
  sort?: string;
  pageSize?: number;
  /** Skip fetching while false (for example until a required filter is known). */
  enabled?: boolean;
  onError?: (error: unknown) => void;
}

export interface PagedQuery<T> {
  items: T[] | undefined;
  page: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  loading: boolean;
  error: unknown;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  refresh: () => void;
}

/** State of a paginated list: fetches on filter, page and page size changes, and on refresh(). */
export function usePagedQuery<T>({
  fetcher,
  rsql = '',
  sort,
  pageSize: initialPageSize = 24,
  enabled = true,
  onError,
}: PagedQueryOptions<T>): PagedQuery<T> {
  const [data, setData] = useState<Page<T>>();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  const [reloads, setReloads] = useState(0);
  const [appliedRsql, setAppliedRsql] = useState(rsql);
  const [appliedSort, setAppliedSort] = useState(sort);
  // Callers usually pass inline functions: keep the latest ones without refetching on every render.
  const fetcherRef = useRef(fetcher);
  const onErrorRef = useRef(onError);
  fetcherRef.current = fetcher;
  onErrorRef.current = onError;

  if (rsql !== appliedRsql) {
    setAppliedRsql(rsql);
    setPage(0);
  }
  if (sort !== appliedSort) {
    setAppliedSort(sort);
    setPage(0);
  }

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setLoading(true);
    fetcherRef
      .current(appliedRsql, page, pageSize, appliedSort)
      .then((response) => {
        if (cancelled) return;
        setData(response);
        setError(undefined);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
        onErrorRef.current?.(err);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [appliedRsql, appliedSort, page, pageSize, enabled, reloads]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(0);
  }, []);
  const refresh = useCallback(() => setReloads((count) => count + 1), []);

  return {
    items: data?.content,
    page,
    pageSize,
    totalPages: data?.pagination.totalPages ?? 0,
    totalElements: data?.pagination.totalElements ?? 0,
    loading,
    error,
    setPage,
    setPageSize,
    refresh,
  };
}
