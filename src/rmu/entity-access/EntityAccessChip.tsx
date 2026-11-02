import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import GroupIcon from '@mui/icons-material/Group';
import { Chip } from '@mui/material';
import { EntityAccess, EntityShare } from '../../api/common.dto';

export interface EntityAccessChipProps {
  entity: { access?: EntityAccess | null; accessType?: string | null; shares?: EntityShare[] | null } | null | undefined;
  size?: 'small' | 'medium';
}

/** The chip key of an entity for the signed-in user (spec 069), or null when there is nothing to tell. */
export const entityAccessChipKey = (entity: EntityAccessChipProps['entity']): string | null => {
  if (!entity?.access) return null;
  // Who manages it: shared when it has shares.
  if (entity.access === 'manage') return (entity.shares?.length ?? 0) > 0 ? 'entity-access-shared' : null;
  if (entity.access === 'write') return 'entity-access-shared-write';
  // Reading a private entity one does not manage: it was shared with the user. Public ones need no chip.
  return entity.accessType === 'private' ? 'entity-access-shared-read' : null;
};

/**
 * «Shared» chip (spec 069): for who manages an entity with shares, «Shared (n)»; for a user it was shared with, «Shared
 * with you · Write» or «· Read». Nothing for public entities read by everyone.
 */
const EntityAccessChip: FC<EntityAccessChipProps> = ({ entity, size = 'small' }) => {
  const { t } = useTranslation();
  const key = entityAccessChipKey(entity);
  if (!key) return null;
  const label = key === 'entity-access-shared' ? t(key, { count: entity?.shares?.length ?? 0 }) : t(key);
  return (
    <Chip
      size={size}
      color="secondary"
      variant="outlined"
      icon={<GroupIcon fontSize="small" />}
      label={label}
      data-testid="entity-access-chip"
    />
  );
};

export default EntityAccessChip;
