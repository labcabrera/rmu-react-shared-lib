import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { t } from 'i18next';

type DeleteDialogProps = {
  message: string;
  open: boolean;
  onDelete: () => void;
  onClose: () => void;
};

const DeleteDialog: React.FC<DeleteDialogProps> = ({ message, open, onDelete, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle id="alert-dialog-title">{'Delete confirmation'}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('Cancel')}</Button>
        <Button onClick={onDelete} color="error">
          {t('Delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
