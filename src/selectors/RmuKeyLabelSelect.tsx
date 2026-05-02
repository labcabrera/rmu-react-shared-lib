import React, { ChangeEvent, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuItem, TextField } from '@mui/material';
import { KeyLabel, KeyValue } from '../api/common.dto';

export default function RmuKeyLabelSelect({
  value,
  label,
  options,
  i18n = true,
  onChange,
}: {
  value: string;
  label: string;
  options: KeyLabel[];
  i18n?: boolean;
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
      onChange={handleChange}
      fullWidth
    >
      {options.map((option, index) => (
        <MenuItem key={index} value={option.key}>
          {i18n ? t(option.label) : option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
