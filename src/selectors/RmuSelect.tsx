import React, { ChangeEvent, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuItem, TextField } from '@mui/material';

export default function RmuSelect({
  value,
  label,
  options,
  emptyOption,
  onChange,
}: {
  value: string;
  label: string;
  options: string[];
  emptyOption?: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <TextField
      select
      label={label}
      value={value === undefined || value === null ? '' : value}
      size="small"
      onChange={handleChange}
      fullWidth
    >
      {emptyOption && <MenuItem value="">{t(emptyOption)}</MenuItem>}
      {options.map((option, index) => (
        <MenuItem key={index} value={option}>
          {t(option)}
        </MenuItem>
      ))}
    </TextField>
  );
}
