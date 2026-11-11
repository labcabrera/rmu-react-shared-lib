import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/** Fills `{{name}}` in a default text of MDXEditor. */
const interpolate = (text: string, values?: Record<string, unknown>): string =>
  values
    ? text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name: string) => (name in values ? String(values[name]) : match))
    : text;

/**
 * The `translation` of MDXEditor through i18next (workspace spec 102). Its keys (`toolbar.bold`) are looked up as
 * `markdown-editor-toolbar.bold` in common; a key without a text keeps the editor's English default.
 */
export const useMdxTranslation = () => {
  const { t, i18n } = useTranslation();
  return useCallback(
    (key: string, defaultValue: string, interpolations?: Record<string, unknown>): string => {
      const own = `markdown-editor-${key}`;
      if (!i18n?.exists?.(own, { keySeparator: false })) return interpolate(defaultValue, interpolations);
      return t(own, { ...interpolations, keySeparator: false, defaultValue });
    },
    [t, i18n]
  );
};
