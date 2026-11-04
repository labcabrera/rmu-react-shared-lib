import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, Stack, Typography } from '@mui/material';
import RuleHint from '../RuleHint';
import { attackSizeEffect, expectedCriticalShift, formatMultiplier, signedSteps } from './attack-size';

type AttackSizeChipProps = {
  /** Size of the attack in steps from Medium. */
  steps: number;
  /** Size of the target for the critical, in steps from Medium: adds the expected shift against it. */
  targetSteps?: number | null;
  /** Shows the chip also for a Medium attack (it renders nothing by default). */
  showMedium?: boolean;
  size?: 'small' | 'medium';
};

/**
 * The size of an attack (workspace spec 075) as a chip, `Big (+1)`, that explains its effect (§9.4): the damage of the
 * table times the Hit Multiplier and the critical one level up or down for each step against a Medium target.
 */
const AttackSizeChip: FC<AttackSizeChipProps> = ({ steps, targetSteps, showMedium = false, size = 'small' }) => {
  const { t, i18n } = useTranslation();
  const effect = attackSizeEffect(steps);
  if (effect.steps === 0 && !showMedium) return null;
  const sizeLabel = t(`size-${effect.sizeId}`);
  const label = `${sizeLabel} (${signedSteps(effect.steps)})`;
  const multiplier = formatMultiplier(effect.hitMultiplier, i18n?.language);
  const hasTarget = targetSteps !== undefined && targetSteps !== null;
  const targetShift = hasTarget ? expectedCriticalShift(effect.steps, targetSteps) : 0;
  const targetEffect = hasTarget ? attackSizeEffect(targetSteps) : null;
  return (
    <Box component="span" sx={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <RuleHint
        title={t('attack-size-effect', { size: sizeLabel })}
        reference="§9.4"
        description={
          <Stack component="span" spacing={0.5}>
            <Typography component="span" variant="body2" color="text.secondary">
              {t('attack-size-damage', { multiplier })}
            </Typography>
            <Typography component="span" variant="body2" color="text.secondary">
              {t('attack-size-critical', { shift: signedSteps(effect.criticalShift) })}
            </Typography>
            {targetEffect && (
              <Typography component="span" variant="body2" sx={{ fontWeight: 600 }}>
                {t('attack-size-vs-target', {
                  target: t(`size-${targetEffect.sizeId}`),
                  shift: signedSteps(targetShift),
                })}
              </Typography>
            )}
          </Stack>
        }
      >
        <Chip
          size={size}
          variant="outlined"
          color={effect.steps > 0 ? 'warning' : effect.steps < 0 ? 'info' : 'default'}
          label={label}
          sx={{ cursor: 'inherit' }}
        />
      </RuleHint>
    </Box>
  );
};

export default AttackSizeChip;
