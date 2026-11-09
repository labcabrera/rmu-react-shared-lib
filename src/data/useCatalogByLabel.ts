import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchAllPages, PageFetcher } from './fetch-all-pages';
import { useLocalPagedQuery } from './useLocalPagedQuery';
import { PagedQuery } from './usePagedQuery';

type CatalogFetcher<T> = PageFetcher<T>;

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
    fetchAllPages(fetcher, rsql)
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
