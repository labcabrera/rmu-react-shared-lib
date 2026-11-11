import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import { cardGridContainerSx, cardGridSx } from '../layouts/grid';
import { enterSx } from '../motion/motion';

/**
 * Grid of entity cards (specs 058 and 059): its columns follow the width it really has (cardColumns), one below
 * 560 px, where on phones the cards are horizontal, up to five. The cards enter staggered.
 */
export default function CardGrid<T>({
  items,
  renderItem,
  getKey,
}: {
  items: T[];
  renderItem: (item: T) => ReactNode;
  getKey: (item: T) => string;
}) {
  return (
    <Box sx={cardGridContainerSx}>
      <Box sx={cardGridSx()}>
        {items.map((item, index) => (
          <Box key={getKey(item)} sx={{ minWidth: 0, ...enterSx(index) }}>
            {renderItem(item)}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
