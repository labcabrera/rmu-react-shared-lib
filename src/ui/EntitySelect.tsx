import React from 'react';
import { useTranslation } from 'react-i18next';
import { Autocomplete, TextField } from '@mui/material';

export interface EntitySelectProps<T> {
  options: T[];
  /** Selected id, or null. */
  value: string | null | undefined;
  onChange: (id: string | null, entity: T | null) => void;
  label: string;
  getId?: (option: T) => string;
  getLabel?: (option: T) => string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  name?: string;
  /** Shown while nothing is selected, for example "All" in a filter. */
  placeholder?: string;
}

/**
 * Searchable select over a list of entities (realms, skills, professions…). Domain selects such as
 * SelectRealm are presets of this one, so all of them look and behave the same.
 */
export default function EntitySelect<T>({
  options,
  value,
  onChange,
  label,
  getId = (option) => (option as { id: string }).id,
  getLabel = (option) => (option as { name: string }).name,
  required = false,
  disabled = false,
  loading = false,
  name,
  placeholder,
}: EntitySelectProps<T>) {
  const { t } = useTranslation();
  const selected = options.find((option) => getId(option) === value) ?? null;
  return (
    <Autocomplete
      options={options}
      value={selected}
      getOptionLabel={getLabel}
      isOptionEqualToValue={(option, current) => getId(option) === getId(current)}
      onChange={(_, option) => onChange(option ? getId(option) : null, option)}
      loading={loading}
      loadingText={t('loading')}
      noOptionsText={t('no-results')}
      disabled={disabled}
      fullWidth
      renderInput={(params) => (
        <TextField
          {...params}
          name={name}
          label={label}
          placeholder={placeholder}
          required={required}
          error={required && !value}
          fullWidth
        />
      )}
    />
  );
}
