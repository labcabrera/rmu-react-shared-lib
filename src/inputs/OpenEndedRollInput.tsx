/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import ClearButton from '../buttons/ClearButton';
import NumericInput from './NumericInput';

const TOP_LIMIT = 96;
const BOTTOM_LIMIT = 5;

export type OpenEndedRollProps = {
  gridColumns?: number;
  inputGridSize?: number;
  onChange: (result: number | null) => void;
};

const OpenEndedRollInput: FC<OpenEndedRollProps> = ({ gridColumns = 12, inputGridSize = 2, onChange }) => {
  const [rolls, setRolls] = useState<Array<number | null>>(() => {
    return [null];
  });

  const finalizeIfDone = (currentRolls: Array<number | null>) => {
    if (currentRolls.length === 0) return;
    const first = currentRolls[0];
    if (first === null) return;
    if (first > BOTTOM_LIMIT && first < TOP_LIMIT) {
      onChange(first);
      return;
    }
    if (first >= TOP_LIMIT) {
      if (currentRolls.some((r) => r === null)) return;
      const last = currentRolls[currentRolls.length - 1] as number;
      if (last >= TOP_LIMIT) return; // still exploding
      const sum = currentRolls.reduce((s, r) => s! + (r || 0), 0);
      onChange(sum);
      return;
    }
    if (first <= BOTTOM_LIMIT) {
      if (currentRolls.some((r, idx) => idx > 0 && r === null)) return;
      const last = currentRolls[currentRolls.length - 1] as number;
      if (last >= TOP_LIMIT) return; // still exploding negatively
      const rest = currentRolls.slice(1).reduce((s, r) => s! + (r || 0), 0)!;
      onChange(first - rest);
      return;
    }
  };

  const handleValueChange = (index: number, roll: number) => {
    setRolls((prev) => {
      const copy = prev ? prev.slice(0, index) : [];
      copy[index] = roll;
      const first = copy[0];
      if (index === (prev ? prev.length - 1 : 0)) {
        if (first === null) {
          if (copy[0] === null) return copy;
        }
        if (copy.length === 1 && roll !== null) {
          if (roll >= TOP_LIMIT || roll <= BOTTOM_LIMIT) {
            copy.push(null);
            return copy;
          }
          return copy;
        }
        if (first !== null && first >= TOP_LIMIT) {
          if (roll === null) return copy;
          if (roll >= TOP_LIMIT) {
            copy.push(null);
            return copy;
          }
          return copy;
        }
        if (first !== null && first <= BOTTOM_LIMIT) {
          if (roll === null) return copy;
          if (roll >= TOP_LIMIT) {
            copy.push(null);
            return copy;
          }
          return copy;
        }
      }
      return copy;
    });
  };

  const onClear = () => {
    setRolls([null]);
    onChange(null);
  };

  useEffect(() => {
    finalizeIfDone(rolls);
  }, [rolls]);

  return (
    <Grid container spacing={1} columns={gridColumns} alignItems="center">
      {rolls.map((r, idx) => (
        <Grid size={inputGridSize} key={idx}>
          <NumericInput
            label={`Open-Ended Roll${idx > 0 ? ` ${idx + 1}` : ''}`}
            value={r}
            onChange={(e) => handleValueChange(idx, e!)}
          />
        </Grid>
      ))}
      {rolls[0] !== null && <ClearButton onClick={onClear} />}
    </Grid>
  );
};

export default OpenEndedRollInput;
