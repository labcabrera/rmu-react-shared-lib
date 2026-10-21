import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Stack, Typography } from '@mui/material';
import { StatKey } from '../../api/character.dto';
import { statKeys } from './StatBlock';
import { bonusColor, formatBonus } from './StatPill';

/**
 * Stat bonuses (for example the racial ones) as compact tiles, with the look of `StatBlock` but without the
 * temporary / potential values. Two rows of five from `sm` up, two columns on phones. Missing stats are skipped.
 */
const StatBonusGrid: FC<{
  stats: Partial<Record<StatKey, number>>;
  /** Smaller tiles without the full stat name. */
  dense?: boolean;
}> = ({ stats, dense = false }) => {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(5, minmax(0, 1fr))' },
        gap: 1,
      }}
    >
      {statKeys.map((key) => {
        const value = stats[key];
        if (value === undefined || value === null) return null;
        return (
          <Box
            key={key}
            sx={(theme) => ({
              p: dense ? 0.75 : 1,
              borderRadius: `${theme.radius.sm}px`,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.light',
            })}
          >
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: '0.04em' }} title={t(key)}>
                {key.toUpperCase()}
              </Typography>
              <Typography
                variant={dense ? 'subtitle1' : 'h6'}
                component="span"
                sx={{ color: bonusColor(value), lineHeight: 1, fontWeight: 700 }}
              >
                {formatBonus(value)}
              </Typography>
            </Stack>
            {!dense && (
              <Typography variant="caption" color="text.secondary" component="div" noWrap>
                {t(key)}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default StatBonusGrid;
