import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { normalizeText } from '../rmu/item/item-catalog';

/** Namespace with the translations of the names of the book spells and spell lists, keyed by the English name. */
export const SPELL_NAMES_NAMESPACE = 'spell-names';

/** Namespace with the translated descriptions of one book spell list. */
export const spellTextNamespace = (listCode: string) => `spell-text/${listCode}`;

/** Key of the description of a list inside its namespace. */
const LIST_DESCRIPTION_KEY = 'description';

/** Key of the description of the spell of a level inside the namespace of its list. */
const spellKey = (level: number) => `level-${level}`;

/**
 * Workspace spec 088: the English name of a spell or spell list is its own key. Returns a function that gives its
 * translation in the current language, or the name itself when there is none (English, a user's own spell, or not
 * loaded yet). Reads the namespace directly, so that a name never matches a key of the other namespaces.
 * Without an i18next instance (a component rendered alone) `i18n` is empty and the name shows as it is.
 */
export const useSpellName = (): ((name: string | null | undefined) => string) => {
  const { t, i18n } = useTranslation(SPELL_NAMES_NAMESPACE, { useSuspense: false });
  return useCallback(
    (name) => {
      if (!name) return '';
      // The names may carry '.', which i18next would read as a key separator.
      const translated = i18n.getResource?.(i18n.language, SPELL_NAMES_NAMESPACE, name, { keySeparator: false });
      return typeof translated === 'string' && translated ? translated : name;
    },
    // `t` changes when the namespace finishes loading
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n]
  );
};

export type SpellText = {
  /** The description of the spell of a level, or `original` when it has no translation. */
  spell: (level: number, original: string | null | undefined) => string;
  /** The description of the list, or `original` when it has no translation. */
  list: (original: string | null | undefined) => string;
};

/**
 * Workspace spec 088: the translated descriptions of a book spell list, loaded when the list is shown. A list without
 * `code` is not from the book and requests nothing; its texts show as they are.
 */
export const useSpellText = (listCode: string | null | undefined): SpellText => {
  const namespace = listCode ? spellTextNamespace(listCode) : SPELL_NAMES_NAMESPACE;
  const { t, i18n } = useTranslation(namespace, { useSuspense: false });
  return useMemo(() => {
    const lookup = (key: string, original: string | null | undefined) => {
      const translated = listCode ? i18n.getResource?.(i18n.language, namespace, key) : undefined;
      return typeof translated === 'string' && translated ? translated : (original ?? '');
    };
    return {
      spell: (level, original) => lookup(spellKey(level), original),
      list: (original) => lookup(LIST_DESCRIPTION_KEY, original),
    };
    // `t` changes when the namespace finishes loading
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, i18n, namespace, listCode]);
};

/**
 * Workspace spec 088: the English names whose translation contains `text`, for searching by the translated name in an
 * API that only knows the English one. Empty until the namespace has loaded, and in English.
 */
export const useSpellNameMatches = (): ((text: string) => string[]) => {
  const { t, i18n } = useTranslation(SPELL_NAMES_NAMESPACE, { useSuspense: false });
  return useCallback(
    (text) => {
      const names = i18n.getResourceBundle?.(i18n.language, SPELL_NAMES_NAMESPACE) as
        Record<string, string> | undefined;
      const query = normalizeText(text.trim());
      if (!names || !query) return [];
      return Object.keys(names).filter((name) => normalizeText(names[name]).includes(query));
    },
    // `t` changes when the namespace finishes loading
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n]
  );
};

/** Limit of names sent to the API, so that the query fits in a URL. */
export const SPELL_NAME_MATCHES_MAX = 100;

const quoteRsql = (value: string) => `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

/** RSQL of a search by name: the text in the English name, or any of the English names its translation matched. */
export const spellNameRsql = (text: string, matches: string[]): string => {
  const typed = `name=re=${quoteRsql(text)}`;
  if (matches.length === 0) return typed;
  return `(${typed},name=in=(${matches.slice(0, SPELL_NAME_MATCHES_MAX).map(quoteRsql).join(',')}))`;
};

/**
 * The translated name where only a `t` is at hand. The namespace has to be loaded by a `useSpellName` of the screen;
 * until then the name shows in English.
 */
export const translateSpellName = (t: TFunction, name: string): string =>
  t(name, { ns: SPELL_NAMES_NAMESPACE, keySeparator: false, nsSeparator: false, defaultValue: name });
