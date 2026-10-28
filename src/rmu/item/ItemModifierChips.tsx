import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Typography } from '@mui/material';
import { StrategicItemModifier } from '../../api/item-modifier.dto';
import StatusBadge, { StatusBadgeColor } from '../StatusBadge';

const signed = (value: number): string => (value > 0 ? `+${value}` : `${value}`);

const modifierColor = (modifier: StrategicItemModifier): StatusBadgeColor => {
  if (modifier.type === 'breakage') return modifier.broken ? 'error' : 'warning';
  // Spec 043: a bonus of a circumstance only, applied by the game master
  if (modifier.condition) return 'info';
  if (modifier.value > 0) return 'success';
  if (modifier.value < 0) return 'warning';
  return 'default';
};

/**
 * One badge per modifier of an item (spec 019): its kind and signed value, and on hover or tap what it applies to,
 * where it comes from (the tactical game and round, or set by hand) and its description. `max` folds the rest into a
 * "+N" badge that lists them.
 */
const ItemModifierChips: FC<{
  modifiers: StrategicItemModifier[] | undefined;
  max?: number;
  size?: 'small' | 'medium';
}> = ({ modifiers, max, size = 'small' }) => {
  const { t } = useTranslation();
  const list = modifiers || [];
  if (list.length === 0) return null;
  const shown = max !== undefined && list.length > max ? list.slice(0, max) : list;
  const hidden = list.slice(shown.length);

  const source = (modifier: StrategicItemModifier): string =>
    modifier.source?.kind === 'tactical'
      ? t('item-modifier-source-tactical', {
          name: modifier.source.tacticalGameName ?? modifier.source.tacticalGameId ?? '',
          round: modifier.source.round ?? '',
        })
      : t(`item-modifier-source-${modifier.source?.kind ?? 'manual'}`);

  // Modifiers made by an operation (spec 023) carry a key as their description; those of the game master, free text
  const description = (modifier: StrategicItemModifier): string | undefined =>
    modifier.description &&
    modifier.source?.kind &&
    modifier.source.kind !== 'manual' &&
    modifier.source.kind !== 'tactical'
      ? t(`item-modifier-note-${modifier.description}`, { defaultValue: modifier.description })
      : modifier.description;

  const summary = (modifier: StrategicItemModifier): string =>
    `${t(`item-modifier-type-${modifier.type}`)} ${signed(modifier.value)} · ${
      modifier.condition ? t(modifier.condition, modifier.condition) : t(`item-modifier-target-${modifier.appliesTo}`)
    }`;

  return (
    <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
      {shown.map((modifier) => (
        <StatusBadge
          key={modifier.id}
          status={`item-modifier-${modifier.type}`}
          label={t(`item-modifier-type-${modifier.type}`)}
          value={signed(modifier.value)}
          color={modifierColor(modifier)}
          size={size}
          detail={
            <Stack spacing={0.25}>
              <span>{`${t('item-modifier-target')}: ${t(`item-modifier-target-${modifier.appliesTo}`)}`}</span>
              <span>{source(modifier)}</span>
              {modifier.condition && (
                <span>{t('item-modifier-condition', { condition: t(modifier.condition, modifier.condition) })}</span>
              )}
              {modifier.broken && <span>{t('item-condition-broken-detail')}</span>}
              {modifier.description && <span>{description(modifier)}</span>}
            </Stack>
          }
        />
      ))}
      {hidden.length > 0 && (
        <StatusBadge
          status="item-modifier-more"
          label={t('item-modifiers-more', { count: hidden.length })}
          abbr={`+${hidden.length}`}
          size={size}
          detail={
            <Stack spacing={0.25}>
              {hidden.map((modifier) => (
                <Typography key={modifier.id} variant="body2" component="span">
                  {summary(modifier)}
                </Typography>
              ))}
            </Stack>
          }
        />
      )}
    </Stack>
  );
};

export default ItemModifierChips;
