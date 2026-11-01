import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip } from '@mui/material';

/** Whether a profession, race, culture or realm can be chosen by anyone (`public`) or not (spec 066). */
const AccessTypeChip: FC<{ accessType: string | null | undefined; size?: 'small' | 'medium' }> = ({
  accessType,
  size = 'small',
}) => {
  const { t } = useTranslation();
  if (!accessType) return null;
  return <Chip size={size} label={t(accessType)} color={accessType === 'public' ? 'success' : 'error'} />;
};

export default AccessTypeChip;
