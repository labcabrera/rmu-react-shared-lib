import React, { FC, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BackspaceIcon from '@mui/icons-material/Backspace';
import CasinoIcon from '@mui/icons-material/Casino';
import CheckIcon from '@mui/icons-material/Check';
import { alpha, Box, Button, Chip, Stack, Typography } from '@mui/material';
import { RollSpec, RollValue } from './roll.types';
import { dieDigits, formatRoll, randomDie, readDie, resolveChain, rollDice, toRollValue } from './roll-logic';

const DIGITS = ['7', '8', '9', '4', '5', '6', '1', '2', '3'];
const ZERO = '0';

const KEY_SX = { minHeight: 56, minWidth: 56, fontSize: '1.4rem', fontWeight: 600 } as const;

/** The die being typed added to the chain, when it is a valid die. */
const withTyped = (spec: RollSpec, rolls: number[], text: string): number[] | undefined => {
  if (!text) return rolls;
  const die = readDie(text, spec.sides);
  return die === undefined ? undefined : [...rolls, die];
};

/**
 * Calculator-like keypad to enter a roll without the system keyboard (spec 025): the dice are typed one by one as read
 * at the table (0 is 10 on a d10, 00 is 100 on a d100) and an open-ended roll asks for the next die while the chain
 * goes on. It also takes the physical keyboard: digits, Backspace, Delete, Enter and Escape.
 */
const RollPad: FC<{
  spec: RollSpec;
  /** The roll to start from. */
  initial?: RollValue;
  onConfirm: (value: RollValue) => void;
  onCancel: () => void;
  /** Die used by the random button, for tests. */
  random?: (sides: number) => number;
}> = ({ spec, initial, onConfirm, onCancel, random = randomDie }) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [rolls, setRolls] = useState<number[]>(initial?.rolls ?? []);
  const [text, setText] = useState('');

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const chain = resolveChain(spec, rolls);
  const digits = dieDigits(spec.sides);
  const candidate = withTyped(spec, rolls, text);
  const candidateValue = candidate ? toRollValue(spec, candidate) : undefined;

  const typeDigit = (digit: string) => {
    // A digit after a complete roll starts a new one.
    const base = chain.complete && !text ? [] : rolls;
    const next = (chain.complete && !text ? '' : text) + digit;
    if (next.length < digits) {
      setRolls(base);
      setText(next);
      return;
    }
    const die = readDie(next, spec.sides);
    if (die === undefined) return;
    setRolls([...base, die]);
    setText('');
  };

  const deleteDie = () => {
    if (text) setText(text.slice(0, -1));
    else setRolls(rolls.slice(0, -1));
  };

  const clear = () => {
    setRolls([]);
    setText('');
  };

  const randomize = () => {
    setRolls(rollDice(spec, random).rolls);
    setText('');
  };

  const confirm = () => {
    if (!candidate) return;
    if (candidateValue) {
      onConfirm(candidateValue);
      return;
    }
    // The typed die goes into the chain, which still needs another one.
    setRolls(candidate);
    setText('');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (/^\d$/.test(event.key)) typeDigit(event.key);
    else if (event.key === 'Backspace') deleteDie();
    else if (event.key === 'Delete') clear();
    else if (event.key === 'Enter') confirm();
    else if (event.key === 'Escape') onCancel();
    else return;
    event.preventDefault();
    event.stopPropagation();
  };

  const needsMore = !chain.complete && rolls.length > 0;
  const status = chain.complete
    ? t('roll-pad-total', { total: formatRoll(toRollValue(spec, rolls)!, spec) })
    : needsMore
      ? t(chain.nextSign > 0 ? 'roll-pad-next-die-adds' : 'roll-pad-next-die-subtracts')
      : t('roll-pad-enter-die');
  const okLabel = candidate && !candidateValue && text ? t('roll-pad-next-die') : t('confirm');

  return (
    <Box
      ref={ref}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      data-testid="roll-pad"
      sx={{ p: 2, width: { xs: '100%', md: 280 }, maxWidth: 360, mx: 'auto', outline: 'none' }}
    >
      <Stack spacing={1.5}>
        <Box
          sx={{
            p: 1,
            minHeight: 72,
            borderRadius: 1,
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
          }}
        >
          <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap', minHeight: 32 }}>
            {rolls.map((die, index) => (
              <Chip key={index} label={die} size="small" color={index === 0 ? 'primary' : 'default'} />
            ))}
            {(text || !chain.complete) && (
              <Chip label={text || '_'} size="small" variant="outlined" data-testid="roll-pad-typed" />
            )}
          </Stack>
          <Typography variant="body2" color="text.secondary" aria-live="polite" sx={{ mt: 0.5 }}>
            {status}
          </Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
          {DIGITS.map((digit) => (
            <Button key={digit} variant="outlined" sx={KEY_SX} onClick={() => typeDigit(digit)}>
              {digit}
            </Button>
          ))}
          <Button variant="outlined" sx={KEY_SX} aria-label={t('roll-pad-delete-die')} onClick={deleteDie}>
            <BackspaceIcon />
          </Button>
          <Button variant="outlined" sx={KEY_SX} onClick={() => typeDigit(ZERO)}>
            {ZERO}
          </Button>
          <Button
            variant="contained"
            sx={KEY_SX}
            aria-label={okLabel}
            disabled={!candidate || (!text && !chain.complete)}
            onClick={confirm}
          >
            {candidateValue || !text ? <CheckIcon /> : <ArrowForwardIcon />}
          </Button>
        </Box>
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
          <Button startIcon={<CasinoIcon />} onClick={randomize}>
            {t('roll-pad-random')}
          </Button>
          <Button onClick={clear}>{t('roll-pad-clear')}</Button>
          <Button onClick={onCancel}>{t('cancel')}</Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default RollPad;
