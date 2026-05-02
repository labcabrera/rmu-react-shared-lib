import React, { ChangeEvent, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuItem, TextField } from '@mui/material';
import { KeyValue } from '../api/common.dto';

export default function RmuKeyValueSelect({
  value,
  label,
  options,
  onChange,
}: {
  value: string;
  label: string;
  options: KeyValue[];
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
          {t(option.key)}
        </MenuItem>
      ))}
    </TextField>
  );
}
