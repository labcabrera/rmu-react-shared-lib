import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

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
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onDelete} color="error">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
