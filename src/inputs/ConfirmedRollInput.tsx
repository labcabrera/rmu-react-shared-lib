import React, { FC, KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import CasinoIcon from '@mui/icons-material/Casino';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import NumericInput from './NumericInput';
import { randomD100 } from './OpenEndedRollInput';

/**
 * A roll field that reports the roll only when it is confirmed (blur, Enter or the dice button) and differs
 * from the stored one, so the API is not called on every keystroke or on a blur without changes.
 *
 * @deprecated Use RollField with a RollSpec preset (workspace spec 025).
 */
const ConfirmedRollInput: FC<{
  label: string;
  /** The stored roll. */
  value: number | null | undefined;
  onConfirm: (roll: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  error?: boolean;
  /** Shows a dice button that confirms a random roll between `min` and `max` (default true). */
  allowRandom?: boolean;
}> = ({ label, value, onConfirm, min = 1, max = 100, disabled, error, allowRandom = true }) => {
  const { t } = useTranslation();

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
      e.preventDefault();
      e.target.blur();
    }
  };

  const onChange = (roll: number | null) => {
    if (roll === null || roll === (value ?? null)) return;
    onConfirm(roll);
  };

  const randomRoll = () =>
    min === 1 && max === 100 ? randomD100() : Math.floor(Math.random() * (max - min + 1)) + min;

  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
      <Box onKeyDown={onKeyDown} sx={{ flex: 1 }}>
        <NumericInput
          label={label}
          value={value ?? null}
          onChange={onChange}
          min={min}
          max={max}
          integer
          allowNegatives={false}
          disabled={disabled}
          error={error}
        />
      </Box>
      {allowRandom && !disabled && (
        <Tooltip title={t('roll-dice')}>
          <IconButton aria-label={t('roll-dice')} onClick={() => onChange(randomRoll())}>
            <CasinoIcon />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
};

export default ConfirmedRollInput;
