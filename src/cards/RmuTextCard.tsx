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
  color?: 'red' | 'green' | undefined;
  onClick?: () => void;
}> = ({ value, subtitle, applyColor = false, image, grayscale = 0, color, imageFilter, onClick }) => {
  const getColor = () => {
    if (!applyColor) return undefined;
    if (color) {
      switch (color) {
        case 'red':
          return textRed;
        case 'green':
          return textRed;
        default:
          return undefined;
      }
    }
    if (typeof value === 'number') {
      if (value > 0) return textGreen;
      if (value < 0) return textRed;
      return undefined;
    }
  };

  return (
    <RmuCard image={image} onClick={onClick} grayscale={grayscale} imageFilter={imageFilter}>
      <Typography
        component="div"
        variant="body1"
        sx={{
          color: getColor(),
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
        variant="caption"
        component="div"
        sx={{
          fontSize: '1rem',
          color: 'text.secondary',
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
