import React, { FC, MouseEvent } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import RmuIconButton from './RmuIconButton';

const DeleteButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}> = ({ onClick, disabled = false }) => (
  <RmuIconButton onClick={onClick} aria-label="delete" disabled={disabled} Icon={DeleteIcon} />
);

export default DeleteButton;
