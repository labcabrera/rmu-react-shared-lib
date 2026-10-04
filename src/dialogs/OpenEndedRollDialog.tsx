import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Stack, Typography } from '@mui/material';
import OpenEndedRollInput from '../inputs/OpenEndedRollInput';
import Section from '../layouts/Section';
import RmuDialog from './RmuDialog';

const TOP_LIMIT = 96;
const BOTTOM_LIMIT = 5;

type RandomRollResult = {
  value: number;
  rolls: number[];
};

const generateRandomRoll = (): RandomRollResult => {
  const first = Math.floor(Math.random() * 100) + 1;
  if (first >= TOP_LIMIT) {
    let total = first;
    let next: number;
    const rolls = [first];
    do {
      next = Math.floor(Math.random() * 100) + 1;
      rolls.push(next);
      total += next;
    } while (next >= TOP_LIMIT);
    return { value: total, rolls };
  }
  if (first <= BOTTOM_LIMIT) {
    let extra = 0;
    let next: number;
    const rolls = [first];
    do {
      next = Math.floor(Math.random() * 100) + 1;
      rolls.push(next);
      extra += next;
    } while (next >= TOP_LIMIT);
    return { value: first - extra, rolls };
  }
  return { value: first, rolls: [first] };
};

export type OpenEndedRollDialogProps = {
  open: boolean;
  title?: string;
  subtitle?: string;
  onClose: () => void;
  onConfirm: (value: number) => void;
};

const OpenEndedRollDialog: FC<OpenEndedRollDialogProps> = ({
  open,
  title = 'Open-Ended Roll',
  subtitle,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const [value, setValue] = useState<number | null>(null);
  const [randomRolls, setRandomRolls] = useState<number[] | null>(null);
  const [inputKey, setInputKey] = useState(0);

  useEffect(() => {
    if (open) {
      setValue(null);
      setRandomRolls(null);
      setInputKey((k) => k + 1);
    }
  }, [open]);

  const handleRandom = () => {
    const result = generateRandomRoll();
    setValue(result.value);
    setRandomRolls(result.rolls);
    setInputKey((k) => k + 1);
  };

  const handleInputChange = (result: number | null) => {
    setValue(result);
    setRandomRolls(null);
  };

  const handleConfirm = () => {
    if (value !== null) onConfirm(value);
  };

  return (
    <RmuDialog
      title={title}
      subtitle={subtitle}
      open={open}
      onClose={onClose}
      maxWidth="md"
      onConfirm={handleConfirm}
      onConfirmDisabled={value === null}
      buttons={<Button onClick={handleRandom}>Random</Button>}
    >
      <Stack direction="column" spacing={2}>
        <Section title={t('roll')} elevation={-1}>
          <OpenEndedRollInput key={inputKey} gridColumns={1} inputGridSize={1} onChange={handleInputChange} />
        </Section>
        {value !== null && (
          <Section title={t('result')} elevation={-1}>
            <Typography variant="caption" color="text.secondary" component="div">
              Result
            </Typography>
            {randomRolls && (
              <Typography variant="body2" color="text.secondary" component="div">
                [{randomRolls.join(', ')}]
              </Typography>
            )}
            <Typography variant="h5" component="div">
              {value}
            </Typography>
          </Section>
        )}
      </Stack>
    </RmuDialog>
  );
};

export default OpenEndedRollDialog;
