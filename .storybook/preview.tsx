import React, { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { withThemeFromJSXProvider } from '@storybook/addon-themes';
import type { Decorator, Preview } from '@storybook/react-vite';
import { createAppTheme } from '../src/theme/createAppTheme';
import { i18n, loadLocales } from './i18n';

const withProviders: Decorator = (Story, context) => {
  const locale = context.globals.locale as string;
  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);
  return (
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    </I18nextProvider>
  );
};

// Viewports used by the UI review (docs/ui-review in the workspace meta-repo).
const viewports = {
  mobile: { name: 'Mobile 390', styles: { width: '390px', height: '844px' }, type: 'mobile' },
  tablet: { name: 'Tablet 820', styles: { width: '820px', height: '1180px' }, type: 'tablet' },
  desktop: { name: 'Desktop 1440', styles: { width: '1440px', height: '900px' }, type: 'desktop' },
};

const preview: Preview = {
  decorators: [
    withProviders,
    withThemeFromJSXProvider({
      themes: { dark: createAppTheme('dark'), light: createAppTheme('light') },
      defaultTheme: 'dark',
      Provider: ThemeProvider,
      GlobalStyles: CssBaseline,
    }),
  ],
  loaders: [loadLocales],
  globalTypes: {
    locale: {
      description: 'Language',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', title: 'English' },
          { value: 'es', title: 'Español' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { locale: 'en' },
  parameters: {
    layout: 'padded',
    viewport: { options: viewports },
    controls: { matchers: { color: /(background|color)$/i } },
  },
};

export default preview;
