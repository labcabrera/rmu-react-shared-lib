import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, LinearProgress, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import { SIDE_STRENGTH_THRESHOLDS, SideStrength } from './side-strength';

export interface SideStrengthBarProps {
  /** Name of the side. */
  label: string;
  /** Colour of the side: the standing part of the strength bar. */
  color: string;
  strength: SideStrength;
  leaderName?: string;
  /** Thinner bars and smaller text, for the dashboard strip. */
  dense?: boolean;
}

const percentOf = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0);

/**
 * Strength of a side of a tactical game (spec 100, decisions 12-16): a stacked bar of levels standing,
 * incapacitated and fled, with marks at 50, 25 and 10 %, and a bar of the combined hit points of every member.
 * The tooltip gives the breakdown in levels and heads.
 */
const SideStrengthBar: FC<SideStrengthBarProps> = ({ label, color, strength, leaderName, dense = false }) => {
  const { t } = useTranslation();
  const { palette } = useTheme();
  const total = strength.totalLevels;
  const standingPercent = percentOf(strength.standingLevels, total);
  const hpPercent = strength.hpMax > 0 ? Math.max(0, Math.min(100, (strength.hpCurrent / strength.hpMax) * 100)) : 0;
  // An older shell theme may have no resource colours.
  const hpColor = palette.resource?.hp ?? palette.error.main;
  const tones = {
    standing: color,
    incapacitated: palette.text.disabled,
    fled: palette.warning.main,
  };
  const segments = [
    { key: 'standing', levels: strength.standingLevels, count: strength.standingCount },
    { key: 'incapacitated', levels: strength.incapacitatedLevels, count: strength.incapacitatedCount },
    { key: 'fled', levels: strength.fledLevels, count: strength.fledCount },
  ] as const;
  const barHeight = dense ? 6 : 10;

  const breakdown = (
    <Stack spacing={0.25} sx={{ py: 0.25 }}>
      {segments.map((segment) => (
        <Stack key={segment.key} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: tones[segment.key], flexShrink: 0 }} />
          <Typography variant="caption" sx={{ flexGrow: 1 }}>
            {t(`side-strength-${segment.key}`)}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            {t('side-strength-levels-heads', { levels: segment.levels, count: segment.count })}
          </Typography>
        </Stack>
      ))}
      <Typography variant="caption" sx={{ opacity: 0.8 }}>
        {t('side-strength-thresholds')}
      </Typography>
    </Stack>
  );

  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
        <Typography variant={dense ? 'caption' : 'subtitle2'} sx={{ fontWeight: 700, flexGrow: 1 }} noWrap>
          {label}
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 700 }} noWrap>
          {`${strength.standingLevels} / ${total} · ${standingPercent}%`}
        </Typography>
      </Stack>
      {leaderName && (
        <Typography variant="caption" color="text.secondary" noWrap component="div">
          {t('side-strength-leader', { name: leaderName })}
        </Typography>
      )}
      <Tooltip title={breakdown} arrow>
        <Box
          role="meter"
          tabIndex={0}
          aria-label={t('side-strength-strength-aria', {
            label,
            standing: strength.standingLevels,
            total,
          })}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={strength.standingLevels}
          sx={{
            position: 'relative',
            display: 'flex',
            mt: dense ? 0.25 : 0.5,
            height: barHeight,
            borderRadius: 1,
            overflow: 'hidden',
            bgcolor: 'action.hover',
          }}
        >
          {total > 0 &&
            segments.map((segment) =>
              segment.levels > 0 ? (
                <Box
                  key={segment.key}
                  data-segment={segment.key}
                  sx={{ width: `${(segment.levels / total) * 100}%`, bgcolor: tones[segment.key] }}
                />
              ) : null
            )}
          {SIDE_STRENGTH_THRESHOLDS.map((threshold) => (
            <Box
              key={threshold}
              data-threshold={threshold}
              aria-hidden
              sx={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${threshold * 100}%`,
                width: '1px',
                bgcolor: 'background.paper',
                opacity: 0.9,
              }}
            />
          ))}
        </Box>
      </Tooltip>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: dense ? 0.25 : 0.5 }}>
        {!dense && (
          <Typography variant="caption" color="text.secondary" noWrap>
            {t('side-strength-hp')}
          </Typography>
        )}
        <LinearProgress
          variant="determinate"
          value={hpPercent}
          aria-label={t('side-strength-hp-aria', { label, current: strength.hpCurrent, max: strength.hpMax })}
          sx={{
            flexGrow: 1,
            height: dense ? 3 : 5,
            borderRadius: 1,
            bgcolor: 'action.hover',
            '& .MuiLinearProgress-bar': { bgcolor: hpColor },
          }}
        />
        <Typography variant="caption" color="text.secondary" noWrap>
          {`${strength.hpCurrent} / ${strength.hpMax}`}
        </Typography>
      </Stack>
    </Box>
  );
};

export default SideStrengthBar;
