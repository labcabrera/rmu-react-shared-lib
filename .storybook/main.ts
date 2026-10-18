import type { StorybookConfig } from '@storybook/react-vite';

// Images and locales come from rmu-mfe-assets through the local gateway (rmu-platform), at the same
// /mfe/assets/ path the shell uses. Without the stack running, stories render with i18n keys and no images.
const gatewayUri = process.env.RMU_GATEWAY_URI ?? 'http://localhost';
const assetsUri = process.env.RMU_MFE_ASSETS_URI ?? '/mfe/assets/';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-themes'],
  framework: { name: '@storybook/react-vite', options: {} },
  core: { disableTelemetry: true },
  viteFinal: async (viteConfig) => ({
    ...viteConfig,
    // The lib reads process.env.RMU_* (each MFE's webpack rewrites it to window.__RMU_CONFIG__).
    define: {
      ...viteConfig.define,
      'process.env.RMU_MFE_ASSETS_URI': JSON.stringify(assetsUri),
      'process.env': '{}',
    },
    server: { ...viteConfig.server, proxy: { '/mfe': gatewayUri } },
  }),
};

export default config;
