import React, { FC, KeyboardEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CasinoIcon from '@mui/icons-material/Casino';
import ClearIcon from '@mui/icons-material/Clear';
import { Drawer, IconButton, InputAdornment, Popover, TextField, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { RollSpec, RollValue } from './roll.types';
import { formatRoll, fromNumber, randomDie, rollDice } from './roll-logic';
import RollPad from './RollPad';

/** How the keypad opens: `auto` is a popover from `md` and a bottom sheet below. */
export type RollPresentation = 'auto' | 'popover' | 'sheet';

export interface RollFieldProps {
  spec: RollSpec;
  /** The roll, or a stored total without its dice. */
  value: RollValue | number | null | undefined;
  /** Called only when a roll is confirmed in the keypad or rolled with the dice button. */
  onChange: (value: RollValue) => void;
  /** Shows a button that empties the roll, for optional rolls (the API rolls them when missing). */
  onClear?: () => void;
  /** Text of the empty field, like "rolled by the server". */
  placeholder?: string;
  /** Label of the field (default `t('roll')`). */
  label?: string;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  helperText?: string;
  /** Small field for table cells. */
  compact?: boolean;
  presentation?: RollPresentation;
  /** Die used by the dice buttons, for tests. */
  random?: (sides: number) => number;
}

/**
 * A roll field (spec 025): it shows the roll, `TOTAL (X+Y+Z)` when it has several dice, and opens a calculator-like
 * keypad to enter it (a popover on large screens, a bottom sheet on tablets and phones). The dice button rolls it
 * straight away.
 */
const RollField: FC<RollFieldProps> = ({
  spec,
  value,
  onChange,
  onClear,
  placeholder,
  label,
  disabled = false,
  readOnly = false,
  error,
  helperText,
  compact = false,
  presentation = 'auto',
  random = randomDie,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const large = useMediaQuery(theme.breakpoints.up('md'));
  const anchorRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  // The last roll made here, to show its dice while the caller keeps only the total.
  const [last, setLast] = useState<RollValue>();

  const known: RollValue | undefined =
    value === null || value === undefined
      ? undefined
      : typeof value === 'number'
        ? last?.total === value
          ? last
          : undefined
        : value;
  const text =
    value === null || value === undefined ? '' : known ? formatRoll(known, spec) : String(value as number);
  const initial = known ?? (typeof value === 'number' ? fromNumber(spec, value) : undefined);
  const editable = !disabled && !readOnly;
  const fieldLabel = label ?? t('roll');

  const commit = (roll: RollValue) => {
    setLast(roll);
    setOpen(false);
    onChange(roll);
  };

  const openPad = () => {
    if (editable) setOpen(true);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ' || /^\d$/.test(event.key)) {
      event.preventDefault();
      openPad();
    }
  };

  const pad = (
    <RollPad spec={spec} initial={initial} onConfirm={commit} onCancel={() => setOpen(false)} random={random} />
  );
  const asPopover = presentation === 'popover' || (presentation === 'auto' && large);

  return (
    <>
      <TextField
        ref={anchorRef}
        label={fieldLabel}
        value={text}
        placeholder={placeholder}
        size={compact ? 'small' : 'medium'}
        fullWidth
        variant="outlined"
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
                {onClear && text && (
                  <IconButton
                    aria-label={t('clear')}
                    edge="end"
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      setLast(undefined);
                      onClear();
                    }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )}
                <Tooltip title={t('roll-dice')}>
                  <IconButton
                    aria-label={t('roll-dice')}
                    edge="end"
                    size={compact ? 'small' : 'medium'}
                    onClick={(event) => {
                      event.stopPropagation();
                      commit(rollDice(spec, random));
                    }}
                  >
                    <CasinoIcon fontSize={compact ? 'small' : 'medium'} />
                  </IconButton>
                </Tooltip>
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
        <Drawer
          anchor="bottom"
          open={open}
          onClose={() => setOpen(false)}
          slotProps={{ paper: { sx: { borderTopLeftRadius: 12, borderTopRightRadius: 12 } } }}
        >
          {open && pad}
        </Drawer>
      )}
    </>
  );
};

export default RollField;
