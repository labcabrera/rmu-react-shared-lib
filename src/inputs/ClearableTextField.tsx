import React, { FC } from 'react';
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
      size="small"
      slotProps={{
        input: value
          ? {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClear} edge="end" color="primary">
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
