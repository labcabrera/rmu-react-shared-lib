import { initReactI18next } from 'react-i18next';
import i18next from 'i18next';

export const i18n = i18next.createInstance();

const languages = ['en', 'es'];
const namespaces = ['common', 'items'];
let loading: Promise<unknown> | undefined;

const fetchLocale = (ns: string, lng: string): Promise<Record<string, string>> =>
  fetch(`/mfe/assets/locales/${ns}_${lng}.json`)
    .then((response) => (response.ok ? response.json() : {}))
    .catch(() => ({}));

// Same namespaces as the shell (rmu-mfe-shell/src/i18n/i18n.ts), loaded once for every story.
export const loadLocales = async () => {
  loading ??= Promise.all(
    languages.flatMap((lng) => namespaces.map(async (ns) => ({ lng, ns, data: await fetchLocale(ns, lng) })))
  ).then((entries) => {
    const resources: Record<string, Record<string, Record<string, string>>> = {};
    entries.forEach(({ lng, ns, data }) => {
      resources[lng] = { ...resources[lng], [ns]: data };
    });
    return i18n.use(initReactI18next).init({
      lng: 'en',
      fallbackLng: 'en',
      ns: namespaces,
      defaultNS: 'common',
      fallbackNS: 'items',
      resources,
      returnNull: false,
      interpolation: { escapeValue: false },
    });
  });
  await loading;
  return {};
};
