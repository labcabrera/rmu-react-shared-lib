import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Divider, Stack, Typography } from '@mui/material';

/** Group of a modifier in the breakdown: the attacker's side, the target's, the situation or the critical. */
export type RollModifierGroup = 'offense' | 'defense' | 'situation' | 'critical' | 'resolution';

/** One entry of a roll breakdown, as the combat API returns it. */
export type RollModifier = { key: string; value: number; group?: RollModifierGroup; source?: string };

const GROUP_ORDER: (RollModifierGroup | 'other')[] = ['offense', 'defense', 'situation', 'critical', 'resolution', 'other'];

const signed = (value: number) => (value > 0 ? `+${value}` : `${value}`);

/** Translated label of a modifier key; unknown keys are shown readable ("restricted-quarters" → "Restricted quarters"). */
export const useModifierLabel = () => {
  const { t } = useTranslation();
  return (key: string) => {
    const fallback = key.replace(/[-_]/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
    return t(key, { defaultValue: fallback });
  };
};

const Row: FC<{ label: string; value: number; strong?: boolean }> = ({ label, value, strong }) => (
  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 2, py: 0.25 }}>
    <Typography variant="body2" color={strong ? 'text.primary' : 'text.secondary'} sx={{ fontWeight: strong ? 700 : 400 }}>
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        fontWeight: strong ? 700 : 600,
        fontVariantNumeric: 'tabular-nums',
        color: strong ? 'text.primary' : value > 0 ? 'success.main' : value < 0 ? 'error.main' : 'text.secondary',
      }}
    >
      {strong ? value : signed(value)}
    </Typography>
  </Stack>
);

/**
 * How a roll total is built: the modifiers grouped by side (attacker, target, situation…) with their subtotal,
 * then the roll and the total. Works the same on phones and desktops: one readable column.
 */
const RollBreakdown: FC<{
  modifiers: RollModifier[];
  /** The rolled value, when there is one: shown before the total and added to it. */
  roll?: number | null;
  /** Total to show; defaults to the sum of the modifiers plus the roll. */
  total?: number;
  totalLabel?: string;
}> = ({ modifiers, roll, total, totalLabel }) => {
  const { t } = useTranslation();
  const label = useModifierLabel();
  const sum = modifiers.reduce((acc, modifier) => acc + modifier.value, 0);
  const computedTotal = total ?? sum + (roll ?? 0);
  const groups = GROUP_ORDER.map((group) => ({
    group,
    items: modifiers.filter((modifier) => (modifier.group ?? 'other') === group),
  })).filter(({ items }) => items.length > 0);

  return (
    <Stack spacing={1} aria-label={t('roll-breakdown')}>
      {groups.map(({ group, items }) => (
        <Box key={group}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              {t(`modifier-group-${group}`)}
            </Typography>
            {groups.length > 1 && (
              <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {signed(items.reduce((acc, modifier) => acc + modifier.value, 0))}
              </Typography>
            )}
          </Stack>
          {items.map((modifier, index) => (
            <Row key={`${modifier.key}-${index}`} label={label(modifier.key)} value={modifier.value} />
          ))}
        </Box>
      ))}
      <Divider />
      {roll !== undefined && roll !== null && <Row label={t('roll')} value={roll} />}
      <Row label={totalLabel ?? t('total')} value={computedTotal} strong />
    </Stack>
  );
};

export default RollBreakdown;
