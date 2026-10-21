// Design tokens of the RMU applications. Components read them through the MUI theme
// (theme.palette.*, theme.shape.radius, theme.motion...), never directly: these values only feed createAppTheme.

/** Original slate palette. Kept for the slate preset and for consumers that still import it. */
export const baseColors = {
  scrollbarTrack: '#0f1115',
  scrollbarThumb: '#2a2f3a',
  dark: {
    almostBlack: '#060707',
    darkSlate: '#282e2f',
    midSlate: '#495657',
    mist: '#617274',
    haze: '#99b3b6ff',
    dialogBackground: '#222626ff',
    dialogBackgroundTop: '#181818ff',
    // RmuDialog surfaces: paper, its gradient stops, title bar, content and actions.
    dialogPaper: '#171b1c',
    dialogPaperGradientStart: '#15191a',
    dialogPaperGradientMiddle: '#1f2526',
    dialogPaperGradientEnd: '#171d1f',
    dialogTitle: '#202728',
    dialogTitleGradientStart: '#222b2c',
    dialogTitleGradientEnd: '#161b1c',
    dialogContent: '#202526',
    dialogActions: '#1a2021',
    backgroundDark: '#131414',
    surfaceLight: '#f7f9f9',
    disabledLight: '#8b999c',
    success: '#a5d6a7',
    error: '#ffab91',
    warning: '#ebeb75ff',
    info: '#90caf9',
  },
  light: {
    almostBlack: '#060707',
    midSlate: '#495657',
    mist: '#617274',
    haze: '#99b3b6ff',
    surfaceLight: '#f7f9f9',
    paperLight: '#ffffff',
    textLight: '#253033',
    mutedLight: '#5d6c70',
    disabledLight: '#8b999c',
    success: '#51b256',
    error: '#f97249',
    warning: '#c8c830',
    info: '#64b5f6',
  },
} as const;

/** Corner radius scale in px. `shape.borderRadius` (the `sx` unit) is set per preset. */
export const radius = { sm: 8, md: 12, lg: 16, xl: 24 } as const;

/** Durations (ms) and easing curves for transitions. */
export const motion = {
  duration: { fast: 150, base: 240, slow: 360 },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasized: 'cubic-bezier(0.2, 0.9, 0.2, 1)',
    exit: 'cubic-bezier(0.3, 0, 1, 1)',
  },
} as const;

/** Font stacks. The shell (and Storybook) bundle the webfonts from @fontsource; until they load, the fallbacks apply. */
export const fonts = {
  ui: '"Inter Variable", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  serif: '"Cormorant Garamond", "Georgia", "Times New Roman", serif',
  engraved: '"Cinzel", "Georgia", "Times New Roman", serif',
  mono: '"JetBrains Mono", "Fira Code", "Consolas", "Menlo", monospace',
} as const;

/** Game colors shared by every preset unless the preset overrides them. */
export const gameColors = {
  dark: {
    resource: { hp: '#ef7a76', pp: '#7fb2ff', xp: '#e6c15a', fatigue: '#e0a165' },
    rarity: { common: '#b4bcbf', uncommon: '#7ccf86', rare: '#6fa8f5', veryRare: '#b892f0', unique: '#f0b44c' },
    combat: {
      melee: '#f08c7d',
      ranged: '#e8b55c',
      movement: '#6fc9a8',
      maneuver: '#93b3f5',
      spell: '#c69df3',
      other: '#b4bcbf',
      pending: '#f0b44c',
      /** An action with its maximum action points: it resolves without an AP penalty (spec 011). */
      optimal: '#c3d65a',
      waiting: '#93b3f5',
      resolved: '#7ccf86',
      failed: '#ff9a85',
    },
    /** Factions of a combat, in the order of the game: told apart by stripes, rings and dots. */
    // Soft, muted hues away from red (hit points, errors) and blue (power points, info), so a faction is never
    // mistaken for a state. The last one is neutral, for unknown factions.
    factions: ['#9fbf8f', '#d6b46a', '#c39bc4', '#7fc4ad', '#b7b86e', '#d1a98a', '#c2b59b', '#b4bcbf'],
  },
  light: {
    resource: { hp: '#c62828', pp: '#1e5bb8', xp: '#8a6a08', fatigue: '#a8561a' },
    rarity: { common: '#5f6b6e', uncommon: '#2e7d32', rare: '#1e5bb8', veryRare: '#7340b8', unique: '#9a6200' },
    combat: {
      melee: '#a8321c',
      ranged: '#7f5300',
      movement: '#0f6b51',
      maneuver: '#2a4fae',
      spell: '#6a3aab',
      other: '#55636a',
      pending: '#8a5800',
      optimal: '#4f6300',
      waiting: '#2a4fae',
      resolved: '#2a6e2e',
      failed: '#b03a17',
    },
    factions: ['#55794a', '#8a6a1e', '#7d527e', '#2f7a63', '#6b6b24', '#8a5f40', '#6e6550', '#5f6b6e'],
  },
} as const;
