import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import { cardGridSx, cardMinWidth } from '../layouts/grid';
import { enterSx } from '../motion/motion';

/**
 * Grid of entity cards (spec 058, decision 3): one column on phones, where the cards are horizontal, then as many
 * columns as fit cards of at least `minWidth` px, so a card has the same size in every list whatever shares the page
 * with it. The cards enter staggered.
 */
export default function CardGrid<T>({
  items,
  renderItem,
  getKey,
  minWidth = cardMinWidth,
}: {
  items: T[];
  renderItem: (item: T) => ReactNode;
  getKey: (item: T) => string;
  minWidth?: number;
}) {
  return (
    <Box sx={cardGridSx(minWidth)}>
      {items.map((item, index) => (
        <Box key={getKey(item)} sx={{ minWidth: 0, ...enterSx(index) }}>
          {renderItem(item)}
        </Box>
      ))}
    </Box>
  );
}
