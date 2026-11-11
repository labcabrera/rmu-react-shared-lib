import React, { FC, KeyboardEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialpadIcon from '@mui/icons-material/Dialpad';
import { Dialog, InputAdornment, Popover, TextField, useMediaQuery, useTheme } from '@mui/material';
import NumberPad from './NumberPad';

export type NumberPadPresentation = 'auto' | 'dialog' | 'popover';

export type NumberPadFieldProps = {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  integer?: boolean;
  allowNegatives?: boolean;
  min?: number;
  max?: number;
  /** Quick adjustments of the keypad, by default −5, −1, +1 and +5. */
  steps?: number[];
  label?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  helperText?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  /** Shows a sign on positive values (+3). */
  signed?: boolean;
  /** Text after the value (lbs, ft…). */
  suffix?: string;
  /**
   * `auto` opens the keypad in a dialog on touch screens and narrow windows (tablets, phones) and in a popover on a
   * desktop with a mouse.
   */
  presentation?: NumberPadPresentation;
};

/**
 * A number field for the table (spec 066, decision 18): it shows the value and opens a calculator-like keypad
 * instead of the system keyboard, so a tablet never brings the on-screen keyboard over the combat. Same props as
 * NumericInput.
 */
const NumberPadField: FC<NumberPadFieldProps> = ({
  value,
  onChange,
  integer = false,
  allowNegatives = true,
  min,
  max,
  steps,
  label,
  name,
  placeholder,
  disabled = false,
  readOnly = false,
  error,
  helperText,
  size,
  fullWidth = true,
  signed = false,
  suffix,
  presentation = 'auto',
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const large = useMediaQuery(theme.breakpoints.up('md'));
  const coarse = useMediaQuery('(pointer: coarse)');
  const anchorRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const editable = !disabled && !readOnly;
  const asPopover = presentation === 'popover' || (presentation === 'auto' && large && !coarse);

  const shown =
    value === null || value === undefined || Number.isNaN(value)
      ? ''
      : `${signed && value > 0 ? '+' : ''}${value}${suffix ? ` ${suffix}` : ''}`;

  const openPad = () => {
    if (editable) setOpen(true);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ' || /^[\d-]$/.test(event.key)) {
      event.preventDefault();
      openPad();
    }
  };

  const pad = (
    <NumberPad
      value={value}
      integer={integer}
      allowNegatives={allowNegatives}
      min={min}
      max={max}
      steps={steps}
      label={label}
      onConfirm={(next) => {
        setOpen(false);
        if (next !== value) onChange(next);
      }}
      onCancel={() => setOpen(false)}
    />
  );

  return (
    <>
      <TextField
        ref={anchorRef}
        label={label}
        name={name}
        value={shown}
        placeholder={placeholder}
        size={size}
        fullWidth={fullWidth}
        disabled={disabled}
        error={error}
        helperText={helperText}
        onClick={openPad}
        onKeyDown={onKeyDown}
        slotProps={{
          input: {
            readOnly: true,
            endAdornment: editable ? (
              <InputAdornment position="end">
                <DialpadIcon fontSize="small" color="action" />
              </InputAdornment>
            ) : undefined,
          },
          htmlInput: {
            inputMode: 'none',
            'aria-haspopup': 'dialog',
            style: { cursor: editable ? 'pointer' : undefined, textAlign: 'right' },
          },
        }}
      />
      {asPopover ? (
        <Popover
          open={open}
          anchorEl={anchorRef.current}
          onClose={() => setOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          {open && pad}
        </Popover>
      ) : (
        <Dialog open={open} onClose={() => setOpen(false)} aria-label={label ?? t('number-pad')} maxWidth="xs">
          {open && pad}
        </Dialog>
      )}
    </>
  );
};

export default NumberPadField;
