import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CasinoIcon from '@mui/icons-material/Casino';
import { IconButton, Stack, Tooltip, Typography } from '@mui/material';
import NumericInput from './NumericInput';
import { randomD100 } from './OpenEndedRollInput';

/** A generated roll: the total and every die rolled (the first one is the unmodified roll). */
export type GeneratedRoll = { total: number; rolls: number[] };

/**
 * Rolls a d100. Open-ended: 96-100 rolls again and adds (again while 96-100), 01-05 rolls again and subtracts
 * (and keeps subtracting while the new die is 96-100). `random` is the die, for tests.
 */
export const rollD100 = (openEnded = false, random: () => number = randomD100): GeneratedRoll => {
  const first = random();
  const rolls = [first];
  if (!openEnded || (first > 5 && first < 96)) return { total: first, rolls };
  const sign = first >= 96 ? 1 : -1;
  let total = first;
  let next: number;
  do {
    next = random();
    rolls.push(next);
    total += sign * next;
  } while (next >= 96);
  return { total, rolls };
};

/**
 * A roll typed by the user, with a button that generates it (decision 9 of spec 013). Without `openEnded` the roll is
 * a plain d100 (1-100); with it, the total can go over 100 or below 1.
 */
const RollInput: FC<{
  value: number | null | undefined;
  onChange: (value: number | null, roll?: GeneratedRoll) => void;
  /** Label of the field (default `t('roll')`). */
  label?: string;
  openEnded?: boolean;
  disabled?: boolean;
  /** Die used by the button, for tests. */
  random?: () => number;
}> = ({ value, onChange, label, openEnded = false, disabled = false, random }) => {
  const { t } = useTranslation();
  const [generated, setGenerated] = useState<GeneratedRoll | undefined>();

  const generate = () => {
    const roll = rollD100(openEnded, random);
    setGenerated(roll);
    onChange(roll.total, roll);
  };

  const showDice = generated && generated.rolls.length > 1 && generated.total === value;

  return (
    <Stack>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
        <NumericInput
          label={label ?? t('roll')}
          value={value}
          onChange={(next) => {
            setGenerated(undefined);
            onChange(next);
          }}
          integer
          min={openEnded ? undefined : 1}
          max={openEnded ? undefined : 100}
          allowNegatives={openEnded}
          disabled={disabled}
        />
        {!disabled && (
          <Tooltip title={t('roll-dice')}>
            <IconButton aria-label={t('roll-dice')} onClick={generate}>
              <CasinoIcon />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
      {showDice && (
        <Typography variant="caption" color="text.secondary">
          {t('roll-dice-rolls', { rolls: generated.rolls.join(', ') })}
        </Typography>
      )}
    </Stack>
  );
};

export default RollInput;
