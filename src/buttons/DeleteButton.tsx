import React, { FC, MouseEvent } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import RmuIconButton from './RmuIconButton';

const DeleteButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  tooltip?: string;
}> = ({ onClick, disabled = false, tooltip = 'delete' }) => (
  <RmuIconButton onClick={onClick} ariaLabel="delete" disabled={disabled} Icon={DeleteIcon} tooltip={tooltip} />
);

export default DeleteButton;
