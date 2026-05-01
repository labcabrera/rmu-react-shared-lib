import React, { FC, ReactNode } from 'react';
import { Card, CardContent, CardMedia } from '@mui/material';

const smallImageSize = 70;

const RmuCard: FC<{
  image: string;
  maxWidth?: number;
  minWidth?: number;
  height?: number;
  imageSize?: number;
  onClick?: () => void;
  children?: ReactNode;
  grayscale?: number;
  imageFilter?: string;
  contentBgImage?: string;
}> = ({ image, onClick, children, grayscale = 0, imageFilter: filter, height, contentBgImage }) => {
  return (
    <Card
      variant="outlined"
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        height: height || smallImageSize,
        cursor: onClick ? 'pointer' : 'default',
        ...(onClick && {
          transition: 'box-shadow 0.2s, background 0.2s',
          '&:hover': {
            boxShadow: 6,
            backgroundColor: 'action.hover',
          },
        }),
      }}
      onClick={onClick}
    >
      <CardMedia
        component="img"
        image={image}
        sx={{
          width: height || smallImageSize,
          height: height || smallImageSize,
          objectFit: 'cover',
          filter: filter ? filter : `grayscale(${grayscale})`,
        }}
      />
      <CardContent
        sx={{
          flex: 1,
          p: 0,
          '&:last-child': {
            pb: 0,
          },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          ml: 2,
          maxWidth: '100%',
          minWidth: 0,
          backgroundImage: contentBgImage ? `url(${contentBgImage})` : undefined,
          backgroundSize: contentBgImage ? 'cover' : undefined,
          backgroundPosition: contentBgImage ? 'center' : undefined,
          backgroundRepeat: contentBgImage ? 'no-repeat' : undefined,
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
};

export default RmuCard;
