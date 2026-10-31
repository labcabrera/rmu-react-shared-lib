import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, Stack, Tooltip, Typography } from '@mui/material';
import {
  CREATURE_SIZES,
  creatureSizeClass,
  NPC_ADDITIONAL_CRITICALS,
  NPC_RESISTANCES,
  NpcAttack,
  NpcBiome,
  npcShieldDb,
  NpcStatBlock,
} from '../../api/npc.dto';
import Panel from '../../layouts/Panel';
import { fonts } from '../../theme/tokens';
import { bonusColor, formatBonus } from '../character/StatPill';

type Translate = (key: string, options?: Record<string, unknown>) => string;

/** Label of a biome code: `npc-biome-F`, and `Fw` as the biome with water. */
export const biomeLabel = (code: NpcBiome | string, t: Translate): string =>
  code.endsWith('w') ? t('npc-biome-water', { biome: t(`npc-biome-${code.slice(0, -1)}`) }) : t(`npc-biome-${code}`);

/** Label of an additional critical (`krush`): the name of its critical type, or the value as is. */
export const additionalCriticalLabel = (critical: string, t: Translate): string => {
  const code = NPC_ADDITIONAL_CRITICALS[critical.toLowerCase()];
  return code ? t(`critical-type-${code}`, { defaultValue: critical }) : critical;
};

/** Size and size class: `Big (6)`. */
export const creatureSizeLabel = (size: string, t: Translate): string => {
  const sizeClass = creatureSizeClass(size);
  return sizeClass ? `${t(`size-${size}`)} (${sizeClass})` : t(`size-${size}`);
};

const Value: FC<{ label: string; value: ReactNode; hint?: string; signed?: boolean }> = ({
  label,
  value,
  hint,
  signed,
}) => {
  const numeric = typeof value === 'number';
  const box = (
    <Box
      sx={(theme) => ({
        px: 1,
        py: 0.75,
        minWidth: 0,
        textAlign: 'center',
        borderRadius: `${theme.radius.sm}px`,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.light',
      })}
    >
      <Typography
        variant="h6"
        component="div"
        sx={{ lineHeight: 1.2, color: signed && numeric ? bonusColor(value) : 'text.primary' }}
        noWrap
      >
        {signed && numeric ? formatBonus(value) : value}
      </Typography>
      <Typography variant="caption" color="text.secondary" component="div" noWrap>
        {label}
      </Typography>
    </Box>
  );
  return hint ? <Tooltip title={hint}>{box}</Tooltip> : box;
};

const valueGridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' },
  gap: 1,
} as const;

const Row: FC<{ label: ReactNode; value: ReactNode; secondary?: ReactNode }> = ({ label, value, secondary }) => (
  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 2, py: 0.75 }}>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="body2" component="div">
        {label}
      </Typography>
      {secondary && (
        <Typography variant="caption" color="text.secondary" component="div">
          {secondary}
        </Typography>
      )}
    </Box>
    <Typography variant="body2" component="div" sx={{ fontWeight: 700, textAlign: 'right', flexShrink: 0 }}>
      {value}
    </Typography>
  </Stack>
);

const Rows: FC<{ children: ReactNode }> = ({ children }) => (
  <Stack divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>{children}</Stack>
);

const Empty: FC<{ text: string }> = ({ text }) => (
  <Typography variant="body2" color="text.secondary">
    {text}
  </Typography>
);

const sizeOfClass = (sizeClass: number): string => CREATURE_SIZES[sizeClass - 1] ?? 'medium';

const AttackRow: FC<{ attack: NpcAttack; t: Translate }> = ({ attack, t }) => {
  const extras: { key: string; label: string; color?: 'warning' | 'info' | 'error' }[] = [];
  if (attack.additionalCritical)
    extras.push({
      key: 'critical',
      label: t('npc-attack-additional-critical', { type: additionalCriticalLabel(attack.additionalCritical, t) }),
      color: 'warning',
    });
  if (attack.sequence)
    extras.push({ key: 'sequence', label: t(`npc-attack-sequence-${attack.sequence}`), color: 'info' });
  if (attack.cooperation)
    extras.push({ key: 'coop', label: t('npc-attack-cooperation', { count: attack.cooperation }) });
  if (attack.kata) extras.push({ key: 'kata', label: t('npc-attack-kata', { count: attack.kata }) });
  if (attack.alternativeTo !== null && attack.alternativeTo !== undefined)
    extras.push({ key: 'alt', label: t('npc-attack-alternative', { index: attack.alternativeTo + 1 }) });
  if (attack.hand === 'left') extras.push({ key: 'hand', label: t('npc-attack-left-hand') });
  if (attack.poison) {
    const poison = [
      attack.poison.type ? t(`poison-category-${attack.poison.type}`, { defaultValue: attack.poison.type }) : null,
      attack.poison.rrModifier !== null ? formatBonus(attack.poison.rrModifier) : null,
    ]
      .filter(Boolean)
      .join(' ');
    extras.push({
      key: 'poison',
      label: poison ? `${t('npc-attack-poison')}: ${poison}` : t('npc-attack-poison'),
      color: 'error',
    });
  }
  return (
    <Box data-testid="creature-attack" sx={{ py: 1 }}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ minWidth: 56, textAlign: 'center' }}>
          <Typography variant="h6" component="div" sx={{ lineHeight: 1.1, color: bonusColor(attack.ob) }}>
            {formatBonus(attack.ob)}
          </Typography>
          <Typography variant="caption" color="text.secondary" component="div">
            {t('npc-ob')}
          </Typography>
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }} component="div">
            {t(attack.attackTable)}
          </Typography>
          <Typography variant="caption" color="text.secondary" component="div">
            {t('npc-attack-size', { size: creatureSizeLabel(sizeOfClass(attack.size), t) })}
          </Typography>
        </Box>
        {attack.notation && (
          <Typography
            variant="caption"
            component="code"
            sx={{ fontFamily: fonts.mono, color: 'text.secondary', textAlign: 'right', wordBreak: 'break-word' }}
          >
            {attack.notation}
          </Typography>
        )}
      </Stack>
      {extras.length > 0 && (
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5, mt: 0.75, pl: { xs: 0, sm: 8.5 } }}>
          {extras.map((extra) => (
            <Chip
              key={extra.key}
              size="small"
              variant="outlined"
              color={extra.color ?? 'default'}
              label={extra.label}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};

/**
 * The combat stat block of a creature (workspace spec 054): level and spread, outlook, archetype, size and the
 * critical codes as chips; hits, AT/DB, initiative and endurance; movement modes, attacks with their notation, RRs,
 * skills and where it is found. Panels in one column on phones and two from `md`.
 */
const CreatureStatBlock: FC<{
  npc: NpcStatBlock;
  /** Panels left out (for example `skills` when the page shows them elsewhere). */
  hide?: ('movement' | 'attacks' | 'resistances' | 'skills' | 'encounter')[];
}> = ({ npc, hide = [] }) => {
  const { t } = useTranslation();
  const codes = npc.criticalCodes;
  const criticalChips = [
    codes?.reduceSeverity && {
      key: 'reduce',
      label: t('npc-crit-reduce-severity'),
      hint: t('npc-crit-reduce-severity-hint'),
    },
    codes?.noKnockdown && { key: 'knock', label: t('npc-crit-no-knockdown'), hint: t('npc-crit-no-knockdown-hint') },
    codes?.stunImmune && { key: 'stun', label: t('npc-crit-stun-immune'), hint: t('npc-crit-stun-immune-hint') },
    codes?.bleedImmune && { key: 'bleed', label: t('npc-crit-bleed-immune'), hint: t('npc-crit-bleed-immune-hint') },
    ...(codes?.immunities ?? []).map((immunity) => ({
      key: immunity,
      label: t(`npc-immunity-${immunity}`),
      hint: t('npc-immunity-hint'),
    })),
  ].filter((chip): chip is { key: string; label: string; hint: string } => !!chip);
  // Built outside the JSX: the i18n lint reads string arguments there as visible text.
  const show = {
    attacks: !hide.includes('attacks'),
    movement: !hide.includes('movement'),
    resistances: !hide.includes('resistances'),
    skills: !hide.includes('skills'),
    encounter: !hide.includes('encounter'),
  };
  const encounter = npc.encounter;

  return (
    <Stack spacing={2} data-testid="creature-stat-block">
      <Panel title={t('npc-combat-stats')}>
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
          <Chip
            color="primary"
            label={
              npc.levelSpread
                ? t('npc-level-with-spread', { level: npc.level, spread: npc.levelSpread })
                : t('npc-level-value', { level: npc.level })
            }
            title={npc.levelSpread ? t(`level-spread-${npc.levelSpread}`) : undefined}
          />
          {npc.outlookType && <Chip variant="outlined" label={t(`outlook-${npc.outlookType}`)} />}
          {npc.archetype && <Chip variant="outlined" label={t(`npc-archetype-${npc.archetype}`)} />}
          <Chip variant="outlined" label={creatureSizeLabel(npc.size, t)} />
          {npc.criticalSize && npc.criticalSize !== npc.size && (
            <Chip
              variant="outlined"
              label={t('npc-critical-size-value', { size: creatureSizeLabel(npc.criticalSize, t) })}
            />
          )}
          {criticalChips.map((chip) => (
            <Tooltip key={chip.key} title={chip.hint}>
              <Chip color="secondary" variant="outlined" label={chip.label} />
            </Tooltip>
          ))}
        </Stack>
        <Box sx={valueGridSx}>
          <Value
            label={t('npc-hits')}
            value={npc.deathHits ? `${npc.hp} (${npc.deathHits})` : npc.hp}
            hint={npc.deathHits ? t('npc-death-hits-hint', { value: npc.deathHits }) : undefined}
          />
          <Value label={t('npc-at-db')} value={`${npc.at} / ${npc.db}`} />
          <Value label={t('initiative')} value={npc.initiative} signed />
          {npc.endurance !== null && npc.endurance !== undefined && (
            <Value label={t('endurance')} value={npc.endurance} />
          )}
          {npc.running && (
            <Value
              label={t('npc-running')}
              value={`${npc.running.ranks} / ${formatBonus(npc.running.bonus)}`}
              hint={t('npc-running-hint')}
            />
          )}
          {npc.shield && (
            <Value
              label={t('npc-shield')}
              value={`${t(`npc-shield-type-${npc.shield.type}`)} ${formatBonus(npcShieldDb(npc.shield))}`}
              hint={t('npc-shield-hint')}
            />
          )}
          {npc.shield && (npc.shield.ranks !== null || npc.shield.bonus !== null) && (
            <Value
              label={t('npc-shield-skill')}
              value={`${npc.shield.ranks ?? '–'} / ${formatBonus(npc.shield.bonus ?? 0)}`}
              hint={t('npc-shield-skill-hint')}
            />
          )}
          {npc.powerPoints !== null && npc.powerPoints !== undefined && (
            <Value label={t('npc-pp')} value={npc.powerPoints} hint={t('power-points')} />
          )}
        </Box>
      </Panel>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        {show.attacks && (
          <Box sx={{ gridColumn: { md: '1 / -1' } }}>
            <Panel title={t('attacks')}>
              {npc.attacks?.length ? (
                <Stack divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
                  {npc.attacks.map((attack, index) => (
                    <AttackRow key={index} attack={attack} t={t} />
                  ))}
                </Stack>
              ) : (
                <Empty text={t('npc-no-attacks')} />
              )}
            </Panel>
          </Box>
        )}
        {show.movement && (
          <Panel title={t('movement')}>
            {npc.movement?.length ? (
              <Rows>
                {npc.movement.map((movement, index) => (
                  <Row
                    key={index}
                    label={
                      movement.tier
                        ? `${t(`npc-movement-${movement.mode}`)} ${movement.tier}`
                        : t(`npc-movement-${movement.mode}`)
                    }
                    secondary={[t(movement.maxPace), movement.note].filter(Boolean).join(' · ')}
                    value={t('npc-movement-rate', { value: movement.baseRate })}
                  />
                ))}
              </Rows>
            ) : (
              <Empty text={t('npc-no-movement')} />
            )}
          </Panel>
        )}
        {show.resistances && (
          <Panel title={t('resistances')}>
            {npc.resistances ? (
              <Rows>
                {NPC_RESISTANCES.map((resistance) => (
                  <Row
                    key={resistance}
                    label={t(resistance)}
                    value={
                      <Box component="span" sx={{ color: bonusColor(npc.resistances![resistance]) }}>
                        {formatBonus(npc.resistances![resistance])}
                      </Box>
                    }
                  />
                ))}
              </Rows>
            ) : (
              <Empty text={t('npc-no-resistances')} />
            )}
          </Panel>
        )}
        {show.skills && (
          <Panel title={t('skills')}>
            {npc.skills?.length ? (
              <Rows>
                {npc.skills.map((skill, index) => (
                  <Row
                    key={index}
                    label={
                      skill.specialization
                        ? `${t(skill.skillId)} (${t(skill.specialization, { defaultValue: skill.specialization })})`
                        : t(skill.skillId)
                    }
                    secondary={[
                      skill.ranks !== null && skill.ranks !== undefined
                        ? t('npc-skill-ranks', { count: skill.ranks })
                        : null,
                      skill.note,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                    value={formatBonus(skill.bonus)}
                  />
                ))}
              </Rows>
            ) : (
              <Empty text={t('npc-no-skills')} />
            )}
          </Panel>
        )}
        {show.encounter && encounter && (
          <Panel title={t('npc-encounter')}>
            <Rows>
              <Row
                label={t('npc-encounter-group')}
                value={encounter.dice ? `${encounter.group} (${encounter.dice})` : encounter.group}
              />
              {encounter.frequency !== null && encounter.frequency !== undefined && (
                <Row label={t('npc-frequency')} value={formatBonus(encounter.frequency)} />
              )}
            </Rows>
            {encounter.biomes?.length > 0 && (
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                {encounter.biomes.map((biome) => (
                  <Tooltip key={biome} title={biome}>
                    <Chip size="small" variant="outlined" label={biomeLabel(biome, t)} />
                  </Tooltip>
                ))}
              </Stack>
            )}
          </Panel>
        )}
      </Box>
    </Stack>
  );
};

export default CreatureStatBlock;
