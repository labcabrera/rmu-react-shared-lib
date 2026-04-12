import React, { FC, ReactNode, useContext, useState } from 'react';
import { Button, DialogActions, Slide, Stack, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { TransitionProps } from '@mui/material/transitions';
import GenericAvatar from '../avatars/GenericAvatar';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const RmuDialog: FC<{
  title: string;
  subtitle?: string | undefined;
  children?: ReactNode;
  maxWidth?: 'md' | 'xl' | undefined;
  fullScreen?: boolean;
  avatarImg?: string;
  open: boolean;
  onDelete?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  onResolve?: () => void;
  onConfirm?: () => void;
}> = ({
  title,
  subtitle,
  children,
  fullScreen = false,
  maxWidth = 'xl',
  avatarImg,
  open,
  onDelete,
  onCancel,
  onClose,
  onResolve,
  onConfirm,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth={maxWidth}
      fullWidth
      slots={{ transition: Transition }}
    >
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          {avatarImg && <GenericAvatar variant="square" imageUrl={avatarImg} />}
          <Stack direction="column">
            <Typography variant="h6">{title}</Typography>
            {subtitle && <Typography variant="subtitle1">{subtitle}</Typography>}
          </Stack>
        </Stack>
      </DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        {onDelete && (
          <Button onClick={() => onDelete()} color="error">
            Delete
          </Button>
        )}
        {onClose && <Button onClick={() => onClose()}>Close</Button>}
        {onCancel && <Button onClick={() => onCancel()}>Confirm</Button>}
        {onResolve && <Button onClick={() => onResolve()}>Resolve</Button>}
        {onConfirm && <Button onClick={() => onConfirm()}>Confirm</Button>}
      </DialogActions>
    </Dialog>
  );
};

export default RmuDialog;
