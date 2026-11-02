import React, { FC, ReactNode } from 'react';
import { Stack, SxProps, Theme } from '@mui/material';

/** A wrapping row of chips with the same gap everywhere (spec 066, decision 16). */
const ChipRow: FC<{ children: ReactNode; sx?: SxProps<Theme> }> = ({ children, sx }) => (
  <Stack
    direction="row"
    useFlexGap
    sx={[{ flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);

export default ChipRow;
