import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Page } from '../api/api';
import { useLocalPagedQuery } from './useLocalPagedQuery';
import { PagedQuery } from './usePagedQuery';

/** The page size limit of the API. */
const API_PAGE_SIZE = 100;

type CatalogFetcher<T> = (rsql: string, page: number, size: number) => Promise<Page<T>>;

const fetchAll = async <T>(fetcher: CatalogFetcher<T>, rsql: string): Promise<T[]> => {
  const first = await fetcher(rsql, 0, API_PAGE_SIZE);
  const others = await Promise.all(
    Array.from({ length: Math.max(0, first.pagination.totalPages - 1) }, (_, index) =>
      fetcher(rsql, index + 1, API_PAGE_SIZE)
    )
  );
  return [first, ...others].flatMap((page) => page.content);
};

/**
 * The list of a small catalog ordered by its translated name, which the API does not know: the RSQL filters go to the
 * API, every match is loaded, and the list is filtered by `match` (the translated name), sorted in the language of the
 * user and paged on the client.
 */
export function useCatalogByLabel<T>({
  fetcher,
  rsql,
  resetKey,
  labelOf,
  match,
  onError,
  labelVersion,
}: {
  fetcher: CatalogFetcher<T>;
  rsql: string;
  resetKey: string;
  labelOf: (entity: T) => string;
  match: (entity: T) => boolean;
  onError: (error: unknown) => void;
  /** Changes when `labelOf` starts to give other labels (a namespace that finished loading). */
  labelVersion?: unknown;
}): PagedQuery<T> {
  const { i18n } = useTranslation();
  const [items, setItems] = useState<T[]>();
  const [error, setError] = useState<unknown>();
  const [reloads, setReloads] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setItems(undefined);
    fetchAll(fetcher, rsql)
      .then((all) => {
        if (cancelled) return;
        setItems(all);
        setError(undefined);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
        onError(err);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rsql, reloads]);

  const sorted = useMemo(
    () =>
      items
        ?.filter(match)
        .map((entity) => ({ entity, label: labelOf(entity) }))
        .sort((a, b) => a.label.localeCompare(b.label, i18n.language))
        .map(({ entity }) => entity),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, match, i18n.language, labelVersion]
  );

  return useLocalPagedQuery(sorted, {
    pageSize: 48,
    resetKey,
    error,
    refresh: () => setReloads((count) => count + 1),
  });
}
