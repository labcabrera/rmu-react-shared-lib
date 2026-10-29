import { useEffect, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContextProps, useAuth } from 'react-oidc-context';
import { fetchEnumerations } from '../../api/enumerations.api';

/**
 * Names of the enumerations by key (spec 050). Sheets, races and cultures store the normalized key of a specialization
 * (`black-speech`); the page shows the translation of the key when there is one, otherwise the name the user wrote
 * (`Black Speech`). The catalog is loaded once per page and shared by every component.
 */
let names = new Map<string, string>();
let loading: Promise<void> | null = null;
let version = 0;
const listeners = new Set<() => void>();

const PAGE_SIZE = 1000;

const notify = () => {
  version++;
  listeners.forEach((listener) => listener());
};

export async function loadEnumerationNames(auth: AuthContextProps): Promise<void> {
  if (loading) return loading;
  loading = (async () => {
    const loaded = new Map<string, string>();
    for (let page = 0; ; page++) {
      const result = await fetchEnumerations('', page, PAGE_SIZE, auth);
      // A realm entry wins over a global one with the same key
      [...result.content]
        .sort((a, b) => Number(!!a.realmId) - Number(!!b.realmId))
        .forEach((enumeration) => loaded.set(enumeration.key, enumeration.name ?? enumeration.key));
      if (page + 1 >= result.pagination.totalPages) break;
    }
    names = loaded;
    notify();
  })().catch((error: unknown) => {
    // Without names the keys are shown; a later page load tries again
    loading = null;
    console.warn('Enumeration names not loaded', error);
  });
  return loading;
}

/** The stored name of a key, if the catalog has it. */
export const enumerationName = (key: string): string | undefined => names.get(key);

/** Forgets the loaded names: after an enumeration is created, renamed or deleted. */
export function resetEnumerationNames(): void {
  loading = null;
  names = new Map();
  notify();
}

/** Label of a specialization key: its translation, else the name of the catalog, else the key itself. */
export const specializationLabel = (
  t: (key: string, options?: Record<string, unknown>) => string,
  key: string | null | undefined
) => (key ? t(key, { defaultValue: names.get(key) ?? key }) : '');

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/**
 * Loads the names (once) and re-renders the component when they arrive. Returns the label function, which also changes
 * with the language.
 */
export function useSpecializationLabel(): (key: string | null | undefined) => string {
  // Undefined outside an AuthProvider (stories, tests): the keys are shown
  const auth = useAuth() as AuthContextProps | undefined;
  const { t } = useTranslation();
  useSyncExternalStore(subscribe, () => version);
  useEffect(() => {
    if (auth?.isAuthenticated) void loadEnumerationNames(auth);
  }, [auth]);
  return (key) => specializationLabel(t, key);
}
