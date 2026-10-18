import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { isApiError } from './api-error';

export interface EntityOptions<T> {
  /** Entity already at hand, usually from the navigation state of the list page. Skips the first fetch. */
  initial?: T | null;
  onError?: (error: unknown) => void;
}

export interface EntityState<T> {
  entity: T | undefined;
  setEntity: Dispatch<SetStateAction<T | undefined>>;
  loading: boolean;
  error: unknown;
  notFound: boolean;
  refresh: () => void;
}

/** Loads one entity by id, using `initial` when the caller already has it. */
export function useEntity<T>(
  id: string | undefined,
  fetcher: (id: string) => Promise<T>,
  { initial, onError }: EntityOptions<T> = {}
): EntityState<T> {
  const [entity, setEntity] = useState<T | undefined>(initial ?? undefined);
  const [loading, setLoading] = useState(!initial && !!id);
  const [error, setError] = useState<unknown>();
  const [reloads, setReloads] = useState(0);
  const fetcherRef = useRef(fetcher);
  const onErrorRef = useRef(onError);
  const skipFirstFetch = useRef(!!initial);
  fetcherRef.current = fetcher;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!id) return;
    if (skipFirstFetch.current) {
      skipFirstFetch.current = false;
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetcherRef
      .current(id)
      .then((response) => {
        if (cancelled) return;
        setEntity(response);
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
  }, [id, reloads]);

  const refresh = useCallback(() => setReloads((count) => count + 1), []);
  const notFound = isApiError(error) && error.status === 404;

  return { entity, setEntity, loading, error, notFound, refresh };
}
