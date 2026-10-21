import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, ButtonBase, LinearProgress, Stack, Typography } from '@mui/material';
import { CharacterStat, StatKey } from '../../api/character.dto';
import { bonusColor, formatBonus } from './StatPill';

export const statKeys: StatKey[] = ['ag', 'co', 'em', 'in', 'me', 'pr', 'qu', 're', 'sd', 'st'];

/**
 * The ten stats as compact tiles: abbreviation, total bonus, and temporary over potential with a bar.
 * Two rows of five from `sm` up (no half-empty row), two columns on phones.
 */
const StatBlock: FC<{
  statistics: Record<StatKey, CharacterStat>;
  /** Makes each tile a button (for example to open the stat detail). */
  onSelect?: (stat: StatKey) => void;
}> = ({ statistics, onSelect }) => {
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
        const stat = statistics[key];
        if (!stat) return null;
        const tile = (
          <Box
            sx={(theme) => ({
              width: '100%',
              p: 1,
              textAlign: 'left',
              borderRadius: `${theme.radius.sm}px`,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.light',
            })}
          >
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: '0.04em' }}>
                {key.toUpperCase()}
              </Typography>
              <Typography variant="h6" component="span" sx={{ color: bonusColor(stat.totalBonus), lineHeight: 1 }}>
                {formatBonus(stat.totalBonus)}
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" component="div" noWrap>
              {t(key)}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.5 }}>
              <LinearProgress
                variant="determinate"
                value={stat.potential > 0 ? Math.min(100, (stat.temporary / stat.potential) * 100) : 0}
                aria-label={`${t('temporary')} / ${t('potential')}`}
                sx={{ flex: 1, height: 4 }}
              />
              <Typography variant="caption" color="text.secondary" noWrap>
                {stat.temporary}/{stat.potential}
              </Typography>
            </Stack>
          </Box>
        );
        return onSelect ? (
          <ButtonBase key={key} onClick={() => onSelect(key)} sx={{ borderRadius: 1, display: 'block' }}>
            {tile}
          </ButtonBase>
        ) : (
          <Box key={key}>{tile}</Box>
        );
      })}
    </Box>
  );
};

export default StatBlock;
