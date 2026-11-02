import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import ClearIcon from '@mui/icons-material/Clear';
import { TextField, InputAdornment, IconButton } from '@mui/material';

export default function ClearableTextField({
  value,
  label,
  name,
  placeholder,
  onChange,
  startIcon,
  size,
  autoFocus,
}: {
  value?: string;
  label: string;
  name?: string;
  placeholder?: string;
  onChange: (e: string | undefined) => void;
  /** Icon at the start of the field (the search icon of SearchField). */
  startIcon?: ReactNode;
  size?: 'small' | 'medium';
  autoFocus?: boolean;
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
      size={size}
      autoFocus={autoFocus}
      placeholder={placeholder}
      slotProps={{
        input: {
          startAdornment: startIcon ? <InputAdornment position="start">{startIcon}</InputAdornment> : undefined,
          endAdornment: value ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClear} edge="end" color="primary" aria-label={t('clear')}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : undefined,
        },
      }}
    />
  );
}
