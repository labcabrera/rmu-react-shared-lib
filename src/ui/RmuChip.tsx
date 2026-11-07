import React, { FC, ReactElement, ReactNode } from 'react';
import { alpha, Chip, SxProps, Theme, Tooltip } from '@mui/material';

/**
 * What a chip shows (spec 085, 3.4): a rule that explains a number ("Big (+1)"), an outcome of a roll (damage, a
 * critical, a fumble) or an effect on an actor (bleeding, stunned, a penalty).
 */
export type RmuChipVariant = 'rule' | 'outcome' | 'effect';
export type RmuChipTone = 'default' | 'error' | 'warning' | 'success' | 'info' | 'primary';

export interface RmuChipProps {
  variant: RmuChipVariant;
  label: ReactNode;
  /** Color of an outcome or an effect, by how severe it is; a rule is always neutral. */
  tone?: RmuChipTone;
  /** Icon of an effect, as a chip avatar (`effectIcon`). */
  avatar?: ReactElement;
  icon?: ReactElement;
  /** Shown as a tooltip. */
  hint?: ReactNode;
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
}

const softSx = (tone: RmuChipTone) => (theme: Theme) => {
  // The status icons are white drawings: they go on a solid square of the tone, readable on the soft fill of both
  // themes.
  const avatar = (solid: string) => ({
    '& .MuiChip-avatar': { bgcolor: solid, color: theme.palette.common.white, p: '2px', borderRadius: '4px' },
  });
  if (tone === 'default')
    return {
      bgcolor: alpha(theme.palette.text.primary, 0.08),
      color: theme.palette.text.primary,
      ...avatar(theme.palette.grey[600]),
    };
  const palette = theme.palette[tone];
  const color = theme.palette.mode === 'dark' ? palette.light : palette.dark;
  return {
    bgcolor: alpha(palette.main, theme.palette.mode === 'dark' ? 0.18 : 0.12),
    color,
    '& .MuiChip-icon': { color },
    ...avatar(palette.main),
  };
};

/**
 * The chips of the app in three looks, so that a rule, a result and an effect never read alike: a `rule` is outlined
 * and neutral (it explains, it does not act); an `outcome` and an `effect` have a soft fill in the color of their
 * severity, the effect with its icon. None of them is clickable; a hint shows as a tooltip.
 */
const RmuChip: FC<RmuChipProps> = ({ variant, label, tone = 'default', avatar, icon, hint, size = 'small', sx }) => {
  const chip = (
    <Chip
      size={size}
      label={label}
      avatar={avatar}
      icon={icon}
      variant={variant === 'rule' ? 'outlined' : 'filled'}
      data-variant={variant}
      data-tone={variant === 'rule' ? undefined : tone}
      sx={[
        variant === 'rule'
          ? (theme: Theme) => ({ color: theme.palette.text.secondary, borderColor: theme.palette.divider })
          : softSx(tone),
        { fontWeight: variant === 'outcome' ? 600 : 500 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
  return hint ? <Tooltip title={hint}>{chip}</Tooltip> : chip;
};

export default RmuChip;
