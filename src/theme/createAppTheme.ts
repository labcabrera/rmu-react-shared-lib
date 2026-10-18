import { alpha, createTheme, PaletteOptions, responsiveFontSizes, Shadows, Theme } from '@mui/material/styles';
import { PresetPalette, ThemeMode, ThemePreset, themePresetNames, themePresets } from './presets';
import { fonts, gameColors, motion, radius } from './tokens';

export type { ThemeMode, ThemePreset } from './presets';
export type ThemeDensity = 'comfortable' | 'compact';

/** What the user picks: palette and personality, light or dark, and how much fits on screen. */
export interface ThemeConfig {
  preset: ThemePreset;
  mode: ThemeMode;
  density: ThemeDensity;
}

export const defaultThemeConfig: ThemeConfig = { preset: 'slate', mode: 'dark', density: 'comfortable' };

type ResourceColors = PresetPalette['resource'];
type RarityColors = (typeof gameColors)['dark']['rarity'];
type CombatColors = Record<keyof (typeof gameColors)['dark']['combat'], string>;
type StatColors = { positive: string; negative: string; neutral: string };

declare module '@mui/material/styles' {
  interface TypeBackground {
    /** Raised surface, lighter than `paper` in dark mode. */
    light: string;
  }
  interface TypeBackgroundOptions {
    light?: string;
  }
  interface Palette {
    /** Bonus colors: positive and negative modifiers. */
    stat: StatColors;
    /** Hit points, power points, experience and fatigue bars. */
    resource: ResourceColors;
    /** Item rarity, keyed like `ItemRarity` in camelCase. */
    rarity: Record<keyof RarityColors, string>;
    /** Combat dashboard: one color per action category and per action state. */
    combat: CombatColors;
    /** One color per faction of a combat, by position (see `factionColor`). */
    factions: readonly string[];
  }
  interface PaletteOptions {
    stat?: StatColors;
    resource?: ResourceColors;
    rarity?: Record<keyof RarityColors, string>;
    combat?: CombatColors;
    factions?: readonly string[];
  }
  interface Theme {
    preset: ThemePreset;
    density: ThemeDensity;
    /** Corner radius scale in px. */
    radius: typeof radius;
    motion: typeof motion;
    fonts: { ui: string; display: string };
  }
  interface ThemeOptions {
    preset?: ThemePreset;
    density?: ThemeDensity;
    radius?: typeof radius;
    motion?: typeof motion;
    fonts?: { ui: string; display: string };
  }
}

const isMode = (value: unknown): value is ThemeMode => value === 'light' || value === 'dark';
const isPreset = (value: unknown): value is ThemePreset => themePresetNames.includes(value as ThemePreset);
const isDensity = (value: unknown): value is ThemeDensity => value === 'comfortable' || value === 'compact';

/**
 * Reads a stored theme config (an object, its JSON or the old `'light' | 'dark'` mode string).
 * Unknown or missing fields take the default, so a stale value never breaks the app.
 */
export const parseThemeConfig = (value: unknown): ThemeConfig => {
  let raw: unknown = value;
  if (typeof raw === 'string') {
    if (isMode(raw)) return { ...defaultThemeConfig, mode: raw };
    try {
      raw = JSON.parse(raw);
    } catch {
      return defaultThemeConfig;
    }
  }
  if (!raw || typeof raw !== 'object') return defaultThemeConfig;
  const { preset, mode, density } = raw as Partial<ThemeConfig>;
  return {
    preset: isPreset(preset) ? preset : defaultThemeConfig.preset,
    mode: isMode(mode) ? mode : defaultThemeConfig.mode,
    density: isDensity(density) ? density : defaultThemeConfig.density,
  };
};

const toPalette = (mode: ThemeMode, colors: PresetPalette): PaletteOptions => ({
  mode,
  primary: { main: colors.primary, contrastText: colors.primaryContrast },
  secondary: { main: colors.secondary },
  background: colors.background,
  divider: colors.divider,
  text: colors.text,
  success: { main: colors.status.success },
  error: { main: colors.status.error },
  warning: { main: colors.status.warning },
  info: { main: colors.status.info },
  stat: { positive: colors.status.success, negative: colors.status.error, neutral: colors.text.secondary },
  resource: colors.resource,
  rarity: gameColors[mode].rarity,
  combat: gameColors[mode].combat,
  factions: gameColors[mode].factions,
});

/** Soft, wide shadows: a light lift instead of MUI's hard material shadows. */
const softShadows = (mode: ThemeMode): Shadows => {
  const color = mode === 'dark' ? '0, 0, 0' : '31, 42, 44';
  const strength = mode === 'dark' ? 0.45 : 0.1;
  const levels = Array.from({ length: 24 }, (_, i) => {
    const elevation = i + 1;
    const y = Math.round(elevation * 0.6 + 1);
    const blur = Math.round(elevation * 2 + 2);
    return `0 ${y}px ${blur}px rgba(${color}, ${strength}), 0 1px 2px rgba(${color}, ${strength * 0.6})`;
  });
  return ['none', ...levels] as Shadows;
};

/**
 * MUI theme of the RMU applications. The shell provides it; remotes read it from the context.
 * Accepts the full config or, for older callers, only the mode.
 */
export const createAppTheme = (config: Partial<ThemeConfig> | ThemeMode = defaultThemeConfig): Theme => {
  const { preset, mode, density } = parseThemeConfig(config);
  const definition = themePresets[preset];
  const colors = definition[mode];
  const compact = density === 'compact';
  const display = {
    fontFamily: definition.displayFont,
    fontWeight: definition.displayWeight,
    letterSpacing: definition.displayLetterSpacing,
    // Serif display fonts default to old-style figures; numbers in headings (bonuses) line up instead.
    fontVariantNumeric: 'lining-nums tabular-nums',
  };

  const base = createTheme({
    palette: toPalette(mode, colors),
    shape: { borderRadius: definition.borderRadius },
    shadows: softShadows(mode),
    typography: {
      fontFamily: fonts.ui,
      h1: display,
      h2: display,
      h3: display,
      h4: display,
      // h5 and h6 title cards and dialogs, and some pages use them for body text: they keep the UI font.
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { fontWeight: 600, textTransform: 'none' },
      overline: { fontWeight: 600, letterSpacing: '0.08em' },
    },
    preset,
    density,
    radius,
    motion,
    fonts: { ui: fonts.ui, display: definition.displayFont },
  });
  const { palette, breakpoints } = base;
  const transition = (...props: string[]) =>
    props.map((p) => `${p} ${motion.duration.base}ms ${motion.easing.standard}`).join(', ');
  // Phones: every icon button, button and pagination item is at least 44 px, the minimum comfortable touch target.
  const touchTarget = { [breakpoints.down('sm')]: { minWidth: 44, minHeight: 44 } };
  const small = compact ? { defaultProps: { size: 'small' as const } } : {};
  const cardPadding = compact ? 12 : 16;
  const raised = { backgroundColor: palette.background.light, border: `1px solid ${palette.divider}` };

  return responsiveFontSizes(
    createTheme(base, {
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: { fontVariantNumeric: 'tabular-nums', scrollbarColor: `${palette.divider} transparent` },
            '::selection': { backgroundColor: alpha(palette.primary.main, 0.3) },
            // Page changes started with useViewTransitionNavigate cross-fade with the theme's timing.
            '::view-transition-old(root), ::view-transition-new(root)': {
              animationDuration: `${motion.duration.base}ms`,
              animationTimingFunction: motion.easing.standard,
            },
            '::view-transition-group(*)': {
              animationDuration: `${motion.duration.slow}ms`,
              animationTimingFunction: motion.easing.emphasized,
            },
            '@media (prefers-reduced-motion: reduce)': {
              '*, *::before, *::after': {
                animationDuration: '0.01ms !important',
                animationIterationCount: '1 !important',
                transitionDuration: '0.01ms !important',
                scrollBehavior: 'auto !important',
              },
            },
          },
        },
        // Flat surfaces separated by borders; the elevation overlay of dark mode is replaced by the palette.
        MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
        MuiCard: {
          defaultProps: { elevation: 0 },
          styleOverrides: {
            root: {
              borderRadius: radius.md,
              border: `1px solid ${palette.divider}`,
              transition: transition('box-shadow', 'border-color', 'transform'),
            },
          },
        },
        MuiCardContent: {
          styleOverrides: { root: { padding: cardPadding, '&:last-child': { paddingBottom: cardPadding } } },
        },
        MuiAppBar: {
          defaultProps: { elevation: 0, color: 'inherit' },
          styleOverrides: {
            root: {
              backgroundColor: alpha(palette.background.paper, 0.82),
              backdropFilter: 'blur(12px)',
              borderBottom: `1px solid ${palette.divider}`,
            },
          },
        },
        MuiDrawer: { styleOverrides: { paper: { borderColor: palette.divider } } },
        MuiMenu: { styleOverrides: { paper: raised } },
        MuiPopover: { styleOverrides: { paper: raised } },
        MuiDialog: {
          styleOverrides: { paper: { borderRadius: radius.lg }, paperFullScreen: { borderRadius: 0 } },
        },
        MuiButton: {
          defaultProps: { disableElevation: true, ...(compact && { size: 'small' as const }) },
          styleOverrides: {
            root: { borderRadius: radius.sm, [breakpoints.down('sm')]: { minHeight: 44 } },
          },
        },
        MuiIconButton: { ...small, styleOverrides: { root: touchTarget } },
        MuiToggleButton: { ...small, styleOverrides: { root: { textTransform: 'none', ...touchTarget } } },
        MuiChip: { ...small, styleOverrides: { root: { fontWeight: 500 } } },
        MuiTextField: small,
        MuiFormControl: small,
        MuiAutocomplete: small,
        MuiList: compact ? { defaultProps: { dense: true } } : {},
        // The selected item (navigation, menus) takes the accent color, not only a tinted background.
        MuiListItemButton: {
          styleOverrides: {
            root: {
              '&.Mui-selected': {
                color: palette.primary.main,
                '& .MuiListItemIcon-root': { color: palette.primary.main },
              },
            },
          },
        },
        MuiTable: small,
        MuiTableCell: {
          styleOverrides: {
            root: { borderColor: palette.divider },
            head: {
              fontWeight: 600,
              fontSize: '0.75rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: palette.text.secondary,
            },
          },
        },
        MuiTableRow: {
          styleOverrides: {
            root: { '&.MuiTableRow-hover:hover': { backgroundColor: alpha(palette.primary.main, 0.06) } },
          },
        },
        MuiTableSortLabel: { styleOverrides: { root: { [breakpoints.down('sm')]: { minHeight: 44 } } } },
        MuiOutlinedInput: { styleOverrides: { root: { borderRadius: radius.sm } } },
        MuiPaginationItem: { styleOverrides: { root: { borderRadius: radius.sm, ...touchTarget } } },
        // Tab bars never overflow the page: they scroll, with arrows on every device.
        MuiTabs: {
          defaultProps: { variant: 'scrollable', scrollButtons: 'auto', allowScrollButtonsMobile: true },
          styleOverrides: { indicator: { height: 3, borderRadius: 3 } },
        },
        MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, minHeight: 44 } } },
        MuiTooltip: {
          styleOverrides: {
            tooltip: {
              ...raised,
              color: palette.text.primary,
              fontSize: '0.8rem',
              borderRadius: radius.sm,
              boxShadow: base.shadows[4],
            },
            arrow: { color: palette.background.light },
          },
        },
        // Loading placeholders shimmer instead of pulsing.
        MuiSkeleton: { defaultProps: { animation: 'wave' } },
        MuiLinearProgress: {
          styleOverrides: { root: { height: 6, borderRadius: 999 }, bar: { borderRadius: 999 } },
        },
        // The close button of alerts and snackbars is sized by MuiAlert, which wins over MuiIconButton.
        MuiAlert: {
          styleOverrides: {
            root: { borderRadius: radius.md },
            action: { [breakpoints.down('sm')]: { '& .MuiIconButton-root': touchTarget[breakpoints.down('sm')] } },
          },
        },
      },
    })
  );
};

/** The colors a theme picker shows for a preset: surface, paper, accent and secondary accent. */
export const presetSwatch = (preset: ThemePreset, mode: ThemeMode) => {
  const colors = themePresets[preset][mode];
  return {
    background: colors.background.default,
    paper: colors.background.paper,
    primary: colors.primary,
    secondary: colors.secondary,
    text: colors.text.primary,
  };
};
