import { createTheme, PaletteOptions, responsiveFontSizes, Theme } from '@mui/material/styles';
import { baseColors } from './tokens';

declare module '@mui/material/styles' {
  interface TypeBackground {
    /** Raised surface, lighter than `paper` in dark mode. */
    light: string;
  }
  interface TypeBackgroundOptions {
    light?: string;
  }
}

export type ThemeMode = 'light' | 'dark';

const palettes: Record<ThemeMode, PaletteOptions> = {
  dark: {
    mode: 'dark',
    primary: {
      main: baseColors.dark.haze,
      light: baseColors.dark.haze,
      dark: baseColors.dark.midSlate,
      contrastText: baseColors.dark.almostBlack,
    },
    secondary: {
      main: baseColors.dark.mist,
      light: baseColors.dark.haze,
      dark: baseColors.dark.midSlate,
      contrastText: baseColors.dark.surfaceLight,
    },
    background: {
      default: baseColors.dark.almostBlack,
      light: baseColors.dark.darkSlate,
      paper: baseColors.dark.backgroundDark,
    },
    divider: baseColors.dark.darkSlate,
    text: {
      primary: baseColors.dark.haze,
      secondary: baseColors.dark.mist,
      disabled: baseColors.dark.disabledLight,
    },
    success: { main: baseColors.dark.success },
    error: { main: baseColors.dark.error },
    warning: { main: baseColors.dark.warning },
    info: { main: baseColors.dark.info },
  },
  light: {
    mode: 'light',
    primary: {
      main: baseColors.light.midSlate,
      light: baseColors.light.mist,
      dark: baseColors.light.almostBlack,
      contrastText: baseColors.light.paperLight,
    },
    secondary: {
      main: baseColors.light.mist,
      light: baseColors.light.haze,
      dark: baseColors.light.midSlate,
      contrastText: baseColors.light.paperLight,
    },
    background: {
      default: baseColors.light.surfaceLight,
      light: baseColors.light.paperLight,
      paper: baseColors.light.paperLight,
    },
    divider: baseColors.light.haze,
    text: {
      primary: baseColors.light.textLight,
      secondary: baseColors.light.mutedLight,
      disabled: baseColors.light.disabledLight,
    },
    success: { main: baseColors.light.success },
    error: { main: baseColors.light.error },
    warning: { main: baseColors.light.warning },
    info: { main: baseColors.light.info },
  },
};

/** MUI theme of the RMU applications. The shell provides it; remotes read it from the context. */
export const createAppTheme = (mode: ThemeMode = 'dark'): Theme => {
  const base = createTheme({ palette: palettes[mode] ?? palettes.dark });
  // Phones: every icon button, button and pagination item is at least 44 px, the minimum comfortable touch target.
  const touchTarget = { [base.breakpoints.down('sm')]: { minWidth: 44, minHeight: 44 } };
  return responsiveFontSizes(
    createTheme(base, {
      components: {
        MuiIconButton: { styleOverrides: { root: touchTarget } },
        MuiButton: { styleOverrides: { root: { [base.breakpoints.down('sm')]: { minHeight: 44 } } } },
        MuiToggleButton: { styleOverrides: { root: touchTarget } },
        MuiPaginationItem: { styleOverrides: { root: touchTarget } },
        MuiTableSortLabel: { styleOverrides: { root: { [base.breakpoints.down('sm')]: { minHeight: 44 } } } },
        // The close button of alerts and snackbars is sized by MuiAlert, which wins over MuiIconButton.
        MuiAlert: {
          styleOverrides: {
            action: {
              [base.breakpoints.down('sm')]: { '& .MuiIconButton-root': touchTarget[base.breakpoints.down('sm')] },
            },
          },
        },
        // Tab bars never overflow the page: they scroll, with arrows on every device.
        MuiTabs: { defaultProps: { variant: 'scrollable', scrollButtons: 'auto', allowScrollButtonsMobile: true } },
      },
    })
  );
};
