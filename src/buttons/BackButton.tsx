import React, { FC, MouseEvent } from 'react';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import RmuIconButton from './RmuIconButton';

const BackButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  tooltip?: string;
}> = ({ onClick, disabled = false, tooltip = 'back' }) => (
  <RmuIconButton
    onClick={onClick}
    ariaLabel="back"
    disabled={disabled}
    Icon={KeyboardDoubleArrowLeftIcon}
    tooltip={tooltip}
  />
);

export default BackButton;
