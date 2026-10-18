import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Chip, Stack, Tooltip } from '@mui/material';
import { resolveAssetUrl } from '../config/asset-url';

/** An effect on an actor: a status with an optional value and duration. */
export type ActorEffect = { status: string; value?: number | null; rounds?: number | null; delay?: number | null };
/** A penalty and where it comes from (hit points, effects, armour…). */
export type ActorPenalty = { source: string; value: number };

type Severity = 'incapacitating' | 'ongoing' | 'other';

const SEVERITY: Record<string, Severity> = {
  dead: 'incapacitating',
  dying: 'incapacitating',
  unconcious: 'incapacitating',
  unconscious: 'incapacitating',
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
  unconcious: 'unconscios',
  unconscious: 'unconscios',
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

const icon = (status: string) =>
  ICONS[status] ? <Avatar alt="" src={resolveAssetUrl(`images/icons/${ICONS[status]}.png`)} /> : undefined;

/**
 * Effects of an actor as solid chips, most severe first: incapacitating (red), ongoing (amber, bleeding red), the
 * rest, and one chip with the total penalty (its sources in the tooltip). Penalties of 0 are not shown.
 */
const EffectList: FC<{ effects: ActorEffect[]; penalties?: ActorPenalty[]; size?: 'small' | 'medium' }> = ({
  effects,
  penalties = [],
  size = 'small',
}) => {
  const { t } = useTranslation();
  const ordered = [...effects]
    .filter((effect) => effect.status !== 'penalty' || effect.value)
    .sort((a, b) => rank(a.status) - rank(b.status));
  const penaltyTotal = penalties.reduce((sum, penalty) => sum + penalty.value, 0);

  const label = (effect: ActorEffect) => {
    const parts = [t(effect.status)];
    if (effect.value) parts.push(`${effect.value}`);
    if (effect.rounds) parts.push(t('rounds-short', { count: effect.rounds }));
    return parts.join(' ');
  };

  if (ordered.length === 0 && !penaltyTotal) return null;

  return (
    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
      {ordered.map((effect, index) => {
        const severity = severityOf(effect.status);
        const help = t(`effect-${effect.status}-help`, { defaultValue: '' });
        const chip = (
          <Chip
            size={size}
            avatar={icon(effect.status)}
            label={label(effect)}
            color={STATUS_COLORS[effect.status] ?? COLORS[severity]}
          />
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
        <Tooltip
          title={penalties
            .filter((penalty) => penalty.value)
            .map((penalty) => `${t(`penalty-${penalty.source}`, { defaultValue: t(penalty.source) })} ${penalty.value}`)
            .join(' · ')}
        >
          <Chip size={size} avatar={icon('penalty')} label={`${t('penalty')} ${penaltyTotal}`} />
        </Tooltip>
      )}
    </Stack>
  );
};

const severityOf = (status: string): Severity => SEVERITY[status] ?? 'other';
const rank = (status: string) => ['incapacitating', 'ongoing', 'other'].indexOf(severityOf(status));

export default EffectList;
