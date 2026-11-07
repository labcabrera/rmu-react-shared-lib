import React, { FC, ReactNode } from 'react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { alpha, Box, ButtonBase, Theme, Tooltip, Typography, useTheme } from '@mui/material';
import { formatBonus } from '../rmu/character/StatPill';

export interface OptionGroupOption {
  key: string;
  label: string;
  /** What the option adds to the roll, shown as a badge; `null`/`undefined` shows none (an option with no value). */
  value?: number | null;
  /** A note shown as a tooltip: where a value came from, what the option means. */
  hint?: string;
  /** The option was set from somewhere else (the target's effects): it is marked with an icon. */
  auto?: boolean;
  disabled?: boolean;
}

interface BaseProps {
  /** Name of the group, shown above it and used as its accessible name. */
  label?: string;
  options: OptionGroupOption[];
  /** In exclusive groups an option worth 0 still shows "0", so that the neutral choice reads like the others. */
  showZero?: boolean;
  size?: 'small' | 'medium';
  /** Width of every option, in px; by default the width the longest option needs. */
  optionWidth?: number;
}

export interface ExclusiveOptionGroupProps extends BaseProps {
  multiple?: false;
  value: string;
  onChange: (key: string) => void;
  /** Report a click on the option already selected too, so that the caller can clear the choice with it. */
  reselect?: boolean;
}

export interface MultipleOptionGroupProps extends BaseProps {
  multiple: true;
  value: string[];
  onChange: (keys: string[]) => void;
}

export type OptionGroupProps = ExclusiveOptionGroupProps | MultipleOptionGroupProps;

const ValueBadge: FC<{ value: number }> = ({ value }) => (
  <Box
    component="span"
    sx={{
      px: 0.75,
      borderRadius: (theme: Theme) => `${theme.radius.pill}px`,
      flexShrink: 0,
      fontSize: 12,
      lineHeight: '18px',
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums',
      color: value > 0 ? 'success.main' : value < 0 ? 'error.main' : 'text.secondary',
      border: 1,
      borderColor: 'currentColor',
    }}
  >
    {value === 0 ? '0' : formatBonus(value)}
  </Box>
);

const optionContent = (option: OptionGroupOption, selected: boolean, showValue: boolean): ReactNode => (
  <>
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
      {option.auto && <AutoAwesomeIcon sx={{ fontSize: 16 }} color="primary" />}
      <Typography component="span" variant="body2" sx={{ fontWeight: selected ? 600 : 500, lineHeight: 1.2 }}>
        {option.label}
      </Typography>
    </Box>
    {showValue && typeof option.value === 'number' && <ValueBadge value={option.value} />}
  </>
);

const withHint = (option: OptionGroupOption, node: React.ReactElement) =>
  option.hint ? (
    <Tooltip key={option.key} title={option.hint}>
      {node}
    </Tooltip>
  ) : (
    node
  );

/** Measures a text with a CSS font; `undefined` where there is no canvas (tests, server). */
export type TextMeasurer = (text: string, font: string) => number | undefined;

let canvasContext: CanvasRenderingContext2D | null | undefined;
const measureWithCanvas: TextMeasurer = (text, font) => {
  if (canvasContext === undefined) {
    try {
      canvasContext = typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d');
    } catch {
      canvasContext = null;
    }
  }
  if (!canvasContext) return undefined;
  canvasContext.font = font;
  return canvasContext.measureText(text).width;
};

/**
 * The width the longest option needs (label, badge, gap and padding): every option takes it, so that they all have the
 * same size, in one line when they fit and in equal rows otherwise. The texts are measured with the theme font, or
 * estimated where they cannot be measured.
 */
export const optionCellWidth = (
  options: OptionGroupOption[],
  showZero = true,
  fontFamily = 'sans-serif',
  measure: TextMeasurer = measureWithCanvas
): number => {
  const text = (value: string, size: number, perChar: number) =>
    measure(value, `600 ${size}px ${fontFamily}`) ?? value.length * perChar;
  return Math.ceil(
    Math.max(
      56,
      ...options.map((option) => {
        const value = option.value;
        const badge =
          typeof value === 'number' && (showZero || value !== 0)
            ? text(value > 0 ? `+${value}` : `${value}`, 12, 6.6) + 14 + 6
            : 0;
        return text(option.label, 14, 7.4) + badge + (option.auto ? 22 : 0) + 28;
      })
    )
  );
};

/**
 * A set of options with the value each adds, in one look for the whole app (workspace spec 085, 3.1): an exclusive
 * group is a segmented control (one choice, the neutral one included, its "0" shown too); a multiple group is a row of
 * toggle chips that can be turned on and off one by one. All the options of a group have the same width, so they go
 * in one line when they fit and in rows of equal cells when they do not.
 */
const OptionGroup: FC<OptionGroupProps> = (props) => {
  const { label, options, showZero = true, size = 'medium', optionWidth } = props;
  const dense = size === 'small';
  const theme = useTheme();
  const cell = optionWidth ?? optionCellWidth(options, showZero, theme.typography.fontFamily);
  // As many equal columns as fit. The choices of an exclusive group stretch to fill the line, as a segmented
  // control; the toggles keep their width, so that a lone one does not take the whole line.
  const columns = `repeat(${props.multiple ? 'auto-fill' : 'auto-fit'}, minmax(min(${cell}px, 100%), 1fr))`;
  const isSelected = (key: string) => (props.multiple ? props.value.includes(key) : props.value === key);
  const select = (key: string) => {
    if (props.multiple) {
      const set = props.value.includes(key) ? props.value.filter((k) => k !== key) : [...props.value, key];
      props.onChange(set);
    } else if (props.reselect || props.value !== key) props.onChange(key);
  };

  return (
    <Box role={props.multiple ? 'group' : 'radiogroup'} aria-label={label}>
      {label && (
        <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 0.5 }}>
          {label}
        </Typography>
      )}
      {props.multiple ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: columns, gap: 1 }}>
          {options.map((option) => {
            const selected = isSelected(option.key);
            return withHint(
              option,
              <ButtonBase
                key={option.key}
                role="checkbox"
                aria-checked={selected}
                disabled={option.disabled}
                onClick={() => select(option.key)}
                sx={(theme) => ({
                  justifyContent: 'space-between',
                  gap: 0.75,
                  px: 1.5,
                  minHeight: dense ? 30 : 36,
                  borderRadius: `${theme.radius.pill}px`,
                  border: 1,
                  borderColor: selected ? theme.palette.primary.main : theme.palette.divider,
                  bgcolor: selected ? alpha(theme.palette.primary.main, 0.14) : 'transparent',
                  opacity: option.disabled ? 0.5 : 1,
                  transition: theme.transitions.create(['background-color', 'border-color']),
                  '&:hover': { borderColor: theme.palette.primary.main },
                  '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 },
                })}
              >
                {optionContent(option, selected, true)}
              </ButtonBase>
            );
          })}
        </Box>
      ) : (
        <Box
          sx={(theme) => ({
            display: 'grid',
            gridTemplateColumns: columns,
            gap: 0.5,
            p: 0.5,
            borderRadius: `${theme.radius.sm}px`,
            border: 1,
            borderColor: 'divider',
            bgcolor: alpha(theme.palette.text.primary, 0.03),
          })}
        >
          {options.map((option) => {
            const selected = isSelected(option.key);
            const showValue = showZero || option.value !== 0;
            return withHint(
              option,
              <ButtonBase
                key={option.key}
                role="radio"
                aria-checked={selected}
                disabled={option.disabled}
                onClick={() => select(option.key)}
                sx={(theme) => ({
                  justifyContent: 'center',
                  gap: 0.75,
                  px: 1.25,
                  minHeight: dense ? 30 : 36,
                  borderRadius: `${Math.max(theme.radius.sm - 2, 2)}px`,
                  bgcolor: selected ? theme.palette.background.paper : 'transparent',
                  boxShadow: selected ? `inset 0 0 0 1px ${theme.palette.primary.main}` : 'none',
                  color: selected ? 'text.primary' : 'text.secondary',
                  opacity: option.disabled ? 0.5 : 1,
                  transition: theme.transitions.create(['background-color', 'box-shadow']),
                  '&:hover': {
                    bgcolor: selected ? theme.palette.background.paper : alpha(theme.palette.primary.main, 0.06),
                  },
                  '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 1 },
                })}
              >
                {optionContent(option, selected, showValue)}
              </ButtonBase>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default OptionGroup;
