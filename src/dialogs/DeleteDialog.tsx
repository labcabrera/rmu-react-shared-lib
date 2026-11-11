import React from 'react';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from '../ui/ConfirmDialog';

type DeleteDialogProps = {
  message: string;
  open: boolean;
  onDelete: () => void;
  onClose: () => void;
};

/** Delete confirmation: a destructive ConfirmDialog (spec 066, decision 6). */
const DeleteDialog: React.FC<DeleteDialogProps> = ({ message, open, onDelete, onClose }) => {
  const { t } = useTranslation();
  return (
    <ConfirmDialog
      open={open}
      title={t('delete-confirmation')}
      message={message}
      confirmLabel={t('delete')}
      destructive
      onConfirm={onDelete}
      onClose={onClose}
    />
  );
};

export default DeleteDialog;
