import React, { FC, MouseEvent } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import RmuIconButton from './RmuIconButton';

const ClearButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}> = ({ onClick, disabled = false }) => (
  <RmuIconButton onClick={onClick} ariaLabel="clear" disabled={disabled} Icon={ClearIcon} tooltip="clear" />
);

export default ClearButton;
