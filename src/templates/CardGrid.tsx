import React, { ReactNode } from 'react';
import { Grid } from '@mui/material';
import { gridSizeCard } from '../layouts/grid';
import { enterSx } from '../motion/motion';

type GridSize = Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number>>;

/** Responsive grid of cards: one column on phones, up to four on desktop. The cards enter staggered. */
export default function CardGrid<T>({
  items,
  renderItem,
  getKey,
  size = gridSizeCard,
}: {
  items: T[];
  renderItem: (item: T) => ReactNode;
  getKey: (item: T) => string;
  size?: GridSize;
}) {
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
