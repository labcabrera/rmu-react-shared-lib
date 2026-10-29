import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { RollModifier, PriceFactorSelection } from '../../api/item-operations.dto';
import NumericInput from '../../inputs/NumericInput';

/** A modifier the user can choose: a maneuver modifier of core, or a market condition (spec 048). */
export type SelectableModifier = {
  key: string;
  type: 'flag' | 'choice' | 'number';
  value?: number;
  options?: { key: string; value: number }[];
  perUnit?: number;
  min?: number;
  max?: number;
};

/** What is chosen, by key: true for a flag, the option key of a choice, the units of a number. */
export type ModifierSelectionValues = Record<string, true | string | number>;

/** Value a chosen modifier adds: the flag value, the value of the option, or units times the value per unit. */
export const selectionValue = (modifier: SelectableModifier, selection: true | string | number | undefined) => {
  if (selection === undefined) return undefined;
  if (modifier.type === 'flag') return selection === true ? (modifier.value ?? 0) : undefined;
  if (modifier.type === 'choice') return modifier.options?.find((option) => option.key === selection)?.value;
  return typeof selection === 'number' && selection > 0 ? selection * (modifier.perUnit ?? 0) : undefined;
};

/** The chosen maneuver modifiers as the roll modifiers of a request. */
export const selectedRollModifiers = (
  modifiers: SelectableModifier[],
  values: ModifierSelectionValues
): RollModifier[] =>
  modifiers.flatMap((modifier) => {
    const value = selectionValue(modifier, values[modifier.key]);
    return value === undefined ? [] : [{ key: modifier.key, value }];
  });

/** The chosen market conditions as the factors of a request: the API resolves their values. */
export const selectedPriceFactors = (
  modifiers: SelectableModifier[],
  values: ModifierSelectionValues
): PriceFactorSelection[] =>
  modifiers.flatMap((modifier): PriceFactorSelection[] => {
    const selection = values[modifier.key];
    if (selectionValue(modifier, selection) === undefined) return [];
    if (modifier.type === 'choice') return [{ key: modifier.key, option: selection as string }];
    if (modifier.type === 'number') return [{ key: modifier.key, units: selection as number }];
    return [{ key: modifier.key }];
  });

const signed = (value: number) => (value > 0 ? `+${value}` : `${value}`);

/**
 * Chips to choose modifiers (spec 048): a flag is a chip that toggles, a choice a group of chips where choosing the
 * selected one again clears it, and a number a numeric field of units. `formatValue` shows the value of each one
 * (signed by default); `label` and `optionLabel` give their texts (`t(key)` and `t('key.option')` by default).
 */
const ModifierSelections: FC<{
  modifiers: SelectableModifier[];
  value: ModifierSelectionValues;
  onChange: (value: ModifierSelectionValues) => void;
  formatValue?: (value: number, modifier: SelectableModifier) => string;
  label?: (key: string) => string;
  optionLabel?: (key: string, option: string) => string;
  disabled?: boolean;
}> = ({ modifiers, value, onChange, formatValue = signed, label, optionLabel, disabled }) => {
  const { t } = useTranslation();
  const labelOf = label ?? ((key: string) => t(key));
  const optionLabelOf = optionLabel ?? ((key: string, option: string) => t(`${key}.${option}`));

  const set = (key: string, selection: true | string | number | undefined) => {
    const next = { ...value };
    if (selection === undefined) delete next[key];
    else next[key] = selection;
    onChange(next);
  };

  const flags = modifiers.filter((modifier) => modifier.type === 'flag');
  const others = modifiers.filter((modifier) => modifier.type !== 'flag');

  return (
    <Stack spacing={1.5}>
      {others.map((modifier) =>
        modifier.type === 'choice' ? (
          <Box key={modifier.key} role="group" aria-label={labelOf(modifier.key)}>
            <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 0.5 }}>
              {labelOf(modifier.key)}
            </Typography>
            <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 0.75 }}>
              {(modifier.options ?? []).map((option) => {
                const selected = value[modifier.key] === option.key;
                return (
                  <Chip
                    key={option.key}
                    label={`${optionLabelOf(modifier.key, option.key)} ${formatValue(option.value, modifier)}`}
                    color={selected ? 'primary' : 'default'}
                    variant={selected ? 'filled' : 'outlined'}
                    aria-pressed={selected}
                    disabled={disabled}
                    onClick={() => set(modifier.key, selected ? undefined : option.key)}
                  />
                );
              })}
            </Stack>
          </Box>
        ) : (
          <Stack key={modifier.key} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: 260, flex: 'none' }}>
              <NumericInput
                label={labelOf(modifier.key)}
                value={typeof value[modifier.key] === 'number' ? (value[modifier.key] as number) : null}
                onChange={(units) => set(modifier.key, units ? units : undefined)}
                integer
                allowNegatives={false}
                min={modifier.min ?? 0}
                max={modifier.max}
                disabled={disabled}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {`× ${formatValue(modifier.perUnit ?? 0, modifier)}`}
            </Typography>
          </Stack>
        )
      )}
      {flags.length > 0 && (
        <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 0.75 }}>
          {flags.map((modifier) => {
            const selected = value[modifier.key] === true;
            return (
              <Chip
                key={modifier.key}
                label={`${labelOf(modifier.key)} ${formatValue(modifier.value ?? 0, modifier)}`}
                color={selected ? 'primary' : 'default'}
                variant={selected ? 'filled' : 'outlined'}
                aria-pressed={selected}
                disabled={disabled}
                onClick={() => set(modifier.key, selected ? undefined : true)}
              />
            );
          })}
        </Stack>
      )}
    </Stack>
  );
};

export default ModifierSelections;
