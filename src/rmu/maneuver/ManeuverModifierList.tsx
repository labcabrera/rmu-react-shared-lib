import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { ManeuverModifier } from '../../api/maneuver-modifier.dto';
import { bonusColor, formatBonus } from '../character/StatPill';
import ManeuverOriginChip, { ManeuverOrigin } from './ManeuverOriginChip';

export type ManeuverModifierWithOrigin = ManeuverModifier & { origin?: ManeuverOrigin };

/**
 * Read-only list of the catalog maneuver modifiers that apply to a skill (spec 010): one row per modifier with
 * its translated name, the description as secondary text, the origin (skill or category) and the value by type:
 * `flag` a signed bonus, `choice` a chip per option, `number` the bonus per unit and the range of units.
 */
const ManeuverModifierList: FC<{
  modifiers: ManeuverModifierWithOrigin[];
  /** Text when there are no modifiers (default `t('no-maneuver-modifiers')`). */
  emptyText?: string;
}> = ({ modifiers, emptyText }) => {
  const { t } = useTranslation();

  const label = (key: string): string => t(key, { defaultValue: key });

  const renderValue = (modifier: ManeuverModifier): ReactNode => {
    switch (modifier.type) {
      case 'flag':
        return modifier.value !== undefined ? (
          <Typography variant="body2" sx={{ fontWeight: 700, color: bonusColor(modifier.value) }}>
            {formatBonus(modifier.value)}
          </Typography>
        ) : null;
      case 'choice':
        return (
          <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 0.5, justifyContent: { sm: 'flex-end' } }}>
            {(modifier.options || []).map((option) => (
              <Chip
                key={option.key}
                size="small"
                variant="outlined"
                label={`${label(`${modifier.key}.${option.key}`)} ${formatBonus(option.value)}`}
              />
            ))}
          </Stack>
        );
      case 'number': {
        const parts: string[] = [];
        if (modifier.perUnit !== undefined) {
          parts.push(t('maneuver-number-per-unit', { value: formatBonus(modifier.perUnit) }));
        }
        if (modifier.min !== undefined || modifier.max !== undefined) {
          parts.push(t('maneuver-number-range', { min: modifier.min ?? '-', max: modifier.max ?? '-' }));
        }
        return (
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {parts.join(', ')}
          </Typography>
        );
      }
      default:
        return null;
    }
  };

  if (modifiers.length === 0) {
    return <Typography color="text.secondary">{emptyText ?? t('no-maneuver-modifiers')}</Typography>;
  }

  return (
    <Stack divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
      {modifiers.map((modifier) => (
        <Stack
          key={`${modifier.origin ?? ''}-${modifier.id}`}
          direction={{ xs: 'column', sm: 'row' }}
          sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 1, py: 1 }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {label(modifier.key)}
              </Typography>
              {modifier.origin && <ManeuverOriginChip origin={modifier.origin} />}
              {modifier.reference && <Chip size="small" variant="outlined" label={t('maneuver-modifier-reference')} />}
            </Stack>
            {modifier.description && (
              <Typography variant="caption" color="text.secondary" component="div">
                {modifier.description}
              </Typography>
            )}
          </Box>
          <Box sx={{ flex: 'none', maxWidth: { sm: '50%' }, textAlign: { sm: 'right' } }}>{renderValue(modifier)}</Box>
        </Stack>
      ))}
    </Stack>
  );
};

export default ManeuverModifierList;
