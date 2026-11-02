import React, { FC, KeyboardEvent, ReactNode } from 'react';
import { alpha, Box, SxProps, Theme } from '@mui/material';

/**
 * Styles of a tile that can be chosen (spec 066, decision 16): primary border and tinted background when selected,
 * a lighter tint on hover, dimmed when disabled. For tiles that are not a SelectableCard (a grid cell, a list row).
 */
export const selectableSx =
  (selected: boolean, disabled = false) =>
  (theme: Theme) => ({
    border: 1,
    borderColor: selected ? theme.palette.primary.main : theme.palette.divider,
    borderRadius: `${theme.radius.sm}px`,
    bgcolor: selected ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: theme.transitions.create(['background-color', 'border-color']),
    ...(!disabled && {
      '&:hover': {
        bgcolor: alpha(theme.palette.primary.main, selected ? 0.16 : 0.06),
        borderColor: theme.palette.primary.main,
      },
    }),
    '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 },
  });

/** A tile that can be chosen: a button with the selectable styles (aria-pressed tells its state). */
const SelectableCard: FC<{
  selected: boolean;
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
  sx?: SxProps<Theme>;
  'aria-label'?: string;
}> = ({ selected, onClick, disabled = false, children, sx, ...aria }) => {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick?.();
    }
  };
  return (
    <Box
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={selected}
      aria-disabled={disabled || undefined}
      aria-label={aria['aria-label']}
      onClick={disabled ? undefined : onClick}
      onKeyDown={onKeyDown}
      sx={[selectableSx(selected, disabled), { p: 1.5 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {children}
    </Box>
  );
};

export default SelectableCard;
