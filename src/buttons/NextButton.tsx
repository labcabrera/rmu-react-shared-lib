import React, { FC, MouseEvent } from 'react';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import RmuIconButton from './RmuIconButton';

const NextButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  tooltip?: string;
}> = ({ onClick, disabled = false, tooltip = 'next' }) => (
  <RmuIconButton
    onClick={onClick}
    ariaLabel="next"
    disabled={disabled}
    Icon={KeyboardDoubleArrowRightIcon}
    tooltip={tooltip}
  />
);

export default NextButton;
