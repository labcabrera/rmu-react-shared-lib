import React, { FC, MouseEvent } from 'react';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import RmuIconButton from './RmuIconButton';

const CancelButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}> = ({ onClick, disabled = false }) => (
  <RmuIconButton onClick={onClick} aria-label="cancel" disabled={disabled} Icon={KeyboardDoubleArrowLeftIcon} />
);

export default CancelButton;
