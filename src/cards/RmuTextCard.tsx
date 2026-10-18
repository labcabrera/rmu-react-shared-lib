import React, { FC } from 'react';
import LockIcon from '@mui/icons-material/Lock';
import { Typography } from '@mui/material';
import { baseColors } from '../theme/tokens';
import RmuCard from './RmuCard';

/** @deprecated Use the theme palette (`error.main`). */
export const textRed = baseColors.dark.error;
/** @deprecated Use the theme palette (`success.main`). */
export const textGreen = baseColors.dark.success;

const RmuTextCard: FC<{
  value: string | number;
  applyColor?: boolean;
  subtitle: string | undefined;
  image: string | null | undefined;
  altImageUrl?: string | null;
  grayscale?: number;
  imageFilter?: string;
  color?: 'red' | 'green' | undefined;
  lock?: boolean;
  onClick?: () => void;
}> = ({
  value,
  subtitle,
  applyColor = false,
  image,
  altImageUrl,
  grayscale = 0,
  color,
  imageFilter,
  lock = false,
  onClick,
}) => {
  const getColor = () => {
    if (!applyColor) return undefined;
    if (color) {
      switch (color) {
        case 'red':
          return 'error.main';
        case 'green':
          return 'success.main';
        default:
          return undefined;
      }
    }
    if (typeof value === 'number') {
      if (value > 0) return 'success.main';
      if (value < 0) return 'error.main';
      return undefined;
    }
  };

  return (
    <RmuCard image={image} altImageUrl={altImageUrl} onClick={onClick} grayscale={grayscale} imageFilter={imageFilter}>
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
          fontWeight: 600,
        }}
      >
        {value}
        {lock && (
          <LockIcon
            color="primary"
            sx={{
              fontSize: 16,
              // verticalAlign: 'middle',
              ml: 0.5,
              mr: 0.5,
            }}
          />
        )}
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
