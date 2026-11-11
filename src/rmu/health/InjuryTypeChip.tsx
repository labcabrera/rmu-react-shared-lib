import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip } from '@mui/material';
import { InjuryType } from '../../api/health.dto';

/** Injury type chip (bone, cut or burn, organ…), labelled with the `injury-type-<type>` translation. */
const InjuryTypeChip: FC<{ type: InjuryType; size?: 'small' | 'medium' }> = ({ type, size = 'small' }) => {
  const { t } = useTranslation();
  return <Chip size={size} variant="outlined" label={t(`injury-type-${type}`)} />;
};

export default InjuryTypeChip;
