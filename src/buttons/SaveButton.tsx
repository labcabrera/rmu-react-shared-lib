import React, { FC, MouseEvent } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import RmuIconButton from './RmuIconButton';

const SaveButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}> = ({ onClick, disabled = false }) => (
  <RmuIconButton onClick={onClick} ariaLabel="save" disabled={disabled} Icon={SaveIcon} tooltip="save" />
);

export default SaveButton;
