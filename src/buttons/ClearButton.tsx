import React, { FC, MouseEvent } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
import RmuIconButton from './RmuIconButton';

const ClearButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}> = ({ onClick, disabled = false }) => (
  <RmuIconButton onClick={onClick} aria-label="delete" disabled={disabled} Icon={ClearIcon} tooltip="Clear" />
);

export default ClearButton;
