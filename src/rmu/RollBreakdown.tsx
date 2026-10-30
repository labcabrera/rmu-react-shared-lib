import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, ButtonBase, Collapse, Divider, Stack, Typography } from '@mui/material';
import RuleHint, { RuleParams } from './RuleHint';

/**
 * Group of a modifier in the breakdown: the attacker's side, the target's, the situation or the critical; outside
 * combat (spec 052) the skill, the penalties, the casting conditions and the target's.
 */
export type RollModifierGroup =
  | 'skill'
  | 'offense'
  | 'casting'
  | 'defense'
  | 'target'
  | 'situation'
  | 'penalty'
  | 'critical'
  | 'resolution';

/**
 * One entry of a roll breakdown, as the combat API returns it: with the rule reference of its plugin and the inputs of
 * its value since spec 051.
 */
export type RollModifier = {
  key: string;
  value: number;
  group?: RollModifierGroup;
  source?: string;
  rule?: string;
  params?: RuleParams;
};

/** A rule that did not apply to the roll, and why (spec 051). */
export type SkippedRule = {
  source: string;
  group?: RollModifierGroup;
  reason: string;
  rule?: string;
  params?: RuleParams;
};

const GROUP_ORDER: (RollModifierGroup | 'other')[] = [
  'skill',
  'offense',
  'casting',
  'defense',
  'target',
  'situation',
  'penalty',
  'critical',
  'resolution',
  'other',
];

/**
 * Which roll a breakdown is (spec 052): its texts are `<context>-rule-<key>` and `<context>-skip-<reason>`, since
 * a key means different things in different rolls (`armor` of a maneuver or of a spell).
 */
export type RollContext =
  | 'combat'
  | 'maneuver'
  | 'spell-cast'
  | 'spell-rr'
  | 'medical'
  | 'recovery'
  | 'poison-rr'
  | 'fear-rr'
  | 'physical-rr'
  | 'endurance'
  | 'breakage';

const signed = (value: number) => (value > 0 ? `+${value}` : `${value}`);

/**
 * Translated label of a modifier key; unknown keys are shown readable ("restricted-quarters" → "Restricted quarters").
 * `modifier-label-<key>` wins over the plain key, for keys whose usual text means something else (`light`).
 */
export const useModifierLabel = () => {
  const { t } = useTranslation();
  return (key: string) => {
    const fallback = key.replace(/[-_]/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
    return t(`modifier-label-${key}`, { defaultValue: t(key, { defaultValue: fallback }) });
  };
};

/** Translated values of the text params of an explanation (`flank` → its label), numbers as they are. */
const useExplanationValues = () => {
  const { t } = useTranslation();
  return (params: RuleParams = {}) =>
    Object.fromEntries(
      Object.entries(params).map(([name, value]) => [
        name,
        typeof value === 'string' ? t(value, { defaultValue: value }) : value,
      ])
    );
};

const Row: FC<{ label: string; value: number; strong?: boolean }> = ({ label, value, strong }) => (
  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 2, py: 0.25 }}>
    <Typography
      variant="body2"
      color={strong ? 'text.primary' : 'text.secondary'}
      sx={{ fontWeight: strong ? 700 : 400 }}
    >
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
 * A modifier row that explains itself (spec 051): `<context>-rule-<key>` (or `<context>-rule-<source>`) says why, with
 * the inputs and the rule reference the API sends. A modifier with nothing to explain is a plain row.
 */
const ModifierRow: FC<{ modifier: RollModifier; context: RollContext }> = ({ modifier, context }) => {
  const { t, i18n } = useTranslation();
  const label = useModifierLabel();
  const values = useExplanationValues();
  // The key's own text, else its source's: a skill rolled by its id explains itself as `maneuver-rule-skill`
  const descriptionKey = [modifier.key, modifier.source]
    .filter(Boolean)
    .map((name) => `${context}-rule-${name}`)
    .find((key) => i18n?.exists?.(key));
  const description = descriptionKey ? t(descriptionKey, values(modifier.params)) : undefined;
  const row = <Row label={label(modifier.key)} value={modifier.value} />;
  if (!description && !modifier.rule && !modifier.params) return row;
  return (
    <RuleHint
      title={`${label(modifier.key)} ${signed(modifier.value)}`}
      description={description}
      params={modifier.params}
      reference={modifier.rule}
    >
      {row}
    </RuleHint>
  );
};

/** The rules that did not apply, folded: each one with why (`combat-skip-<reason>`) and its reference. */
const SkippedRules: FC<{ rules: SkippedRule[]; context: RollContext }> = ({ rules, context }) => {
  const { t } = useTranslation();
  const label = useModifierLabel();
  const values = useExplanationValues();
  const [open, setOpen] = useState(false);
  return (
    <Box>
      <ButtonBase
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        sx={{ width: '100%', minHeight: 40, justifyContent: 'space-between', borderRadius: 1 }}
      >
        <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {t('rules-not-applied', { count: rules.length })}
        </Typography>
        <ExpandMoreIcon
          fontSize="small"
          color="action"
          sx={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 150ms' }}
        />
      </ButtonBase>
      <Collapse in={open} unmountOnExit>
        <Stack spacing={0.75} sx={{ pt: 0.5 }}>
          {rules.map((rule, index) => (
            <Box key={`${rule.source}-${rule.reason}-${index}`}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {label(rule.source)}
                {rule.rule && (
                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    {rule.rule}
                  </Typography>
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t(`${context}-skip-${rule.reason}`, { ...values(rule.params), defaultValue: rule.reason })}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Collapse>
    </Box>
  );
};

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
  /** Rules that did not apply, folded under the modifiers (spec 051). */
  skipped?: SkippedRule[];
  /** Which roll it is, for the texts of its explanations (spec 052). */
  context?: RollContext;
}> = ({ modifiers, roll, total, totalLabel, skipped, context = 'combat' }) => {
  const { t } = useTranslation();
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
            <ModifierRow key={`${modifier.key}-${index}`} modifier={modifier} context={context} />
          ))}
        </Box>
      ))}
      <Divider />
      {roll !== undefined && roll !== null && <Row label={t('roll')} value={roll} />}
      <Row label={totalLabel ?? t('total')} value={computedTotal} strong />
      {skipped && skipped.length > 0 && <SkippedRules rules={skipped} context={context} />}
    </Stack>
  );
};

export default RollBreakdown;
