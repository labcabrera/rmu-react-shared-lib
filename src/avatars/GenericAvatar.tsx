import React, { FC } from 'react';
import Avatar from '@mui/material/Avatar';
import { resolveAssetUrl } from '../config/asset-url';

const GenericAvatar: FC<{
  imageUrl: string;
  variant?: 'circular' | 'rounded' | 'square' | undefined;
}> = ({ imageUrl, variant = 'circular' }) => {
  return (
    <Avatar
      src={resolveAssetUrl(imageUrl)}
      variant={variant}
      sx={{
        width: {
          xs: 50,
          sm: 56,
          md: 72,
          lg: 96,
        },
        height: {
          xs: 50,
          sm: 56,
          md: 72,
          lg: 96,
        },
      }}
    />
  );
};

export default GenericAvatar;
