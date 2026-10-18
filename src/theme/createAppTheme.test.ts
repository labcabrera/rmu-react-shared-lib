import { getContrastRatio } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import { createAppTheme, defaultThemeConfig, parseThemeConfig, ThemeMode } from './createAppTheme';
import { themePresetNames } from './presets';

const modes: ThemeMode[] = ['dark', 'light'];
const combinations = themePresetNames.flatMap((preset) => modes.map((mode) => ({ preset, mode })));

describe('createAppTheme', () => {
  it('keeps the old mode-only signature', () => {
    expect(createAppTheme('light').palette.mode).toBe('light');
    expect(createAppTheme().preset).toBe('slate');
  });

  it.each(combinations)('$preset $mode reaches WCAG AA for body text', ({ preset, mode }) => {
    const { palette } = createAppTheme({ preset, mode });
    for (const surface of [palette.background.default, palette.background.paper, palette.background.light]) {
      expect(getContrastRatio(palette.text.primary, surface)).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(palette.text.secondary, surface)).toBeGreaterThanOrEqual(4.5);
    }
    expect(getContrastRatio(palette.primary.contrastText, palette.primary.main)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(combinations)('$preset $mode faction colors stand out from the surfaces', ({ preset, mode }) => {
    const { palette } = createAppTheme({ preset, mode });
    for (const color of palette.factions) {
      expect(getContrastRatio(color, palette.background.paper)).toBeGreaterThanOrEqual(3);
      expect(getContrastRatio(color, palette.background.light)).toBeGreaterThanOrEqual(3);
    }
  });

  it.each(combinations)('$preset $mode combat colors are readable as text on paper', ({ preset, mode }) => {
    const { palette } = createAppTheme({ preset, mode });
    for (const color of Object.values(palette.combat)) {
      expect(getContrastRatio(color, palette.background.paper)).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(color, palette.background.light)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(combinations)('$preset $mode exposes the game palette and tokens', ({ preset, mode }) => {
    const theme = createAppTheme({ preset, mode });
    expect(theme.palette.resource.hp).toMatch(/^#/);
    expect(theme.palette.rarity.unique).toMatch(/^#/);
    expect(theme.palette.stat.positive).toBe(theme.palette.success.main);
    expect(theme.radius.md).toBe(12);
    expect(theme.fonts.display).toBeTruthy();
  });

  it('compact density makes inputs and tables small', () => {
    const compact = createAppTheme({ density: 'compact' });
    expect(compact.components?.MuiTable?.defaultProps?.size).toBe('small');
    expect(compact.components?.MuiTextField?.defaultProps?.size).toBe('small');
    expect(createAppTheme().components?.MuiTable?.defaultProps?.size).toBeUndefined();
  });
});

describe('parseThemeConfig', () => {
  it('reads an object, its JSON and the old mode string', () => {
    const config = { preset: 'arcane', mode: 'light', density: 'compact' };
    expect(parseThemeConfig(config)).toEqual(config);
    expect(parseThemeConfig(JSON.stringify(config))).toEqual(config);
    expect(parseThemeConfig('light')).toEqual({ ...defaultThemeConfig, mode: 'light' });
  });

  it('falls back to the default for unknown or broken values', () => {
    expect(parseThemeConfig(null)).toEqual(defaultThemeConfig);
    expect(parseThemeConfig('{not json')).toEqual(defaultThemeConfig);
    expect(parseThemeConfig({ preset: 'neon', mode: 'dim', density: 1 })).toEqual(defaultThemeConfig);
  });
});
