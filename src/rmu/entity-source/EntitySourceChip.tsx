import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Chip } from '@mui/material';
import { EntityType } from '../../api/common.dto';

export interface EntitySourceChipProps {
  entity: { entitySource?: EntityType | null } | null | undefined;
  size?: 'small' | 'medium';
}

/**
 * «Rulebook» chip of a `system` entity (spec 063, decision 8), for detail heroes and cards. User entities get no chip,
 * so the catalogs are not filled with noise.
 */
const EntitySourceChip: FC<EntitySourceChipProps> = ({ entity, size = 'small' }) => {
  const { t } = useTranslation();
  if (entity?.entitySource !== 'system') return null;
  return (
    <Chip
      size={size}
      color="primary"
      variant="outlined"
      icon={<MenuBookIcon fontSize="small" />}
      label={t('entity-source-system')}
      data-testid="entity-source-chip"
    />
  );
};

export default EntitySourceChip;
