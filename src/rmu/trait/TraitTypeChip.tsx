import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { alpha, Chip, Theme } from '@mui/material';

/** Color of a talent or a flaw, with fallbacks for an older shell theme without the stat colors. */
export const traitTypeColor = (theme: Theme, isTalent: boolean): string =>
  isTalent
    ? (theme.palette.stat?.positive ?? theme.palette.success.main)
    : (theme.palette.stat?.negative ?? theme.palette.error.main);

/** Talent or flaw chip: an icon and the name, besides the color, so the type is not told by color alone. */
const TraitTypeChip: FC<{
  isTalent: boolean;
  size?: 'small' | 'medium';
}> = ({ isTalent, size = 'small' }) => {
  const { t } = useTranslation();
  const Icon = isTalent ? AutoAwesomeIcon : ReportProblemOutlinedIcon;
  return (
    <Chip
      size={size}
      icon={<Icon />}
      label={t(isTalent ? 'talent' : 'flaw')}
      sx={(theme) => {
        const color = traitTypeColor(theme, isTalent);
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

export default TraitTypeChip;
