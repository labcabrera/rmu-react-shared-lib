import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, Tooltip } from '@mui/material';

export type ManeuverOrigin = 'skill' | 'category';

/** Small chip telling whether a maneuver value comes from the skill itself or from its category. */
const ManeuverOriginChip: FC<{ origin: ManeuverOrigin }> = ({ origin }) => {
  const { t } = useTranslation();
  return (
    <Tooltip title={t(origin === 'skill' ? 'maneuver-skill-override' : 'maneuver-inherited-from-category')}>
      <Chip
        size="small"
        variant="outlined"
        color={origin === 'skill' ? 'primary' : 'default'}
        label={t(origin)}
        sx={{ height: 20, fontSize: '0.7rem' }}
      />
    </Tooltip>
  );
};

export default ManeuverOriginChip;
