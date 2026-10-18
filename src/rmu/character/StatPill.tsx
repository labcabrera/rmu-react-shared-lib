import React, { FC, ReactNode } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';

/** Formats a bonus with its sign: +4, -3, 0. */
export const formatBonus = (value: number) => (value > 0 ? `+${value}` : `${value}`);

/**
 * A key number with a short label under it (DB, AT, initiative…). `signed` shows the sign and colors
 * positive and negative values.
 */
const StatPill: FC<{
  label: string;
  value: ReactNode;
  /** Full name or explanation, shown as a tooltip. */
  hint?: string;
  signed?: boolean;
}> = ({ label, value, hint, signed = false }) => {
  const numeric = typeof value === 'number';
  let color = 'text.primary';
  if (signed && numeric && value > 0) color = 'stat.positive';
  if (signed && numeric && value < 0) color = 'stat.negative';
  const pill = (
    <Box
      sx={(theme) => ({
        px: 1.5,
        py: 0.75,
        minWidth: 64,
        textAlign: 'center',
        borderRadius: `${theme.radius.md}px`,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.light',
      })}
    >
      <Typography variant="h6" component="div" sx={{ lineHeight: 1.2, color }}>
        {signed && numeric ? formatBonus(value) : value}
      </Typography>
      <Typography variant="caption" color="text.secondary" component="div" noWrap>
        {label}
      </Typography>
    </Box>
  );
  return hint ? <Tooltip title={hint}>{pill}</Tooltip> : pill;
};

export default StatPill;
