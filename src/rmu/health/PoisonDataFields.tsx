import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Autocomplete, FormControlLabel, Grid, MenuItem, Switch, TextField } from '@mui/material';
import {
  ItemPoison,
  POISON_CATEGORIES,
  POISON_FORMS,
  POISON_SEVERITIES,
  PoisonData,
  poisonOfItem,
} from '../../api/poison.dto';
import NumericInput from '../../inputs/NumericInput';

/** A catalog item with a poison block, as the poison picker lists it. */
export type PoisonCatalogItem = { id: string; name: string; features?: { poison?: ItemPoison | null } | null };

const EMPTY_MANUAL: PoisonData = { name: '', category: 'muscle', level: 1 };

/** A poison complete enough to send: a name and a level. */
export const isPoisonDataValid = (poison: PoisonData | undefined): poison is PoisonData =>
  !!poison && poison.name.trim().length > 0 && Number.isFinite(poison.level) && poison.level >= 0;

/**
 * Picks the poison of an exposure (spec 042): one of the catalog, or one the game master describes by hand (name,
 * category, level, form and worst severity). Calls `onChange` with the poison data (see
 * `isPoisonDataValid`), or undefined when no catalog poison is picked.
 */
const PoisonDataFields: FC<{
  catalog: PoisonCatalogItem[];
  value: PoisonData | undefined;
  onChange: (poison: PoisonData | undefined) => void;
  /** Hides the manual switch: only catalog poisons. */
  catalogOnly?: boolean;
}> = ({ catalog, value, onChange, catalogOnly = false }) => {
  const { t } = useTranslation();
  const [manual, setManual] = useState(!!value && !value.itemTypeId && !catalogOnly);
  const selected = catalog.find((item) => item.id === value?.itemTypeId) ?? null;
  const poisons = catalog.filter((item) => item.features?.poison);
  const manualValue = value && !value.itemTypeId ? value : EMPTY_MANUAL;
  const setManualValue = (patch: Partial<PoisonData>) => onChange({ ...manualValue, ...patch });

  return (
    <Grid container spacing={2}>
      {!catalogOnly && (
        <Grid size={12}>
          <FormControlLabel
            control={
              <Switch
                checked={manual}
                onChange={(_, checked) => {
                  setManual(checked);
                  onChange(checked ? { ...EMPTY_MANUAL } : undefined);
                }}
              />
            }
            label={t('poison-manual')}
          />
        </Grid>
      )}
      {!manual && (
        <Grid size={12}>
          <Autocomplete
            size="small"
            options={poisons}
            value={selected}
            getOptionLabel={(item) => t(item.name, item.name)}
            groupBy={(item) => t(`poison-category-${item.features!.poison!.category}`)}
            isOptionEqualToValue={(option, other) => option.id === other.id}
            onChange={(_, item) => onChange(item ? poisonOfItem(item) : undefined)}
            renderInput={(params) => <TextField {...params} label={t('poison')} />}
          />
        </Grid>
      )}
      {manual && (
        <>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              size="small"
              fullWidth
              label={t('name')}
              value={manualValue.name}
              onChange={(e) => setManualValue({ name: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <TextField
              select
              size="small"
              fullWidth
              label={t('poison-category')}
              value={manualValue.category}
              onChange={(e) => setManualValue({ category: e.target.value as PoisonData['category'] })}
            >
              {POISON_CATEGORIES.map((category) => (
                <MenuItem key={category} value={category}>
                  {t(`poison-category-${category}`)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <NumericInput
              integer
              min={0}
              allowNegatives={false}
              label={t('level')}
              value={manualValue.level}
              onChange={(level) => setManualValue({ level: level ?? 0 })}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              select
              size="small"
              fullWidth
              label={t('poison-form')}
              value={manualValue.form ?? ''}
              onChange={(e) => setManualValue({ form: (e.target.value || undefined) as PoisonData['form'] })}
            >
              <MenuItem value="">-</MenuItem>
              {POISON_FORMS.map((form) => (
                <MenuItem key={form} value={form}>
                  {t(`poison-form-${form}`)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              select
              size="small"
              fullWidth
              label={t('poison-max-severity')}
              value={manualValue.maxSeverity ?? ''}
              onChange={(e) => setManualValue({ maxSeverity: (e.target.value || null) as PoisonData['maxSeverity'] })}
            >
              <MenuItem value="">-</MenuItem>
              {POISON_SEVERITIES.map((severity) => (
                <MenuItem key={severity} value={severity}>
                  {t(`poison-severity-${severity}`)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default PoisonDataFields;
