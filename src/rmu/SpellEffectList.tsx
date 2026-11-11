import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, Stack, Tooltip, Typography } from '@mui/material';
import {
  SPELL_AFFLICTION_TYPES,
  SPELL_INJURY_TYPES,
  SpellAfflictionPeriodicEffect,
  SpellEffect,
  SpellEffectKind,
} from '../api/spell.dto';
import { formatBonus } from './character/StatPill';
import { spellDurationText, spellPerLevelSuffix, SpellTranslate } from './spell/spell-format';

export type SpellEffectColor = 'error' | 'success' | 'warning' | 'info' | 'default';

const KIND_COLORS: Partial<Record<SpellEffectKind, SpellEffectColor>> = {
  attack: 'error',
  critical: 'error',
  damage: 'error',
  heal: 'success',
  cure: 'success',
  condition: 'warning',
  afflict: 'warning',
  modifier: 'info',
  protection: 'info',
  dispel: 'info',
};

/** Chip color of an effect kind: harm red, healing green, conditions amber, modifiers blue, utility neutral. */
export const spellEffectColor = (kind: SpellEffectKind): SpellEffectColor => KIND_COLORS[kind] ?? 'default';

const LETTER_CRITICALS = /^[A-Z]$/;

const criticalName = (type: string | null | undefined, t: SpellTranslate) =>
  !type ? '' : LETTER_CRITICALS.test(type) ? type : t(`spell-critical-${type}`, { defaultValue: type });

/**
 * Name of a status, affliction or injury type an effect uses. `spell-status-<id>` wins over the plain key, for the
 * ids whose plain key means something else (`hold`).
 */
const statusName = (id: string, t: SpellTranslate): string => {
  if (SPELL_INJURY_TYPES.includes(id)) return t(`injury-type-${id}`);
  if ((SPELL_AFFLICTION_TYPES as string[]).includes(id)) return t(`spell-affliction-${id}`);
  return t(`spell-status-${id}`, { defaultValue: t(id) });
};

const tag = (value: string, t: SpellTranslate) => t(value, { defaultValue: value });

/** The list of a field, or none when it is missing or not a list (the form preview shows effects being typed). */
const asList = <T,>(value: T[] | null | undefined): T[] => (Array.isArray(value) ? value : []);

type SummaryEffect = SpellEffect | SpellAfflictionPeriodicEffect;

/** Short text of what an effect does, built from its fields; empty for the utility kinds, which only have a note. */
export const spellEffectSummary = (effect: SummaryEffect, t: SpellTranslate): string => {
  const parts: string[] = [];
  const perLevel = spellPerLevelSuffix(1, t);
  switch (effect.kind) {
    case 'attack':
      parts.push(`${t(`spell-attack-table-${effect.attackTable}`)} (${t(effect.attackSize)})`);
      parts.push(t(`spell-effect-ob-${effect.ob}`));
      if (effect.criticalType) parts.push(t('spell-effect-critical', { type: criticalName(effect.criticalType, t) }));
      if (effect.count) parts.push(t('spell-effect-attack-count', { count: effect.count }));
      if (effect.radius) parts.push(t('spell-effect-radius', { radius: effect.radius }));
      break;
    case 'critical': {
      const name = criticalName(effect.criticalType, t);
      if (effect.severity) parts.push(t('spell-effect-critical', { type: `${name} ${effect.severity}` }));
      else {
        parts.push(t('spell-effect-critical', { type: name }));
        const offset = effect.severityOffset ?? 0;
        parts.push(
          offset === 0 ? t('spell-effect-critical-same') : t('spell-effect-critical-lower', { count: Math.abs(offset) })
        );
      }
      if (effect.perFailure) parts.push(t('spell-effect-critical-per-failure'));
      break;
    }
    case 'damage': {
      const value = effect.hits ?? effect.dice;
      if (value !== null && value !== undefined) {
        parts.push(t('spell-effect-hits', { value: `${value}${effect.perLevel ? perLevel : ''}` }));
      }
      break;
    }
    case 'heal':
      if (effect.hits) parts.push(t('spell-effect-heal-hits', { value: effect.hits }));
      if (effect.hitsPerLevel) parts.push(t('spell-effect-heal-hits', { value: `${effect.hitsPerLevel}${perLevel}` }));
      if (effect.bleeding === 'all') parts.push(t('spell-effect-heal-bleeding-all'));
      else if (effect.bleeding) parts.push(t('spell-effect-heal-bleeding', { value: effect.bleeding }));
      if (effect.stunRounds) parts.push(t('spell-effect-heal-stun', { count: effect.stunRounds }));
      if (effect.injury) {
        const detail = [
          ...asList(effect.injury.types).map((type) => t(`injury-type-${type}`)),
          ...asList(effect.injury.locations).map((location) => t(location)),
          ...(effect.injury.severity ? [t(`spell-severity-${effect.injury.severity}`)] : []),
        ].join(', ');
        parts.push(detail ? t('spell-effect-heal-injury-detail', { detail }) : t('spell-effect-heal-injury'));
      }
      if (effect.tier) parts.push(t(`spell-effect-heal-tier-${effect.tier}`));
      if (effect.revive) parts.push(t('spell-effect-heal-revive'));
      break;
    case 'condition': {
      const text = [statusName(effect.status, t)];
      if (effect.value !== null && effect.value !== undefined) text.push(`${effect.value}`);
      if (effect.rounds) text.push(t('rounds-short', { count: effect.rounds }));
      parts.push(text.join(' '));
      break;
    }
    case 'modifier': {
      const text = `${t(`spell-effect-stat-${effect.stat}`)} ${formatBonus(effect.value)}${effect.perLevel ? perLevel : ''}`;
      const filter = asList(effect.filter)
        .map((value) => tag(value, t))
        .join(', ');
      parts.push(filter ? `${text} (${filter})` : text);
      break;
    }
    case 'afflict': {
      const head = [t(`spell-affliction-${effect.afflictionType}`)];
      if (effect.severity) head.push(t(`spell-severity-${effect.severity}`).toLowerCase());
      parts.push(head.join(' '));
      if (effect.onset) parts.push(t('spell-effect-onset', { onset: effect.onset }));
      const periodic = asList(effect.effects)
        .filter((sub) => sub && typeof sub === 'object')
        .map((sub) => spellEffectSummary(sub, t))
        .filter(Boolean);
      if (periodic.length) parts.push(t('spell-effect-periodic', { effects: periodic.join('; ') }));
      if (asList(effect.curedBy).length) {
        parts.push(t('spell-effect-cured-by', { list: asList(effect.curedBy).join(', ') }));
      }
      break;
    }
    case 'cure':
      parts.push(
        t('spell-effect-removes', {
          list: asList(effect.removes)
            .map((id) => statusName(id, t))
            .join(', '),
        })
      );
      break;
    case 'dispel':
      parts.push(t(`spell-effect-dispel-${effect.scope}`));
      break;
    case 'protection':
      parts.push(
        t('spell-effect-against', {
          list: asList(effect.against)
            .map((value) => tag(value, t))
            .join(', '),
        })
      );
      break;
    default:
      break;
  }
  return parts.join(', ');
};

/**
 * Read-only list of the effects of a spell (spec 028): one row per effect with its kind as a chip colored by group,
 * a summary of its fields, who it applies to, a marker when it needs a failed RR, its own duration (when it differs
 * from the spell's) and the note as secondary text.
 */
const SpellEffectList: FC<{
  effects: SpellEffect[] | null | undefined;
  /** Text when there are no effects (default `t('spell-no-effects')`). */
  emptyText?: string;
}> = ({ effects, emptyText }) => {
  const { t } = useTranslation();

  if (!effects || effects.length === 0) {
    return <Typography color="text.secondary">{emptyText ?? t('spell-no-effects')}</Typography>;
  }

  return (
    <Stack divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
      {effects.map((effect, index) => {
        const summary = spellEffectSummary(effect, t);
        return (
          <Stack
            key={`${effect.kind}-${index}`}
            direction={{ xs: 'column', sm: 'row' }}
            sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 1, py: 1 }}
            data-testid="spell-effect"
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack direction="row" useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Chip
                  size="small"
                  label={t(`spell-effect-kind-${effect.kind}`)}
                  color={spellEffectColor(effect.kind)}
                />
                {summary && (
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {summary}
                  </Typography>
                )}
              </Stack>
              {effect.note && (
                <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
                  {effect.note}
                </Typography>
              )}
            </Box>
            <Stack
              direction="row"
              useFlexGap
              sx={{
                flex: 'none',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 0.5,
                justifyContent: { sm: 'flex-end' },
              }}
            >
              {effect.appliesTo && (
                <Chip size="small" variant="outlined" label={t(`spell-effect-applies-${effect.appliesTo}`)} />
              )}
              {effect.requiresFailedRr && (
                <Tooltip title={t('spell-effect-requires-failed-rr-help')}>
                  <Chip size="small" variant="outlined" color="warning" label={t('spell-effect-requires-failed-rr')} />
                </Tooltip>
              )}
              {effect.duration && (
                <Chip size="small" variant="outlined" label={spellDurationText(effect.duration, t)} />
              )}
            </Stack>
          </Stack>
        );
      })}
    </Stack>
  );
};

export default SpellEffectList;
