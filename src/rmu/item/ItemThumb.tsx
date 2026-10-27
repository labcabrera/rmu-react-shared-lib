import React, { FC, useState } from 'react';
import { Box } from '@mui/material';
import { resolveAssetUrl } from '../../config/asset-url';
import { imageBaseUrl } from '../../config/config.service';
import { itemFilter, itemFilterDisabled } from '../../layouts/grid';

type ItemImageSource = {
  itemTypeId?: string;
  id?: string;
  imageUrl?: string | null;
  catalog?: { imageUrl: string | null } | null;
  /** Spec 041: the image of its category when it has none of its own. */
  category?: string;
};

/** The image of an item: its own, the one of its catalog type, or `images/items/<type>.png` (spec 023). */
export const itemImageUrl = (item: ItemImageSource): string => {
  const own = resolveAssetUrl(item.imageUrl ?? item.catalog?.imageUrl ?? undefined);
  return own || `${imageBaseUrl}images/items/${item.itemTypeId ?? item.id}.png`;
};

/** Square thumbnail of an item, with the sepia filter of the item illustrations and a fallback to an empty slot. */
const ItemThumb: FC<{ item: ItemImageSource; size?: number; disabled?: boolean; alt?: string }> = ({
  item,
  size = 48,
  disabled = false,
  alt = '',
}) => {
  // 0: its image, 1: the image of its category (spec 041), 2: an empty slot
  const [fallback, setFallback] = useState(0);
  const src =
    fallback === 0
      ? itemImageUrl(item)
      : fallback === 1 && item.category
        ? `${imageBaseUrl}images/items/category-${item.category}.png`
        : `${imageBaseUrl}images/items/no-item.png`;
  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      onError={() => setFallback((step) => (step === 0 && item.category ? 1 : 2))}
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: 1,
        objectFit: 'cover',
        filter: disabled ? itemFilterDisabled : itemFilter,
        bgcolor: 'action.hover',
      }}
    />
  );
};

export default ItemThumb;
