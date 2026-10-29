import React, { ReactNode } from 'react';
import { Box, Grid } from '@mui/material';
import { gridSizeCard } from '../layouts/grid';
import { enterSx } from '../motion/motion';

type GridSize = Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number>>;

/**
 * Responsive grid of cards: one column on phones, up to four on desktop. The cards enter staggered. With `minWidth`,
 * the columns follow the width the grid really has (two on phones, then as many as fit cards of at least `minWidth`
 * px), for grids that share the page with side panels.
 */
export default function CardGrid<T>({
  items,
  renderItem,
  getKey,
  size = gridSizeCard,
  minWidth,
}: {
  items: T[];
  renderItem: (item: T) => ReactNode;
  getKey: (item: T) => string;
  size?: GridSize;
  minWidth?: number;
}) {
  if (minWidth) {
    return (
      <Box
        sx={{
          display: 'grid',
          gap: 1,
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            sm: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
          },
        }}
      >
        {items.map((item, index) => (
          <Box key={getKey(item)} sx={{ minWidth: 0, ...enterSx(index) }}>
            {renderItem(item)}
          </Box>
        ))}
      </Box>
    );
  }
  return (
    <Grid container spacing={1}>
      {items.map((item, index) => (
        <Grid key={getKey(item)} size={size} sx={enterSx(index)}>
          {renderItem(item)}
        </Grid>
      ))}
    </Grid>
  );
}
