import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Stack, Typography } from '@mui/material';
import OpenEndedRollInput, { OpenEndedRollDetails } from '../inputs/OpenEndedRollInput';
import Section from '../layouts/Section';
import { OPEN_D100 } from '../rolls/presets';
import { rollDice } from '../rolls/roll-logic';
import RmuDialog from './RmuDialog';

type RandomRollResult = {
  value: number;
  rolls: number[];
};

const generateRandomRoll = (): RandomRollResult => {
  const { total, rolls } = rollDice(OPEN_D100);
  return { value: total, rolls };
};

export type OpenEndedRollDialogProps = {
  open: boolean;
  title?: string;
  subtitle?: string;
  onClose: () => void;
  /** The result and, when known, its dice (the first one is the unmodified roll). */
  onConfirm: (value: number, details?: OpenEndedRollDetails) => void;
};

/**
 * @deprecated Use RollField with a RollSpec preset (workspace spec 025).
 */
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
  const [details, setDetails] = useState<OpenEndedRollDetails | undefined>(undefined);
  const [inputKey, setInputKey] = useState(0);

  useEffect(() => {
    if (open) {
      setValue(null);
      setRandomRolls(null);
      setDetails(undefined);
      setInputKey((k) => k + 1);
    }
  }, [open]);

  const handleRandom = () => {
    const result = generateRandomRoll();
    setValue(result.value);
    setRandomRolls(result.rolls);
    setDetails({ unmodified: result.rolls[0], rolls: result.rolls });
    setInputKey((k) => k + 1);
  };

  const handleInputChange = (result: number | null, rollDetails?: OpenEndedRollDetails) => {
    setValue(result);
    setRandomRolls(null);
    setDetails(rollDetails);
  };

  const handleConfirm = () => {
    if (value !== null) onConfirm(value, details);
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
      buttons={<Button onClick={handleRandom}>{t('random')}</Button>}
    >
      <Stack direction="column" spacing={2}>
        <Section title={t('roll')} elevation={-1}>
          <OpenEndedRollInput key={inputKey} gridColumns={1} inputGridSize={1} onChange={handleInputChange} />
        </Section>
        {value !== null && (
          <Section title={t('result')} elevation={-1}>
            <Typography variant="caption" color="text.secondary" component="div">
              {t('result')}
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
