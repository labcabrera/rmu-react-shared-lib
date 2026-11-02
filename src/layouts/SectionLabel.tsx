import React, { FC, ReactNode } from 'react';
import { Stack, SxProps, Theme, Typography } from '@mui/material';

/**
 * Title of a sub-block inside a Section, a Panel or a dialog (spec 066, decision 4): the third title level, after
 * the page title of the template and the block title of Section or Panel.
 */
const SectionLabel: FC<{ children: ReactNode; actions?: ReactNode; sx?: SxProps<Theme> }> = ({
  children,
  actions,
  sx,
}) => (
  <Stack
    direction="row"
    sx={[
      { alignItems: 'center', justifyContent: 'space-between', gap: 1, minHeight: 28 },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <Typography variant="overline" color="text.secondary" component="h3" sx={{ lineHeight: 1.4 }}>
      {children}
    </Typography>
    {actions && (
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
        {actions}
      </Stack>
    )}
  </Stack>
);

export default SectionLabel;
