import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

type DeleteDialogProps = {
  message: string;
  open: boolean;
  onDelete: () => void;
  onClose: () => void;
};

const DeleteDialog: React.FC<DeleteDialogProps> = ({ message, open, onDelete, onClose }) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle id="alert-dialog-title">{t('delete-confirmation')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button onClick={onDelete} color="error">
          {t('delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
