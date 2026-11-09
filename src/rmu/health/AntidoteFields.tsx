import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, MenuItem, Stack, TextField } from '@mui/material';
import { ANY_POISON, AntidoteSource, GiveAntidoteDto, POISON_CATEGORIES } from '../../api/poison.dto';
import NumberPadField from '../../inputs/NumberPadField';
import NumericInput from '../../inputs/NumericInput';

const SOURCES: AntidoteSource[] = ['item', 'magic', 'external'];

export type AntidoteFieldsValue = {
  source: AntidoteSource;
  name: string;
  categories: string[];
  level: number | null;
};

export const EMPTY_ANTIDOTE_FIELDS: AntidoteFieldsValue = { source: 'item', name: '', categories: [], level: null };

/** The request of the form, undefined while it is incomplete. `itemDto` is what each MFE sends for the item source. */
export const antidoteDto = (
  value: AntidoteFieldsValue,
  itemDto: GiveAntidoteDto | undefined
): GiveAntidoteDto | undefined => {
  const { source, name, categories, level } = value;
  if (source === 'item') return itemDto;
  if (!name.trim()) return undefined;
  if (source === 'magic') return { source, name, level: level ?? undefined };
  if (categories.length === 0 || level === null) return undefined;
  return { source, name, categories, level };
};

/**
 * The body of the give antidote dialogs: the source, and the fields of a spell or a hand-given antidote. Each MFE owns
 * the picker of the item source (`itemField`), the dialog and the API call.
 */
const AntidoteFields: FC<{
  value: AntidoteFieldsValue;
  onChange: (patch: Partial<AntidoteFieldsValue>) => void;
  itemField: ReactNode;
  /** Keypad for the level, for the touch screens of the combat views. */
  numberPad?: boolean;
}> = ({ value, onChange, itemField, numberPad = false }) => {
  const { t } = useTranslation();
  const { source, name, categories, level } = value;
  const LevelInput = numberPad ? NumberPadField : NumericInput;

  return (
    <Stack spacing={2} sx={{ pt: 1 }}>
      <TextField
        select
        size="small"
        label={t('antidote-source')}
        value={source}
        onChange={(e) => onChange({ source: e.target.value as AntidoteSource })}
      >
        {SOURCES.map((each) => (
          <MenuItem key={each} value={each}>
            {t(`antidote-source-${each}`)}
          </MenuItem>
        ))}
      </TextField>
      {source === 'item' && itemField}
      {source !== 'item' && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              size="small"
              fullWidth
              label={t('name')}
              value={name}
              onChange={(e) => onChange({ name: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <LevelInput
              integer
              min={0}
              allowNegatives={false}
              label={t('level')}
              value={level}
              onChange={(next) => onChange({ level: next })}
            />
          </Grid>
          {source === 'external' && (
            <Grid size={12}>
              <TextField
                select
                size="small"
                fullWidth
                label={t('poison-categories')}
                value={categories}
                slotProps={{ select: { multiple: true } }}
                onChange={(e) => onChange({ categories: e.target.value as unknown as string[] })}
              >
                {[...POISON_CATEGORIES, ANY_POISON].map((category) => (
                  <MenuItem key={category} value={category}>
                    {t(`poison-category-${category}`)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}
        </Grid>
      )}
    </Stack>
  );
};

export default AntidoteFields;
