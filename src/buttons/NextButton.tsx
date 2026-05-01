import React, { FC, MouseEvent } from 'react';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import RmuIconButton from './RmuIconButton';

const EditButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  tooltip?: string;
}> = ({ onClick, disabled = false, tooltip = 'Next' }) => (
  <RmuIconButton
    onClick={onClick}
    aria-label="edit"
    disabled={disabled}
    Icon={KeyboardDoubleArrowRightIcon}
    tooltip={tooltip}
  />
);

export default EditButton;
