import React from 'react';
import { useTranslation } from 'react-i18next';
import ClearIcon from '@mui/icons-material/Clear';
import { TextField, InputAdornment, IconButton } from '@mui/material';

export default function ClearableTextField({
  value,
  label,
  name,
  placeholder,
  onChange,
}: {
  value?: string;
  label: string;
  name?: string;
  placeholder?: string;
  onChange: (e: string | undefined) => void;
}) {
  const { t } = useTranslation();
  const handleClear = () => {
    onChange('');
  };

  return (
    <TextField
      label={label}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      fullWidth
      placeholder={placeholder}
      slotProps={{
        input: value
          ? {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClear} edge="end" color="primary" aria-label={t('clear')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }
          : undefined,
      }}
    />
  );
}
