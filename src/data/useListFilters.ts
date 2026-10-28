import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from './useDebounce';

/** `text`: free text (debounced); `single`: one value; `multiple`: several values (comma separated in the URL). */
export type FilterKind = 'text' | 'single' | 'multiple';
export type FilterValue = string | string[];
export type FilterValues = Record<string, FilterValue | undefined>;

/** One filter of a list (spec 046, decision 7). */
export interface FilterDef<T = unknown> {
  kind: FilterKind;
  /** Name of the filter, already translated: the chips show it before the value. */
  label: string;
  /** Query param; defaults to the key of the filter in the schema. */
  param?: string;
  /** Allowed values of `single` and `multiple`: any other value in the URL is ignored. */
  options?: readonly string[];
  /** Text of a value in its chip; the value as is by default. */
  format?: (value: string) => string;
  /** Contextual filter: while it returns false the filter is ignored and its param is dropped from the URL. */
  when?: (values: FilterValues) => boolean;
  /** RSQL condition of the value, for lists filtered by the API (`rsql`). */
  toRsql?: (value: FilterValue) => string | null | undefined;
  /** Whether an entity passes the filter, for lists filtered on the client (`match`). */
  match?: (entity: T, value: FilterValue) => boolean;
  /**
   * `false` for controls kept in the URL that are not filters (the sort): no chip, not counted, kept by `clearAll`.
   */
  chip?: boolean;
  /** Value when the URL has none (a `single` only); it is never written to the URL. */
  defaultValue?: string;
}

export type FilterSchema<T = unknown> = Record<string, FilterDef<T>>;

/** An active filter value, as a removable chip. */
export interface FilterChip {
  /** Unique key of the chip: `<filter>` or `<filter>:<value>` for each value of a `multiple`. */
  id: string;
  filter: string;
  /** Label of the filter. */
  filterLabel: string;
  value: string;
  /** Text of the value. */
  label: string;
  onDelete: () => void;
}

export interface ListFilters<T = unknown> {
  /** Values of the filters that apply now (text as typed, before the debounce), for the controls. */
  values: FilterValues;
  /** Value of a `text` or `single` filter ('' when empty). */
  get: (key: string) => string;
  /** Values of a `multiple` filter ([] when empty). */
  getAll: (key: string) => string[];
  set: (key: string, value: FilterValue | null | undefined) => void;
  /** Adds or removes one value of a `multiple` filter. */
  toggle: (key: string, value: string) => void;
  /** Clears a filter, or one value of a `multiple` filter. */
  clear: (key: string, value?: string) => void;
  /** Clears every filter except the controls (`chip: false`). */
  clearAll: () => void;
  /** Whether a filter applies now (its `when` holds): contextual sections hide themselves with it. */
  isActive: (key: string) => boolean;
  activeCount: number;
  chips: FilterChip[];
  /** RSQL of the applied filters, for usePagedQuery. */
  rsql: string;
  /** Whether an entity passes every applied filter, for lists filtered on the client. */
  match: (entity: T) => boolean;
  /** Changes whenever the applied filters change: a list goes back to its first page with it. */
  key: string;
}

const isEmpty = (value: FilterValue | undefined): value is undefined =>
  value === undefined || value === '' || (Array.isArray(value) && value.length === 0);

const paramOf = (key: string, def: FilterDef<never>) => def.param ?? key;

const parse = (def: FilterDef<never>, raw: string | null): FilterValue | undefined => {
  if (raw === null || raw === '') return def.defaultValue;
  if (def.kind === 'multiple') {
    const list = [...new Set(raw.split(',').filter((value) => value && (!def.options || def.options.includes(value))))];
    return list.length > 0 ? list : undefined;
  }
  if (def.kind === 'single') return !def.options || def.options.includes(raw) ? raw : def.defaultValue;
  return raw;
};

/** Values in the URL, before the contextual filters are applied. */
const readAll = <T>(schema: FilterSchema<T>, params: URLSearchParams): FilterValues => {
  const values: FilterValues = {};
  Object.entries(schema).forEach(([key, def]) => {
    values[key] = parse(def as FilterDef<never>, params.get(paramOf(key, def as FilterDef<never>)));
  });
  return values;
};

const activeKeys = <T>(schema: FilterSchema<T>, values: FilterValues): string[] =>
  Object.keys(schema).filter((key) => !schema[key].when || schema[key].when!(values));

const write = <T>(
  schema: FilterSchema<T>,
  params: URLSearchParams,
  key: string,
  value: FilterValue | null | undefined
) => {
  const def = schema[key] as FilterDef<never>;
  const param = paramOf(key, def);
  const empty = value === null || isEmpty(value) || (def.defaultValue !== undefined && value === def.defaultValue);
  if (empty) params.delete(param);
  else params.set(param, Array.isArray(value) ? value.join(',') : value);
};

/** Drops the params of the contextual filters that no longer apply. */
const dropInactive = <T>(schema: FilterSchema<T>, params: URLSearchParams) => {
  const values = readAll(schema, params);
  const active = activeKeys(schema, values);
  Object.keys(schema)
    .filter((key) => !active.includes(key))
    .forEach((key) => params.delete(paramOf(key, schema[key] as FilterDef<never>)));
};

/**
 * Filters of a list kept in the URL query (spec 046, decision 7), with `replace` so they do not fill the history:
 * they survive going to a detail page and back, and a reload. The page is not kept: changing a filter changes `key`,
 * and the list goes back to its first page. Unknown values are ignored. Text filters are written once the user stops
 * typing (`debounce` ms, 300 by default).
 *
 * The schema is read on every render: building it inline (for example with the translated labels) is fine.
 */
export function useListFilters<T = unknown>(
  schema: FilterSchema<T>,
  { debounce = 300 }: { debounce?: number } = {}
): ListFilters<T> {
  const [searchParams, setSearchParams] = useSearchParams();
  const latest = useRef(searchParams);
  latest.current = searchParams;
  const schemaRef = useRef(schema);
  schemaRef.current = schema;
  // Text typed and not yet written to the URL.
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const committedDrafts = useDebounce(drafts, debounce);

  const update = useCallback(
    (change: (params: URLSearchParams) => void) => {
      const next = new URLSearchParams(latest.current);
      change(next);
      dropInactive(schemaRef.current, next);
      latest.current = next;
      setSearchParams(next, { replace: true });
    },
    [setSearchParams]
  );

  useEffect(() => {
    const keys = Object.keys(committedDrafts).filter((key) => schemaRef.current[key]);
    if (keys.length === 0) return;
    update((params) => keys.forEach((key) => write(schemaRef.current, params, key, committedDrafts[key])));
    setDrafts((previous) => {
      const next = { ...previous };
      keys.forEach((key) => next[key] === committedDrafts[key] && delete next[key]);
      return next;
    });
  }, [committedDrafts, update]);

  const raw = readAll(schema, searchParams);
  const active = activeKeys(schema, raw);
  const applied: FilterValues = {};
  active.forEach((key) => {
    if (!isEmpty(raw[key])) applied[key] = raw[key];
  });
  const values: FilterValues = { ...applied };
  Object.entries(drafts).forEach(([key, text]) => {
    if (active.includes(key)) values[key] = text;
  });

  const set = useCallback(
    (key: string, value: FilterValue | null | undefined) => {
      const def = schemaRef.current[key];
      if (!def) return;
      if (def.kind === 'text') {
        setDrafts((previous) => ({ ...previous, [key]: typeof value === 'string' ? value : '' }));
        return;
      }
      update((params) => write(schemaRef.current, params, key, value));
    },
    [update]
  );

  const clear = useCallback(
    (key: string, value?: string) => {
      const def = schemaRef.current[key];
      if (!def) return;
      setDrafts((previous) => {
        if (!(key in previous)) return previous;
        const next = { ...previous };
        delete next[key];
        return next;
      });
      update((params) => {
        if (value !== undefined && def.kind === 'multiple') {
          const current = readAll(schemaRef.current, params)[key];
          write(
            schemaRef.current,
            params,
            key,
            (Array.isArray(current) ? current : []).filter((each) => each !== value)
          );
        } else write(schemaRef.current, params, key, null);
      });
    },
    [update]
  );

  const toggle = useCallback(
    (key: string, value: string) =>
      update((params) => {
        const current = readAll(schemaRef.current, params)[key];
        const list = Array.isArray(current) ? current : [];
        write(
          schemaRef.current,
          params,
          key,
          list.includes(value) ? list.filter((each) => each !== value) : [...list, value]
        );
      }),
    [update]
  );

  const clearAll = useCallback(() => {
    setDrafts({});
    update((params) =>
      Object.entries(schemaRef.current)
        .filter(([, def]) => def.chip !== false)
        .forEach(([key]) => write(schemaRef.current, params, key, null))
    );
  }, [update]);

  const filterKeys = Object.keys(applied).filter((key) => schema[key].chip !== false);
  const chips: FilterChip[] = filterKeys.flatMap((key) => {
    const def = schema[key];
    const value = applied[key]!;
    const format = def.format ?? ((each: string) => each);
    return (Array.isArray(value) ? value : [value]).map((each) => ({
      id: Array.isArray(value) ? `${key}:${each}` : key,
      filter: key,
      filterLabel: def.label,
      value: each,
      label: format(each),
      onDelete: () => clear(key, Array.isArray(value) ? each : undefined),
    }));
  });

  const rsql = Object.keys(applied)
    .map((key) => schema[key].toRsql?.(applied[key]!))
    .filter((condition): condition is string => !!condition)
    .join(';');

  const key = JSON.stringify(applied);
  const match = useMemo(() => {
    const parsed = JSON.parse(key) as FilterValues;
    return (entity: T) =>
      Object.entries(parsed).every(([filter, value]) => {
        const def = schemaRef.current[filter];
        return !def?.match || def.match(entity, value!);
      });
  }, [key]);

  return {
    values,
    get: (name) => {
      const value = values[name];
      return typeof value === 'string' ? value : '';
    },
    getAll: (name) => {
      const value = values[name];
      return Array.isArray(value) ? value : [];
    },
    set,
    toggle,
    clear,
    clearAll,
    isActive: (name) => active.includes(name),
    activeCount: filterKeys.length,
    chips,
    rsql,
    match,
    key,
  };
}
