import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuItem, Stack, TextField, Typography } from '@mui/material';
import NumberPadField from '../../inputs/NumberPadField';
import NumericInput from '../../inputs/NumericInput';

/**
 * The body of the use a herb dialogs: the herb, with its doses, and the hits rolled when it heals. Each MFE owns which
 * herbs are listed, the dialog and the API call.
 */
const HerbUseFields: FC<{
  herbs: { id: string; name: string; amount: number }[];
  itemId: string;
  onItemChange: (itemId: string) => void;
  /** The herb is fixed by whoever opened the dialog. */
  itemDisabled?: boolean;
  /** Shown instead of the select when there are no herbs. */
  empty: ReactNode;
  /** More about the selected herb, above the roll. */
  info?: ReactNode;
  /** Range of the hits healed by the selected herb; without it there is no roll. */
  heal?: { min: number; max: number } | null;
  roll: number | null;
  onRollChange: (roll: number | null) => void;
  /** Keypad for the roll, for the touch screens of the combat views. */
  numberPad?: boolean;
}> = ({ herbs, itemId, onItemChange, itemDisabled, empty, info, heal, roll, onRollChange, numberPad = false }) => {
  const { t } = useTranslation();
  const RollInput = numberPad ? NumberPadField : NumericInput;

  return (
    <Stack spacing={2} sx={{ pt: 1 }}>
      {herbs.length === 0 ? (
        empty
      ) : (
        <TextField
          select
          size="small"
          label={t('item-category-herb')}
          value={itemId}
          disabled={itemDisabled}
          onChange={(e) => onItemChange(e.target.value)}
        >
          {herbs.map((each) => (
            <MenuItem key={each.id} value={each.id}>
              {`${t(each.name, each.name)} (${each.amount})`}
            </MenuItem>
          ))}
        </TextField>
      )}
      {info}
      {heal && (
        <>
          <RollInput
            integer
            min={0}
            allowNegatives={false}
            label={t('herb-use-roll')}
            value={roll}
            onChange={onRollChange}
          />
          <Typography variant="caption" color="text.secondary">
            {t('herb-use-roll-help', { min: heal.min, max: heal.max })}
          </Typography>
        </>
      )}
    </Stack>
  );
};

export default HerbUseFields;
