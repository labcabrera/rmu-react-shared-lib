import React, { FC } from 'react';
import { Typography } from '@mui/material';
import RmuCard from './RmuCard';

export const textRed = '#ffab91';
export const textGreen = '#a5d6a7';

const RmuTextCard: FC<{
  value: string | number;
  applyColor?: boolean;
  subtitle: string | undefined;
  image: string;
  grayscale?: number;
  imageFilter?: string;
  onClick?: () => void;
}> = ({ value, subtitle, applyColor = false, image, grayscale = 0, imageFilter, onClick }) => {
  return (
    <RmuCard image={image} onClick={onClick} grayscale={grayscale} imageFilter={imageFilter}>
      <Typography
        component="div"
        variant="h6"
        sx={{
          color:
            applyColor && typeof value === 'number'
              ? value > 0
                ? textGreen
                : value < 0
                  ? textRed
                  : 'text.primary'
              : undefined,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
          maxWidth: '100%',
          display: 'block',
        }}
      >
        {value}
      </Typography>
      <Typography
        variant="subtitle1"
        component="div"
        sx={{
          fontSize: '1rem',
          color: applyColor ? 'primary.main' : 'text.secondary',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
          maxWidth: '100%',
          display: 'block',
        }}
      >
        {subtitle}
      </Typography>
    </RmuCard>
  );
};

export default RmuTextCard;
