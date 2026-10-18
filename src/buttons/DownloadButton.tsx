import React, { FC, MouseEvent } from 'react';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RmuIconButton from './RmuIconButton';

const DownloadButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  tooltip?: string;
}> = ({ onClick, disabled = false, tooltip = 'download' }) => (
  <RmuIconButton onClick={onClick} tooltip={tooltip} ariaLabel="download" disabled={disabled} Icon={FileDownloadIcon} />
);

export default DownloadButton;
