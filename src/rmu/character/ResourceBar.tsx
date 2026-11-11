import React, { FC } from 'react';
import { Box, LinearProgress, Stack, Typography, useTheme } from '@mui/material';

export type ResourceKind = 'hp' | 'pp' | 'xp' | 'fatigue';

/** A labeled bar for hit points, power points, experience or fatigue, colored by the theme. */
const ResourceBar: FC<{
  label: string;
  current: number;
  max: number;
  kind: ResourceKind;
  /** Replaces the default "current / max" text (for example a formatted XP amount). */
  valueLabel?: string;
  /** Smaller bar without the label row, for compact headers. */
  dense?: boolean;
}> = ({ label, current, max, kind, valueLabel, dense = false }) => {
  const { palette } = useTheme();
  const percent = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  const color = palette.resource[kind];
  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 1 }}>
        <Typography variant="caption" color="text.secondary" noWrap>
          {label}
        </Typography>
        <Typography variant={dense ? 'caption' : 'body2'} sx={{ fontWeight: 700 }} noWrap>
          {valueLabel ?? `${current} / ${max}`}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={percent}
        aria-label={label}
        sx={{
          mt: 0.5,
          height: dense ? 4 : 6,
          bgcolor: 'action.hover',
          '& .MuiLinearProgress-bar': { bgcolor: color },
        }}
      />
    </Box>
  );
};

export default ResourceBar;
