import React, { FC, ReactNode } from 'react';
import { Card, CardActionArea, CardContent, CardMedia } from '@mui/material';
import { resolveAssetUrl } from '../config/asset-url';
import { hoverLiftSx } from '../motion/motion';

const defaultImage = 'images/generic/configuration.png';
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

  // Clickable cards are a button (keyboard focus, Enter/Space, announced by screen readers).
  const content = (
    <>
      <CardMedia
        component="img"
        image={resolveAssetUrl(effectiveImage)}
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
          backgroundImage: contentBgImage ? `url(${resolveAssetUrl(contentBgImage)})` : undefined,
          backgroundSize: contentBgImage ? 'cover' : undefined,
          backgroundPosition: contentBgImage ? 'center' : undefined,
          backgroundRepeat: contentBgImage ? 'no-repeat' : undefined,
        }}
      >
        {children}
      </CardContent>
    </>
  );

  return (
    <Card
      variant="outlined"
      sx={[
        {
          display: 'flex',
          alignItems: 'stretch',
          height: height || smallImageSize,
          cursor: onClick ? 'pointer' : 'default',
        },
        Boolean(onClick) && hoverLiftSx,
      ]}
    >
      {onClick ? (
        <CardActionArea
          onClick={onClick}
          sx={{ display: 'flex', alignItems: 'stretch', justifyContent: 'flex-start', height: '100%' }}
        >
          {content}
        </CardActionArea>
      ) : (
        content
      )}
    </Card>
  );
};

export default RmuCard;
