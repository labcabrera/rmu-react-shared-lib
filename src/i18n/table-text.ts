import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/** Namespace with the translations of the texts of the attack, critical, fumble and spell failure tables. */
export const TABLES_NAMESPACE = 'tables';

/**
 * Workspace spec 086: the English text of a table entry is its own key. Returns a function that gives its translation
 * in the current language, or the text itself when there is none (English, or not translated yet). The namespace
 * loads the first time it is needed without suspending: until then, and while it loads, the text shows in English.
 */
export const useTableText = (): ((text: string | null | undefined) => string) => {
  const { t } = useTranslation(TABLES_NAMESPACE, { useSuspense: false });
  return useCallback(
    (text) => {
      if (!text) return '';
      // The texts carry '.' and ':', which i18next would read as key and namespace separators.
      const translated = t(text, { keySeparator: false, nsSeparator: false, defaultValue: text });
      return typeof translated === 'string' && translated ? translated : text;
    },
    [t]
  );
};
