/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CasinoIcon from '@mui/icons-material/Casino';
import { Grid, IconButton, Tooltip, Typography } from '@mui/material';
import ClearButton from '../buttons/ClearButton';
import NumericInput from './NumericInput';

const TOP_LIMIT = 96;
const BOTTOM_LIMIT = 5;

/** Dice behind a complete open-ended roll. */
export type OpenEndedRollDetails = {
  /** First die (1-100), the unmodified roll: unusual events (66) and fumbles are read from it. */
  unmodified: number;
  /** Every die rolled, in order. */
  rolls: number[];
};

export type OpenEndedRollProps = {
  gridColumns?: number;
  inputGridSize?: number;
  /**
   * Called with the final result once the roll is complete (each field is committed on blur or Enter), and with `null`
   * when it is cleared. It is not called again for the same result. `details` has the dice of the result (the first
   * one is the unmodified roll); it is absent when the result is cleared.
   */
  onChange: (result: number | null, details?: OpenEndedRollDetails) => void;
  /**
   * A stored result to show, e.g. a roll saved earlier. A result from 6 to 95 fills the first field; any other one is
   * shown as a caption, since the dice behind it are unknown. When it changes to something other than the last
   * result, the fields are reset to it.
   */
  value?: number | null;
  /** Label of the first field. Defaults to the `open-ended-roll` translation. */
  label?: string;
  disabled?: boolean;
  /** Shows a dice button that fills the next missing roll with a random d100 (default true). */
  allowRandom?: boolean;
};

/** A random d100 roll, 1 to 100. */
export const randomD100 = () => Math.floor(Math.random() * 100) + 1;

const rollsFromValue = (value: number | null | undefined): Array<number | null> =>
  value !== null && value !== undefined && value > BOTTOM_LIMIT && value < TOP_LIMIT ? [value] : [null];

/** Final result of the rolls, or `undefined` while a roll is still missing (open-ended rolls ask for another die). */
export const computeOpenEndedResult = (rolls: Array<number | null>): number | undefined => {
  if (rolls.length === 0) return undefined;
  const first = rolls[0];
  if (first === null) return undefined;
  if (first > BOTTOM_LIMIT && first < TOP_LIMIT) return first;
  if (first >= TOP_LIMIT) {
    if (rolls.some((r) => r === null)) return undefined;
    const last = rolls[rolls.length - 1] as number;
    if (last >= TOP_LIMIT) return undefined; // still exploding
    return rolls.reduce<number>((s, r) => s + (r || 0), 0);
  }
  if (rolls.some((r, idx) => idx > 0 && r === null)) return undefined;
  const last = rolls[rolls.length - 1] as number;
  if (rolls.length > 1 && last >= TOP_LIMIT) return undefined; // still exploding negatively
  const rest = rolls.slice(1).reduce<number>((s, r) => s + (r || 0), 0);
  return first - rest;
};

/**
 * @deprecated Use RollField with a RollSpec preset (workspace spec 025).
 */
const OpenEndedRollInput: FC<OpenEndedRollProps> = ({
  gridColumns = 12,
  inputGridSize = 2,
  onChange,
  value,
  label,
  disabled = false,
  allowRandom = true,
}) => {
  const { t } = useTranslation();
  const [rolls, setRolls] = useState<Array<number | null>>(() => rollsFromValue(value));
  // Last result reported to (or received from) the parent, so the same result is not sent twice.
  const lastResult = useRef<number | null>(value ?? null);

  const handleValueChange = (index: number, roll: number | null) => {
    setRolls((prev) => {
      const copy = prev.slice(0, index);
      copy[index] = roll;
      if (index !== prev.length - 1 || roll === null) return copy;
      const first = copy[0];
      if (copy.length === 1) {
        if (roll >= TOP_LIMIT || roll <= BOTTOM_LIMIT) copy.push(null);
        return copy;
      }
      if (first !== null && roll >= TOP_LIMIT) copy.push(null);
      return copy;
    });
  };

  const onClear = () => {
    setRolls([null]);
    if (lastResult.current !== null) {
      lastResult.current = null;
      onChange(null);
    }
  };

  // Enter commits the field like a blur does.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
      e.preventDefault();
      e.target.blur();
    }
  };

  useEffect(() => {
    const result = computeOpenEndedResult(rolls);
    if (result === undefined || result === lastResult.current) return;
    lastResult.current = result;
    onChange(result, { unmodified: rolls[0] as number, rolls: rolls as number[] });
  }, [rolls]);

  useEffect(() => {
    const next = value ?? null;
    if (next === lastResult.current) return;
    lastResult.current = next;
    setRolls(rollsFromValue(next));
  }, [value]);

  const fieldLabel = (idx: number) =>
    idx === 0
      ? label || t('open-ended-roll', 'Open-ended roll')
      : `${t('open-ended-roll', 'Open-ended roll')} ${idx + 1}`;

  const showStored = value !== null && value !== undefined && rolls[0] === null;

  return (
    <Grid container spacing={1} columns={gridColumns} sx={{ alignItems: 'center' }} onKeyDown={onKeyDown}>
      {rolls.map((r, idx) => (
        <Grid size={inputGridSize} key={idx}>
          <NumericInput
            label={fieldLabel(idx)}
            value={r}
            onChange={(e) => handleValueChange(idx, e)}
            min={1}
            max={100}
            integer
            disabled={disabled}
          />
        </Grid>
      ))}
      {!disabled && allowRandom && rolls.some((r) => r === null) && (
        <Tooltip title={t('roll-dice')}>
          <IconButton
            aria-label={t('roll-dice')}
            onClick={() =>
              handleValueChange(
                rolls.findIndex((r) => r === null),
                randomD100()
              )
            }
          >
            <CasinoIcon />
          </IconButton>
        </Tooltip>
      )}
      {!disabled && (rolls[0] !== null || showStored) && <ClearButton onClick={onClear} />}
      {showStored && (
        <Grid size={gridColumns}>
          <Typography variant="caption" color="text.secondary">
            {t('open-ended-roll-stored', 'Stored roll')}: {value}
          </Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default OpenEndedRollInput;
