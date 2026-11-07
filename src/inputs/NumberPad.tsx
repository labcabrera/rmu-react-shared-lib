import React, { FC, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BackspaceIcon from '@mui/icons-material/Backspace';
import { Box, Button, Typography } from '@mui/material';
import PadLayout, { PAD_KEY_SX } from './PadLayout';

const DIGITS = ['7', '8', '9', '4', '5', '6', '1', '2', '3'];

export type NumberPadProps = {
  /** The value to start from. */
  value: number | null | undefined;
  integer?: boolean;
  allowNegatives?: boolean;
  min?: number;
  max?: number;
  /** Quick adjustments, by default −5, −1, +1 and +5. An empty list hides the row. */
  steps?: number[];
  /** Label above the display (the field label). */
  label?: string;
  onConfirm: (value: number | null) => void;
  onCancel: () => void;
};

/** The text of a number on the display. */
const toText = (value: number | null | undefined): string =>
  value === null || value === undefined || Number.isNaN(value) ? '' : String(value);

/** The number of a display text, `null` when it is empty or incomplete ("-", "."). */
export const parsePadText = (text: string): number | null => {
  if (text === '' || text === '-' || text === '.' || text === '-.') return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
};

/** Whether a value is outside the bounds. */
export const outOfRange = (value: number | null, min?: number, max?: number): boolean =>
  value !== null && ((min !== undefined && value < min) || (max !== undefined && value > max));

/**
 * Calculator-like keypad to enter a number without the system keyboard (spec 066, decision 18): digits, sign and
 * decimal point when allowed, backspace and clear, quick adjustments, and the bounds with an out-of-range value
 * flagged and not accepted. It also takes the physical keyboard: digits, `-`, `.`, `,`, Backspace, Delete, Enter
 * and Escape.
 */
const NumberPad: FC<NumberPadProps> = ({
  value,
  integer = false,
  allowNegatives = true,
  min,
  max,
  steps = [-5, -1, 1, 5],
  label,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [text, setText] = useState(toText(value));
  // The first key replaces the starting value, as a calculator does.
  const [fresh, setFresh] = useState(true);
  const negatives = allowNegatives && (min === undefined || min < 0);
  const current = parsePadText(text);
  const invalid = outOfRange(current, min, max);

  useEffect(() => ref.current?.focus(), []);

  const type = (key: string) => {
    const base = fresh ? '' : text;
    setFresh(false);
    if (key === '.') {
      if (integer || base.includes('.')) return;
      setText(base === '' || base === '-' ? `${base}0.` : `${base}.`);
      return;
    }
    const next = base === '0' ? key : base === '-0' ? `-${key}` : `${base}${key}`;
    if (next.replace(/[-.]/g, '').length > 9) return;
    setText(next);
  };

  const toggleSign = () => {
    setFresh(false);
    setText((previous) => (previous.startsWith('-') ? previous.slice(1) : `-${previous}`));
  };

  const backspace = () => {
    setFresh(false);
    setText((previous) => previous.slice(0, -1));
  };

  const clear = () => {
    setFresh(false);
    setText('');
  };

  const adjust = (step: number) => {
    setFresh(false);
    const next = (current ?? 0) + step;
    const bounded = Math.min(max ?? Infinity, Math.max(negatives ? (min ?? -Infinity) : Math.max(0, min ?? 0), next));
    setText(toText(integer ? Math.round(bounded) : Math.round(bounded * 100) / 100));
  };

  const confirm = () => {
    if (!invalid) onConfirm(current);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const { key } = event;
    if (/^\d$/.test(key)) type(key);
    else if ((key === '.' || key === ',') && !integer) type('.');
    else if (key === '-' && negatives) toggleSign();
    else if (key === 'Backspace') backspace();
    else if (key === 'Delete') clear();
    else if (key === 'Enter') confirm();
    else if (key === 'Escape') onCancel();
    else return;
    event.preventDefault();
    event.stopPropagation();
  };

  const range =
    min !== undefined && max !== undefined
      ? t('number-pad-range', { min, max })
      : min !== undefined
        ? t('number-pad-min', { min })
        : max !== undefined
          ? t('number-pad-max', { max })
          : undefined;

  const key = (
    content: React.ReactNode,
    onClick: () => void,
    extra: { ariaLabel?: string; disabled?: boolean } = {}
  ) => (
    <Button
      variant="outlined"
      color="inherit"
      sx={PAD_KEY_SX}
      onClick={onClick}
      aria-label={extra.ariaLabel}
      disabled={extra.disabled}
    >
      {content}
    </Button>
  );

  return (
    <PadLayout
      padRef={ref}
      onKeyDown={onKeyDown}
      ariaLabel={label ?? t('number-pad')}
      label={label}
      invalid={invalid}
      display={
        <Typography
          variant="h4"
          component="output"
          data-testid="number-pad-display"
          sx={{
            fontWeight: 600,
            minHeight: '1.25em',
            fontVariantNumeric: 'tabular-nums',
            display: 'block',
            textAlign: 'right',
          }}
        >
          {text || ' '}
        </Typography>
      }
      displayNote={range}
      extras={
        steps.length > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${steps.length}, 1fr)`, gap: 1 }}>
            {steps.map((step) => (
              <Button key={step} variant="outlined" onClick={() => adjust(step)} sx={{ minHeight: 44, minWidth: 0 }}>
                {step > 0 ? `+${step}` : `${step}`}
              </Button>
            ))}
          </Box>
        )
      }
      keys={
        <>
          {DIGITS.map((digit) => (
            <React.Fragment key={digit}>{key(digit, () => type(digit))}</React.Fragment>
          ))}
          {key('±', toggleSign, { ariaLabel: t('number-pad-sign'), disabled: !negatives })}
          {key('0', () => type('0'))}
          {integer
            ? key(<BackspaceIcon />, backspace, { ariaLabel: t('number-pad-backspace') })
            : key('.', () => type('.'), { ariaLabel: t('number-pad-decimal') })}
        </>
      }
      actionsStart={
        !integer && (
          <Button variant="outlined" color="inherit" onClick={backspace} aria-label={t('number-pad-backspace')}>
            <BackspaceIcon fontSize="small" />
          </Button>
        )
      }
      onClear={clear}
      onCancel={onCancel}
      onAccept={confirm}
      acceptDisabled={invalid}
    />
  );
};

export default NumberPad;
