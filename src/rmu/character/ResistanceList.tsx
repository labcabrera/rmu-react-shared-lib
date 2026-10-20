import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { CharacterResistance } from '../../api/character.dto';
import { formatBonus } from './StatPill';

/** Resistances as compact rows: name and total bonus, with the breakdown as a tooltip. */
const ResistanceList: FC<{ resistances: CharacterResistance[] }> = ({ resistances }) => {
  const { t } = useTranslation();
  return (
    <Stack divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
      {resistances.map((resistance) => {
        const breakdown = [
          `${t('stat')} ${formatBonus(resistance.statBonus)}`,
          `${t('racial')} ${formatBonus(resistance.racialBonus)}`,
          `${t('realm')} ${formatBonus(resistance.realmBonus)}`,
          resistance.traitBonus ? `${t('trait-bonus')} ${formatBonus(resistance.traitBonus)}` : undefined,
          `${t('custom')} ${formatBonus(resistance.customBonus)}`,
        ]
          .filter(Boolean)
          .join(' · ');
        return (
          <Tooltip key={resistance.resistance} title={breakdown} placement="left">
            <Stack direction="row" sx={{ justifyContent: 'space-between', py: 0.75 }}>
              <Typography variant="body2">{t(resistance.resistance)}</Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: resistance.totalBonus < 0 ? 'stat.negative' : 'text.primary' }}
              >
                {formatBonus(resistance.totalBonus)}
              </Typography>
            </Stack>
          </Tooltip>
        );
      })}
    </Stack>
  );
};

export default ResistanceList;
