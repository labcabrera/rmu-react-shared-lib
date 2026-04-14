import React, { FC, MouseEvent } from 'react';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Tooltip } from '@mui/material';
import RmuIconButton from './RmuIconButton';

const DownloadButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  tooltip?: string;
}> = ({ onClick, disabled = false }) => (
  <RmuIconButton
    onClick={onClick}
    tooltip="Download"
    aria-label="download"
    disabled={disabled}
    Icon={FileDownloadIcon}
  />
);

export default DownloadButton;
