import React, { FC, ReactNode } from 'react';
import { Card, CardContent, CardMedia } from '@mui/material';

const defaultImage = 'https://assets.labcabrera.com/images/generic/configuration.png';
const smallImageSize = 70;

const RmuCard: FC<{
  image: string | null | undefined;
  altImageUrl?: string | null;
  maxWidth?: number;
  minWidth?: number;
  height?: number;
  imageSize?: number;
  children?: ReactNode;
  grayscale?: number;
  imageFilter?: string;
  contentBgImage?: string;
  onClick?: () => void;
}> = ({ image, altImageUrl, children, grayscale = 0, imageFilter: filter, height, contentBgImage, onClick }) => {
  const effectiveImage = image || altImageUrl || defaultImage;

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
        image={effectiveImage}
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
