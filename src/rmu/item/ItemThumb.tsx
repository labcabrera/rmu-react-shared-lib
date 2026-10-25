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
  const [failed, setFailed] = useState(false);
  const src = failed ? `${imageBaseUrl}images/items/no-item.png` : itemImageUrl(item);
  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
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
