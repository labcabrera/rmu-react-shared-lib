import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import ScienceIcon from '@mui/icons-material/Science';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { InjuryPoison, PoisonSeverity, PoisonStage, ROUNDS_PER_HOUR } from '../../api/poison.dto';
import { bonusColor } from '../character/StatPill';

const ROUNDS_PER_MINUTE = 6;
const ROUNDS_PER_DAY = 24 * ROUNDS_PER_HOUR;

const SEVERITY_COLORS: Record<PoisonSeverity, 'default' | 'warning' | 'error'> = {
  mild: 'default',
  moderate: 'warning',
  severe: 'error',
  extreme: 'error',
};

/**
 * A time of a poisoning in its largest whole unit: rounds, minutes, hours or days. The keys take a count, so the
 * locales give the plural forms.
 */
export const poisonTimeLabel = (
  rounds: number,
  t: (key: string, options?: Record<string, unknown>) => string
): string => {
  if (rounds >= ROUNDS_PER_DAY && rounds % ROUNDS_PER_DAY === 0)
    return t('poison-time-days', { count: rounds / ROUNDS_PER_DAY });
  if (rounds >= ROUNDS_PER_HOUR && rounds % ROUNDS_PER_HOUR === 0)
    return t('poison-time-hours', { count: rounds / ROUNDS_PER_HOUR });
  if (rounds >= ROUNDS_PER_MINUTE && rounds % ROUNDS_PER_MINUTE === 0)
    return t('poison-time-minutes', { count: rounds / ROUNDS_PER_MINUTE });
  return t('poison-time-rounds', { count: rounds });
};

export type PoisonStageState = 'pending' | 'active' | 'ended';

export const poisonStageState = (stage: PoisonStage): PoisonStageState => {
  if (stage.ended) return 'ended';
  return stage.started ? 'active' : 'pending';
};

const StageRow: FC<{ stage: PoisonStage; neutralized: boolean }> = ({ stage, neutralized }) => {
  const { t } = useTranslation();
  const state = neutralized && !stage.ended ? 'ended' : poisonStageState(stage);
  const window =
    stage.endsAt === null
      ? t('poison-stage-from', { from: poisonTimeLabel(stage.startsAt, t) })
      : t('poison-stage-window', { from: poisonTimeLabel(stage.startsAt, t), to: poisonTimeLabel(stage.endsAt, t) });
  const details = [
    stage.penalty ? t('poison-stage-penalty', { value: stage.penalty }) : undefined,
    stage.hitsPerRound ? t('poison-stage-hits', { value: stage.hitsPerRound }) : undefined,
    stage.condition
      ? t('poison-stage-condition', {
          condition: t(`poison-condition-${stage.condition}`),
          at: poisonTimeLabel(stage.conditionAt ?? stage.startsAt, t),
        })
      : undefined,
    stage.permanent ? t('poison-stage-permanent') : undefined,
  ].filter(Boolean);
  return (
    <Stack
      direction="row"
      useFlexGap
      data-testid={`poison-stage-${stage.severity}`}
      data-state={state}
      sx={{ flexWrap: 'wrap', alignItems: 'center', columnGap: 1, rowGap: 0.25, opacity: state === 'ended' ? 0.6 : 1 }}
    >
      <Chip
        size="small"
        color={SEVERITY_COLORS[stage.severity]}
        variant={state === 'active' ? 'filled' : 'outlined'}
        label={t(`poison-severity-${stage.severity}`)}
      />
      <Typography variant="body2" color="text.secondary">
        {window}
      </Typography>
      {details.length > 0 && (
        <Typography variant="body2" sx={{ color: stage.penalty ? bonusColor(stage.penalty) : undefined }}>
          {details.join(' · ')}
        </Typography>
      )}
      <Typography variant="caption" color="text.secondary">
        {t(`poison-stage-state-${state}`)}
      </Typography>
    </Stack>
  );
};

/**
 * The poisoning of an injury (spec 042): the poison, its RR, the time since the exposure, each stage with its window,
 * penalty, hits and condition, and the antidotes given.
 */
const PoisonStageTimeline: FC<{ poison: InjuryPoison; dense?: boolean }> = ({ poison, dense = false }) => {
  const { t } = useTranslation();
  const neutralized = !!poison.neutralized;
  return (
    <Box sx={{ mt: 1 }}>
      <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center', gap: 0.75 }}>
        <ScienceIcon fontSize="small" color="secondary" />
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {poison.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('poison-summary', {
            category: t(`poison-category-${poison.category}`),
            level: poison.level,
            elapsed: poisonTimeLabel(poison.elapsedRounds, t),
          })}
        </Typography>
        {neutralized && <Chip size="small" color="success" variant="outlined" label={t('poison-neutralized')} />}
        {!neutralized && poison.finished && <Chip size="small" variant="outlined" label={t('poison-finished')} />}
      </Stack>
      {!dense && (
        <Typography variant="caption" color="text.secondary">
          {t('poison-rr-summary', { roll: poison.rr.roll, total: poison.rr.total, failure: poison.rr.failure })}
        </Typography>
      )}
      <Stack spacing={0.5} sx={{ mt: 0.5, pl: 1, borderLeft: 2, borderColor: 'divider' }}>
        {poison.stages.map((stage) => (
          <StageRow key={stage.severity} stage={stage} neutralized={neutralized} />
        ))}
      </Stack>
      {!dense && (poison.antidotes ?? []).length > 0 && (
        <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
          {t('poison-antidotes', {
            list: (poison.antidotes ?? [])
              .map((antidote) =>
                antidote.neutralized ? antidote.name : t('poison-antidote-failed', { name: antidote.name })
              )
              .join(', '),
          })}
        </Typography>
      )}
    </Box>
  );
};

export default PoisonStageTimeline;
