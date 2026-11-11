/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { fetchRealms } from '../api/realm.api';
import { Realm } from '../api/realm.dto';
import { useNotify } from '../app/NotificationProvider';
import SearchField from '../templates/SearchField';
import { FilterDef, ListFilters } from './useListFilters';

/** What the filter controls read and write of useListFilters (independent of the entity type). */
export type FilterAccess = Pick<ListFilters, 'get' | 'getAll' | 'set'>;

/** Text filter compared with a regular expression on an RSQL field (`name=re=<text>`), spec 066 (from core). */
export const regexFilter = <T,>(label: string, field: string): FilterDef<T> => ({
  kind: 'text',
  label,
  toRsql: (value) => (value ? `${field}=re=${value}` : undefined),
});

/** Single value filter compared for equality on an RSQL field (`<field>==<value>`). */
export const equalsFilter = <T,>(label: string, field: string, extra: Partial<FilterDef<T>> = {}): FilterDef<T> => ({
  kind: 'single',
  label,
  toRsql: (value) => (value ? `${field}==${value}` : undefined),
  ...extra,
});

/** Props of a picker preset bound to a `single` filter, with an "all" option. */
export const bindSingle = (filters: FilterAccess, key: string) => ({
  value: filters.get(key) || null,
  onChange: (id: string | null) => filters.set(key, id),
  allowAll: true,
});

/**
 * Search box of a `text` filter. useListFilters already debounces before the URL, so the field reports every key
 * (`delay` 0) and follows the value when a chip clears it.
 */
export const FilterSearchField: FC<{ filters: FilterAccess; filter: string; label: string }> = ({
  filters,
  filter,
  label,
}) => (
  <SearchField
    label={label}
    name={filter}
    delay={0}
    value={filters.get(filter) ?? ''}
    onChange={(value) => filters.set(filter, value)}
  />
);

/** Realms of the catalog, for the realm filters and pickers (`undefined` while they load). */
export const useRealms = (): Realm[] | undefined => {
  const auth = useAuth();
  const notify = useNotify();
  const [realms, setRealms] = useState<Realm[]>();
  useEffect(() => {
    fetchRealms('', 0, 100, auth)
      .then((response) => setRealms(response.content))
      .catch(notify.error);
  }, []);
  return realms;
};

/** Name of a realm for the chip of its filter. */
export const realmName = (realms: Realm[] | undefined, id: string) =>
  realms?.find((realm) => realm.id === id)?.name ?? id;
