import React, { FC, MouseEvent } from 'react';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import RmuIconButton from './RmuIconButton';

const EditButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}> = ({ onClick, disabled = false }) => (
  <RmuIconButton onClick={onClick} ariaLabel="edit" disabled={disabled} Icon={EditDocumentIcon} tooltip="edit" />
);

export default EditButton;
