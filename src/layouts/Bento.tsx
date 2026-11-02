import React, { ReactNode } from 'react';
import { Box } from '@mui/material';

/** 12-column grid of the detail pages (spec 066, from core and strategic); children set their span with `span()`. */
export const Bento = ({ children }: { children: ReactNode }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: 2 }}>{children}</Box>
);

/** Column span from `sm` (tablet), `lg` and `xl` up; full width on phones. */
export const span = (sm: number, lg: number, xl = lg) => ({
  gridColumn: { xs: 'span 12', sm: `span ${sm}`, lg: `span ${lg}`, xl: `span ${xl}` },
});
