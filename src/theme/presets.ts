import { baseColors, fonts, gameColors } from './tokens';

export type ThemeMode = 'light' | 'dark';
export type ThemePreset =
  | 'slate'
  | 'codex'
  | 'arcane'
  | 'ember'
  | 'forest'
  | 'forge'
  | 'abyss'
  | 'royal'
  | 'frost'
  | 'desert'
  | 'ink'
  | 'code';

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
  /** Font of the rest of the interface; the shared UI font when omitted. */
  uiFont?: string;
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
    // Candle-lit leather: lighter than the other dark presets.
    background: { default: '#2a2219', paper: '#342a1f', light: '#3e3326' },
    divider: '#56483a',
    text: { primary: '#f3e9d6', secondary: '#d2c3a6', disabled: '#8f7f66' },
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

/** Elven forest: green-black woods, moss accent, gold secondary. */
const forest: PresetDefinition = {
  borderRadius: 12,
  displayFont: fonts.serif,
  displayWeight: 700,
  displayLetterSpacing: '0',
  dark: {
    primary: '#9cc98a',
    primaryContrast: '#0f1a0f',
    secondary: '#d4b86a',
    background: { default: '#0b120c', paper: '#121b13', light: '#1b261c' },
    divider: '#2a3a2b',
    text: { primary: '#e2ecdf', secondary: '#a9bba5', disabled: '#627360' },
    status: darkStatus,
    resource: gameColors.dark.resource,
  },
  light: {
    primary: '#3f6b34',
    primaryContrast: '#ffffff',
    secondary: '#7f6512',
    background: { default: '#eef2ea', paper: '#ffffff', light: '#f7f9f4' },
    divider: '#d0dccb',
    text: { primary: '#1c2a1a', secondary: '#4e5f4a', disabled: '#94a18f' },
    status: lightStatus,
    resource: gameColors.light.resource,
  },
};

/** Dwarven forge: warm stone, copper accent, steel secondary. */
const forge: PresetDefinition = {
  borderRadius: 6,
  displayFont: fonts.engraved,
  displayWeight: 700,
  displayLetterSpacing: '0.03em',
  dark: {
    primary: '#e0a070',
    primaryContrast: '#1c120b',
    secondary: '#a9b4bd',
    background: { default: '#13110f', paper: '#1c1916', light: '#27231f' },
    divider: '#3a342e',
    text: { primary: '#ede6de', secondary: '#b3a99e', disabled: '#6f665d' },
    status: darkStatus,
    resource: gameColors.dark.resource,
  },
  light: {
    primary: '#9a4f1c',
    primaryContrast: '#ffffff',
    secondary: '#4f5a63',
    background: { default: '#f1eeea', paper: '#ffffff', light: '#f8f6f3' },
    divider: '#ddd5cc',
    text: { primary: '#26201b', secondary: '#5c534a', disabled: '#a39a90' },
    status: lightStatus,
    resource: gameColors.light.resource,
  },
};

/** Deep sea: petrol blue depths, turquoise accent. */
const abyss: PresetDefinition = {
  borderRadius: 14,
  displayFont: fonts.ui,
  displayWeight: 700,
  displayLetterSpacing: '-0.01em',
  dark: {
    primary: '#5fd4c4',
    primaryContrast: '#06201d',
    secondary: '#8fb7c9',
    background: { default: '#071318', paper: '#0d1d24', light: '#142932' },
    divider: '#1f3a45',
    text: { primary: '#dcecf0', secondary: '#9ab6be', disabled: '#557079' },
    status: darkStatus,
    resource: gameColors.dark.resource,
  },
  light: {
    primary: '#0b6e64',
    primaryContrast: '#ffffff',
    secondary: '#345f71',
    background: { default: '#eaf3f4', paper: '#ffffff', light: '#f4f9f9' },
    divider: '#cbe0e3',
    text: { primary: '#10292f', secondary: '#45626a', disabled: '#8ea6ac' },
    status: lightStatus,
    resource: gameColors.light.resource,
  },
};

/** Royal court: plum velvet, lilac accent, gold secondary. */
const royal: PresetDefinition = {
  borderRadius: 10,
  displayFont: fonts.engraved,
  displayWeight: 600,
  displayLetterSpacing: '0.02em',
  dark: {
    primary: '#cfa8e8',
    primaryContrast: '#1d1026',
    secondary: '#e3c06a',
    background: { default: '#140d18', paper: '#1d1423', light: '#281d30' },
    divider: '#3a2b45',
    text: { primary: '#efe5f4', secondary: '#b9a8c4', disabled: '#6f6079' },
    status: darkStatus,
    resource: gameColors.dark.resource,
  },
  light: {
    primary: '#6b3a8c',
    primaryContrast: '#ffffff',
    secondary: '#7f6010',
    background: { default: '#f4eff6', paper: '#ffffff', light: '#faf7fb' },
    divider: '#e0d4e7',
    text: { primary: '#26182f', secondary: '#5d4d68', disabled: '#a294ab' },
    status: lightStatus,
    resource: gameColors.light.resource,
  },
};

/** Frozen north: cold slate, ice cyan accent. */
const frost: PresetDefinition = {
  borderRadius: 12,
  displayFont: fonts.ui,
  displayWeight: 700,
  displayLetterSpacing: '0.01em',
  dark: {
    primary: '#9bd8ec',
    primaryContrast: '#0b1a20',
    secondary: '#b8c4d0',
    background: { default: '#0d1116', paper: '#151b22', light: '#1e262f' },
    divider: '#2c3743',
    text: { primary: '#e6edf3', secondary: '#a7b4c0', disabled: '#64707c' },
    status: darkStatus,
    resource: gameColors.dark.resource,
  },
  light: {
    primary: '#1f6a85',
    primaryContrast: '#ffffff',
    secondary: '#4f5f6e',
    background: { default: '#eef3f7', paper: '#ffffff', light: '#f6f9fb' },
    divider: '#d3dee7',
    text: { primary: '#17222b', secondary: '#4b5a67', disabled: '#94a1ad' },
    status: lightStatus,
    resource: gameColors.light.resource,
  },
};

/** Desert: charred brown night, sand accent, soft terracotta secondary. */
const desert: PresetDefinition = {
  borderRadius: 16,
  displayFont: fonts.serif,
  displayWeight: 700,
  displayLetterSpacing: '0',
  dark: {
    primary: '#e6c48a',
    primaryContrast: '#21170a',
    secondary: '#d39b7a',
    background: { default: '#15100c', paper: '#1e1813', light: '#29211a' },
    divider: '#3d3127',
    text: { primary: '#f0e6d8', secondary: '#bfae98', disabled: '#776a5a' },
    status: darkStatus,
    resource: gameColors.dark.resource,
  },
  light: {
    primary: '#7f5a12',
    primaryContrast: '#ffffff',
    secondary: '#8f4f2c',
    background: { default: '#f5efe4', paper: '#fffcf6', light: '#fbf7ef' },
    divider: '#e4d7c2',
    text: { primary: '#2b2117', secondary: '#5f5140', disabled: '#a6977f' },
    status: lightStatus,
    resource: gameColors.light.resource,
  },
};

/** Ink: neutral black and white, the highest contrast. */
const ink: PresetDefinition = {
  borderRadius: 4,
  displayFont: fonts.ui,
  displayWeight: 800,
  displayLetterSpacing: '-0.02em',
  dark: {
    primary: '#f2f0ea',
    primaryContrast: '#0a0a0a',
    secondary: '#c9c7c1',
    background: { default: '#000000', paper: '#0e0e0e', light: '#1a1a1a' },
    divider: '#3a3a3a',
    text: { primary: '#ffffff', secondary: '#c7c7c7', disabled: '#7a7a7a' },
    status: darkStatus,
    resource: gameColors.dark.resource,
  },
  light: {
    primary: '#111111',
    primaryContrast: '#ffffff',
    secondary: '#3d3d3d',
    background: { default: '#f2f2f2', paper: '#ffffff', light: '#fafafa' },
    divider: '#bdbdbd',
    text: { primary: '#000000', secondary: '#3d3d3d', disabled: '#8a8a8a' },
    status: lightStatus,
    resource: gameColors.light.resource,
  },
};

/** Code editor: neutral editor greys, teal and pale yellow like syntax colors, monospace type. */
const code: PresetDefinition = {
  borderRadius: 3,
  displayFont: fonts.mono,
  uiFont: fonts.mono,
  displayWeight: 600,
  displayLetterSpacing: '-0.01em',
  dark: {
    primary: '#4ec9b0',
    primaryContrast: '#0b1d19',
    secondary: '#dcdcaa',
    background: { default: '#1e1e1e', paper: '#252526', light: '#2d2d30' },
    divider: '#3c3c3c',
    text: { primary: '#d4d4d4', secondary: '#a0a0a0', disabled: '#6a6a6a' },
    status: darkStatus,
    resource: gameColors.dark.resource,
  },
  light: {
    primary: '#00796b',
    primaryContrast: '#ffffff',
    secondary: '#795e26',
    background: { default: '#f3f3f3', paper: '#ffffff', light: '#f8f8f8' },
    divider: '#dcdcdc',
    text: { primary: '#1f1f1f', secondary: '#5a5a5a', disabled: '#9e9e9e' },
    status: lightStatus,
    resource: gameColors.light.resource,
  },
};

export const themePresets: Record<ThemePreset, PresetDefinition> = {
  slate,
  codex,
  arcane,
  ember,
  forest,
  forge,
  abyss,
  royal,
  frost,
  desert,
  ink,
  code,
};

export const themePresetNames = Object.keys(themePresets) as ThemePreset[];
