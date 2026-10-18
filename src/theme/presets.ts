import { baseColors, fonts, gameColors } from './tokens';

export type ThemeMode = 'light' | 'dark';
export type ThemePreset = 'slate' | 'codex' | 'arcane' | 'ember';

/** Colors of one preset in one mode. */
export interface PresetPalette {
  primary: string;
  primaryContrast: string;
  secondary: string;
  background: { default: string; paper: string; light: string };
  divider: string;
  text: { primary: string; secondary: string; disabled: string };
  status: { success: string; error: string; warning: string; info: string };
  resource: { hp: string; pp: string; xp: string; fatigue: string };
}

/** A preset: its palettes and its personality (shape and display font). */
export interface PresetDefinition {
  /** `theme.shape.borderRadius`, the unit of `sx={{ borderRadius }}`. */
  borderRadius: number;
  /** Font of headings and entity names. */
  displayFont: string;
  displayWeight: number;
  displayLetterSpacing: string;
  dark: PresetPalette;
  light: PresetPalette;
}

const darkStatus = {
  success: baseColors.dark.success,
  error: baseColors.dark.error,
  warning: baseColors.dark.warning,
  info: baseColors.dark.info,
};
const lightStatus = { success: '#2e7d32', error: '#c4411b', warning: '#8a6d00', info: '#1565c0' };

/** Current look, refined: cold grey-green slate. */
const slate: PresetDefinition = {
  borderRadius: 10,
  displayFont: fonts.ui,
  displayWeight: 700,
  displayLetterSpacing: '-0.01em',
  dark: {
    primary: '#99b3b6',
    primaryContrast: '#060707',
    secondary: '#7f9497',
    background: { default: '#0a0c0c', paper: '#131515', light: '#1f2526' },
    divider: '#2a3234',
    text: { primary: '#c4d4d6', secondary: '#8fa3a6', disabled: '#5f6f72' },
    status: darkStatus,
    resource: gameColors.dark.resource,
  },
  light: {
    primary: '#3f5558',
    primaryContrast: '#ffffff',
    secondary: '#5d6c70',
    background: { default: '#f3f6f6', paper: '#ffffff', light: '#fafbfb' },
    divider: '#d3dcdd',
    text: { primary: '#1f2a2c', secondary: '#55666a', disabled: '#8b999c' },
    status: lightStatus,
    resource: gameColors.light.resource,
  },
};

/** Parchment and sepia, matching the pencil illustrations. */
const codex: PresetDefinition = {
  borderRadius: 8,
  displayFont: fonts.serif,
  displayWeight: 700,
  displayLetterSpacing: '0',
  dark: {
    primary: '#d8b27a',
    primaryContrast: '#1a130b',
    secondary: '#b89466',
    background: { default: '#16110b', paper: '#201911', light: '#2b2218' },
    divider: '#3d3122',
    text: { primary: '#eadfc8', secondary: '#bba98a', disabled: '#7a6a52' },
    status: darkStatus,
    resource: gameColors.dark.resource,
  },
  light: {
    primary: '#7a4b1e',
    primaryContrast: '#fbf6ea',
    secondary: '#7d6236',
    background: { default: '#ece2cc', paper: '#f8f2e4', light: '#fbf7ee' },
    divider: '#d6c6a2',
    text: { primary: '#2e2416', secondary: '#5a4932', disabled: '#9c8b70' },
    status: lightStatus,
    resource: gameColors.light.resource,
  },
};

/** Deep indigo with a gold accent. */
const arcane: PresetDefinition = {
  borderRadius: 14,
  displayFont: fonts.engraved,
  displayWeight: 600,
  displayLetterSpacing: '0.02em',
  dark: {
    primary: '#e0b860',
    primaryContrast: '#14112a',
    secondary: '#a597f2',
    background: { default: '#0c0b1a', paper: '#15132a', light: '#1f1c3b' },
    divider: '#2d2952',
    text: { primary: '#e6e3f5', secondary: '#a9a4cb', disabled: '#625d88' },
    status: darkStatus,
    resource: { ...gameColors.dark.resource, pp: '#a597f2' },
  },
  light: {
    primary: '#4b3aa8',
    primaryContrast: '#ffffff',
    secondary: '#8a6512',
    background: { default: '#f3f1fb', paper: '#ffffff', light: '#faf9fe' },
    divider: '#dcd7f0',
    text: { primary: '#1d1838', secondary: '#555075', disabled: '#9a95b8' },
    status: lightStatus,
    resource: { ...gameColors.light.resource, pp: '#4b3aa8' },
  },
};

/** Charcoal with an amber accent: the soberest, built for reading numbers. */
const ember: PresetDefinition = {
  borderRadius: 12,
  displayFont: fonts.ui,
  displayWeight: 800,
  displayLetterSpacing: '-0.02em',
  dark: {
    primary: '#f0a24a',
    primaryContrast: '#1a1206',
    secondary: '#d08a52',
    background: { default: '#0e0e0f', paper: '#18181a', light: '#232326' },
    divider: '#303034',
    text: { primary: '#ecebe8', secondary: '#a9a6a0', disabled: '#67645f' },
    status: darkStatus,
    resource: gameColors.dark.resource,
  },
  light: {
    primary: '#a85800',
    primaryContrast: '#ffffff',
    secondary: '#85532a',
    background: { default: '#f6f5f3', paper: '#ffffff', light: '#fbfaf9' },
    divider: '#e2dfda',
    text: { primary: '#1e1c1a', secondary: '#5b5751', disabled: '#a29d95' },
    status: lightStatus,
    resource: gameColors.light.resource,
  },
};

export const themePresets: Record<ThemePreset, PresetDefinition> = { slate, codex, arcane, ember };

export const themePresetNames = Object.keys(themePresets) as ThemePreset[];
