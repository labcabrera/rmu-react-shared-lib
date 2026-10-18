import React, { ReactNode, useEffect, useMemo } from 'react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import '@fontsource-variable/inter';
import '@fontsource/cinzel/600.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/700.css';
import type { Decorator, Preview } from '@storybook/react-vite';
import { createAppTheme, ThemeConfig } from '../src/theme/createAppTheme';
import { themePresetNames } from '../src/theme/presets';
import { i18n, loadLocales } from './i18n';

type Globals = Partial<ThemeConfig> & { locale?: string };

const Providers = ({
  globals: { locale, preset, mode, density },
  children,
}: {
  globals: Globals;
  children: ReactNode;
}) => {
  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);
  const theme = useMemo(() => createAppTheme({ preset, mode, density }), [preset, mode, density]);
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <MemoryRouter>{children}</MemoryRouter>
      </ThemeProvider>
    </I18nextProvider>
  );
};

const withProviders: Decorator = (Story, context) => (
  <Providers globals={context.globals as Globals}>
    <Story />
  </Providers>
);

const toolbar = (description: string, icon: string, values: string[]) => ({
  description,
  toolbar: { icon, items: values.map((value) => ({ value, title: value })), dynamicTitle: true },
});

// Viewports used by the UI review (docs/ui-review in the workspace meta-repo).
const viewports = {
  mobile: { name: 'Mobile 390', styles: { width: '390px', height: '844px' }, type: 'mobile' },
  tablet: { name: 'Tablet 820', styles: { width: '820px', height: '1180px' }, type: 'tablet' },
  desktop: { name: 'Desktop 1440', styles: { width: '1440px', height: '900px' }, type: 'desktop' },
};

const preview: Preview = {
  decorators: [withProviders],
  loaders: [loadLocales],
  globalTypes: {
    preset: toolbar('Theme preset', 'paintbrush', themePresetNames),
    mode: toolbar('Light or dark', 'contrast', ['dark', 'light']),
    density: toolbar('Density', 'component', ['comfortable', 'compact']),
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
  initialGlobals: { locale: 'en', preset: 'slate', mode: 'dark', density: 'comfortable' },
  parameters: {
    layout: 'padded',
    viewport: { options: viewports },
    controls: { matchers: { color: /(background|color)$/i } },
  },
};

export default preview;
