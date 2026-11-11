import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { alpha, Chip } from '@mui/material';
import { combatActionInfo, combatColors } from './actionTypes';

/**
 * Chip of an action type: its icon, its name and the color of its category. `label` replaces the name
 * (for example "Melee → Orc 2").
 */
const ActionTypeChip: FC<{
  type: string;
  label?: string;
  size?: 'small' | 'medium';
  onClick?: () => void;
}> = ({ type, label, size = 'small', onClick }) => {
  const { t } = useTranslation();
  const info = combatActionInfo(type);
  return (
    <Chip
      size={size}
      icon={info.icon()}
      label={label ?? t(info.labelKey)}
      onClick={onClick}
      sx={(theme) => {
        const color = combatColors(theme)[info.category];
        return {
          color,
          bgcolor: alpha(color, 0.12),
          border: `1px solid ${alpha(color, 0.4)}`,
          '& .MuiChip-icon': { color: 'inherit' },
        };
      }}
    />
  );
};

export default ActionTypeChip;
