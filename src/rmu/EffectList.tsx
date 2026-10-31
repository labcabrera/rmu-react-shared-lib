import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Chip, Stack, Tooltip } from '@mui/material';
import { resolveAssetUrl } from '../config/asset-url';
import StatusBadge from './StatusBadge';

/** An effect on an actor: a status with an optional value and duration. */
export type ActorEffect = { status: string; value?: number | null; rounds?: number | null; delay?: number | null };
/** A penalty and where it comes from (hit points, effects, armour…). */
export type ActorPenalty = { source: string; value: number };

type Severity = 'incapacitating' | 'ongoing' | 'other';

/** Legacy status names stored before spec 013, read as the current ones. */
const LEGACY_STATUS: Record<string, string> = { unconcious: 'unconscious' };

/** Status of an effect with the legacy spelling `unconcious` read as `unconscious`. */
export const normalizeEffectStatus = (status: string): string => LEGACY_STATUS[status] ?? status;

const SEVERITY: Record<string, Severity> = {
  dead: 'incapacitating',
  dying: 'incapacitating',
  unconscious: 'incapacitating',
  'permanent-unconscious': 'incapacitating',
  stunned: 'incapacitating',
  surprised: 'incapacitating',
  prone: 'incapacitating',
  grappled: 'incapacitating',
  staggered: 'incapacitating',
  bleeding: 'ongoing',
  fatigue: 'ongoing',
};

// Icons in rmu-mfe-assets/images/icons, by status (some files do not follow the status name).
const ICONS: Record<string, string> = {
  bleeding: 'bleeding',
  breakage: 'breakage',
  dead: 'dead',
  dying: 'dying',
  fatigue: 'fatigue',
  grappled: 'grappled',
  penalty: 'penalty',
  prone: 'prone',
  staggered: 'staggered',
  stunned: 'stunned',
  unconscious: 'unconscios',
  'permanent-unconscious': 'unconscios',
  dmg: 'dmg',
};

const COLORS: Record<Severity, 'error' | 'warning' | 'default'> = {
  incapacitating: 'error',
  ongoing: 'warning',
  other: 'default',
};

// Effects whose color does not follow their severity group: bleeding sorts with the ongoing effects but is
// shown red, like the hit points it takes.
const STATUS_COLORS: Record<string, 'error' | 'warning' | 'default'> = { bleeding: 'error' };

/** Image of a status (images/icons), as a chip avatar; undefined when there is none. */
export const effectIcon = (status: string) => {
  const file = ICONS[normalizeEffectStatus(status)];
  return file ? (
    <Avatar variant="rounded" alt="" src={resolveAssetUrl(`images/icons/${file}.png`)} sx={{ borderRadius: '4px' }} />
  ) : undefined;
};

/**
 * Chip color of a status, the same everywhere it is shown: incapacitating red, ongoing amber (bleeding red), the
 * rest neutral.
 */
export const effectColor = (status: string): 'error' | 'warning' | 'default' => {
  const normalized = normalizeEffectStatus(status);
  return STATUS_COLORS[normalized] ?? COLORS[severityOf(normalized)];
};

const icon = effectIcon;

/**
 * Effects of an actor as solid chips, most severe first: incapacitating (red), ongoing (amber, bleeding red), the
 * rest, and one chip with the total penalty (its sources in the tooltip). Penalties of 0 are not shown.
 * `variant="compact"` shows them as `StatusBadge`s (icon, abbreviation and value; full text on hover or tap) for
 * dense places.
 */
const EffectList: FC<{
  effects: ActorEffect[];
  penalties?: ActorPenalty[];
  size?: 'small' | 'medium';
  variant?: 'full' | 'compact';
}> = ({ effects, penalties = [], size = 'small', variant = 'full' }) => {
  const { t } = useTranslation();
  const ordered = effects
    .map((effect) => ({ ...effect, status: normalizeEffectStatus(effect.status) }))
    .filter((effect) => effect.status !== 'penalty' || effect.value)
    .sort((a, b) => rank(a.status) - rank(b.status));
  const penaltyTotal = penalties.reduce((sum, penalty) => sum + penalty.value, 0);

  const label = (effect: ActorEffect) => {
    const parts = [t(effect.status)];
    if (effect.value) parts.push(`${effect.value}`);
    if (effect.rounds) parts.push(t('rounds-short', { count: effect.rounds }));
    return parts.join(' ');
  };

  const penaltySources = penalties
    .filter((penalty) => penalty.value)
    .map((penalty) => `${t(`penalty-${penalty.source}`, { defaultValue: t(penalty.source) })} ${penalty.value}`)
    .join(' · ');

  if (ordered.length === 0 && !penaltyTotal) return null;

  if (variant === 'compact') {
    return (
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
        {ordered.map((effect, index) => (
          <StatusBadge
            key={`${effect.status}-${index}`}
            status={effect.status}
            label={t(effect.status)}
            value={
              [effect.value || '', effect.rounds ? t('rounds-abbr', { count: effect.rounds }) : '']
                .filter(Boolean)
                .join(' ') || undefined
            }
            detail={t(`effect-${effect.status}-help`, { defaultValue: '' }) || undefined}
            color={effectColor(effect.status)}
            avatar={icon(effect.status)}
            size={size}
          />
        ))}
        {penaltyTotal !== 0 && (
          <StatusBadge
            status="penalty"
            label={t('penalty')}
            value={penaltyTotal}
            detail={penaltySources}
            avatar={icon('penalty')}
            size={size}
          />
        )}
      </Stack>
    );
  }

  return (
    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
      {ordered.map((effect, index) => {
        const help = t(`effect-${effect.status}-help`, { defaultValue: '' });
        const chip = (
          <Chip size={size} avatar={icon(effect.status)} label={label(effect)} color={effectColor(effect.status)} />
        );
        return help ? (
          <Tooltip key={`${effect.status}-${index}`} title={help}>
            {chip}
          </Tooltip>
        ) : (
          <React.Fragment key={`${effect.status}-${index}`}>{chip}</React.Fragment>
        );
      })}
      {penaltyTotal !== 0 && (
        <Tooltip title={penaltySources}>
          <Chip size={size} avatar={icon('penalty')} label={`${t('penalty')} ${penaltyTotal}`} />
        </Tooltip>
      )}
    </Stack>
  );
};

const severityOf = (status: string): Severity => SEVERITY[status] ?? 'other';
const rank = (status: string) => ['incapacitating', 'ongoing', 'other'].indexOf(severityOf(status));

export default EffectList;
