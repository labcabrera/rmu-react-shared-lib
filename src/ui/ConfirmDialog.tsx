import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Typography } from '@mui/material';
import RmuDialog from '../dialogs/RmuDialog';

/** Yes/no confirmation built on RmuDialog. `destructive` paints the confirm button as an error. */
const ConfirmDialog: FC<{
  open: boolean;
  title?: string;
  message: ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}> = ({ open, title, message, confirmLabel, destructive = false, onConfirm, onClose }) => {
  const { t } = useTranslation();
  return (
    <RmuDialog
      open={open}
      title={title ?? t('confirm')}
      maxWidth="xs"
      fullScreen={false}
      buttons={
        <>
          <Button onClick={onClose}>{t('cancel')}</Button>
          <Button onClick={onConfirm} color={destructive ? 'error' : 'primary'} variant="contained">
            {confirmLabel ?? t('confirm')}
          </Button>
        </>
      }
    >
      {typeof message === 'string' ? <Typography>{message}</Typography> : message}
    </RmuDialog>
  );
};

export default ConfirmDialog;
