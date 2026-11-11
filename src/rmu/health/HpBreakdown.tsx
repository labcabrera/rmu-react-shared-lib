import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Stack, Typography } from '@mui/material';
import { HP_LOG_KINDS, HpBySource } from '../../api/health.dto';

/** A change of hits with its sign: `-10`, `+5`. */
export const formatHpAmount = (amount: number): string => (amount > 0 ? `+${amount}` : `${amount}`);

/** Colour of a change of hits: damage in red, healing in green. */
export const hpAmountColor = (amount: number): string =>
  amount < 0 ? 'error.main' : amount > 0 ? 'success.main' : 'text.secondary';

const Row: FC<{ label: string; amount: number }> = ({ label, amount }) => (
  <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
    <Typography variant="body2">{label}</Typography>
    <Typography variant="body2" sx={{ color: hpAmountColor(amount), fontVariantNumeric: 'tabular-nums' }}>
      {formatHpAmount(amount)}
    </Typography>
  </Stack>
);

/**
 * Totals of the hits log of a character (spec 013, §1.1): by kind (attack, criticals, bleeding...) and by attacker.
 * Renders nothing when there are no totals.
 */
const HpBreakdown: FC<{ bySource: HpBySource | undefined; dense?: boolean }> = ({ bySource, dense = false }) => {
  const { t } = useTranslation();
  const kinds = HP_LOG_KINDS.filter((kind) => !!bySource?.byKind?.[kind]);
  const attackers = (bySource?.byAttacker || []).filter((attacker) => attacker.amount !== 0);
  if (kinds.length === 0 && attackers.length === 0) return null;

  return (
    <Stack spacing={dense ? 0.5 : 1} sx={{ minWidth: 180 }}>
      {kinds.length > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary">
            {t('hp-by-kind')}
          </Typography>
          {kinds.map((kind) => (
            <Row key={kind} label={t(`hp-log-kind-${kind}`)} amount={bySource!.byKind[kind]!} />
          ))}
        </Box>
      )}
      {attackers.length > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary">
            {t('hp-by-attacker')}
          </Typography>
          {attackers.map((attacker) => (
            <Row
              key={attacker.attackerId}
              label={attacker.attackerName || attacker.attackerId}
              amount={attacker.amount}
            />
          ))}
        </Box>
      )}
    </Stack>
  );
};

export default HpBreakdown;
