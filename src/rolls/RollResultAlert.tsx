import React, { FC, ReactNode } from 'react';
import { Alert, AlertColor, Stack, Typography } from '@mui/material';

/**
 * The result of a roll (a resistance roll, a medical roll, a group check…), spec 066: a coloured alert with the
 * headline and its detail lines, then the breakdown of the roll (usually a RollBreakdown) and an optional note.
 */
const RollResultAlert: FC<{
  severity: AlertColor;
  headline: ReactNode;
  lines?: ReactNode[];
  breakdown?: ReactNode;
  note?: ReactNode;
}> = ({ severity, headline, lines = [], breakdown, note }) => (
  <Stack spacing={1.5}>
    <Alert severity={severity}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {headline}
      </Typography>
      {lines
        .filter((line) => line !== null && line !== undefined && line !== false && line !== '')
        .map((line, index) => (
          <Typography key={index} variant="body2">
            {line}
          </Typography>
        ))}
    </Alert>
    {breakdown}
    {note && (
      <Typography variant="caption" color="text.secondary">
        {note}
      </Typography>
    )}
  </Stack>
);

export default RollResultAlert;
