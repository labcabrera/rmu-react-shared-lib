import React, { FC } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import { TextField, InputAdornment, IconButton } from '@mui/material';

export type ClearableTextFieldProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  name: string;
};

const ClearableTextField: FC<ClearableTextFieldProps> = ({ value, onChange, label, name }) => {
  const handleClear = () => {
    onChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <TextField
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      fullWidth
      slotProps={{
        input: value
          ? {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" aria-label="clear name" onClick={handleClear} edge="end">
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }
          : undefined,
      }}
    />
  );
};

export default ClearableTextField;
