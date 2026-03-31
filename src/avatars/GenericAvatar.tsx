import React, { FC } from 'react';
import Avatar from '@mui/material/Avatar';

const GenericAvatar: FC<{
  imageUrl: string;
}> = ({ imageUrl }) => {
  return (
    <Avatar
      src={imageUrl}
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
