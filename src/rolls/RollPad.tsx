import React, { FC, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BackspaceIcon from '@mui/icons-material/Backspace';
import CasinoIcon from '@mui/icons-material/Casino';
import { Box, Button, Chip, Stack } from '@mui/material';
import PadLayout, { PAD_KEY_SX } from '../inputs/PadLayout';
import {
  DEFAULT_OPEN_ENDED,
  dieDigits,
  formatRoll,
  randomDie,
  readDie,
  resolveChain,
  rollDice,
  toRollValue,
} from './roll-logic';
import { OpenEndedThresholds, RollSpec, RollValue } from './roll.types';

const DIGITS = ['7', '8', '9', '4', '5', '6', '1', '2', '3'];
const ZERO = '0';

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
  /** Thresholds of an open-ended roll (spec 076); 96 and 5 by default. */
  openEnded?: OpenEndedThresholds;
  /** What is rolled, above the dice (the field label). */
  label?: string;
}> = ({ spec, initial, onConfirm, onCancel, random = randomDie, openEnded = DEFAULT_OPEN_ENDED, label }) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [rolls, setRolls] = useState<number[]>(initial?.rolls ?? []);
  const [text, setText] = useState('');

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const chain = resolveChain(spec, rolls, openEnded);
  const digits = dieDigits(spec.sides);
  const candidate = withTyped(spec, rolls, text);
  const candidateValue = candidate ? toRollValue(spec, candidate, openEnded) : undefined;

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
    setRolls(rollDice(spec, random, openEnded).rolls);
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
    ? t('roll-pad-total', { total: formatRoll(toRollValue(spec, rolls, openEnded)!, spec, openEnded) })
    : needsMore
      ? t(chain.nextSign > 0 ? 'roll-pad-next-die-adds' : 'roll-pad-next-die-subtracts')
      : t('roll-pad-enter-die');
  // Spec 085, 3.3: Accept as in NumberPad; it says "Next die" when the typed die only adds to an open-ended chain.
  const acceptLabel = candidate && !candidateValue && text ? t('roll-pad-next-die') : undefined;

  return (
    <PadLayout
      padRef={ref}
      onKeyDown={onKeyDown}
      testId="roll-pad"
      ariaLabel={label ?? t('roll-pad')}
      label={label}
      display={
        <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap', minHeight: 40, alignItems: 'center' }}>
          {rolls.map((die, index) => (
            <Chip key={index} label={die} color={index === 0 ? 'primary' : 'default'} sx={{ fontWeight: 600 }} />
          ))}
          {(text || !chain.complete) && <Chip label={text || '_'} variant="outlined" data-testid="roll-pad-typed" />}
        </Stack>
      }
      displayNote={status}
      extras={
        <Button variant="outlined" startIcon={<CasinoIcon />} onClick={randomize} sx={{ minHeight: 44 }}>
          {t('roll-pad-random')}
        </Button>
      }
      keys={
        <>
          {DIGITS.map((digit) => (
            <Button key={digit} variant="outlined" color="inherit" sx={PAD_KEY_SX} onClick={() => typeDigit(digit)}>
              {digit}
            </Button>
          ))}
          <Box />
          <Button variant="outlined" color="inherit" sx={PAD_KEY_SX} onClick={() => typeDigit(ZERO)}>
            {ZERO}
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            sx={PAD_KEY_SX}
            aria-label={t('roll-pad-delete-die')}
            onClick={deleteDie}
          >
            <BackspaceIcon />
          </Button>
        </>
      }
      onClear={clear}
      onCancel={onCancel}
      onAccept={confirm}
      acceptDisabled={!candidate || (!text && !chain.complete)}
      acceptLabel={acceptLabel}
    />
  );
};

export default RollPad;
