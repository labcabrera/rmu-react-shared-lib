import React, { FC, ReactNode } from 'react';
import { alpha, Button, DialogActions, Slide, Stack, SxProps, Theme, Typography } from '@mui/material';
import Dialog, { DialogProps } from '@mui/material/Dialog';
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
  maxWidth?: DialogProps['maxWidth'];
  fullScreen?: boolean;
  avatarImg?: string;
  paperSx?: SxProps<Theme>;
  open: boolean;
  buttons?: ReactNode;
  onConfirmDisabled?: boolean;
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
  paperSx,
  open,
  onConfirmDisabled = false,
  buttons,
  onDelete,
  onCancel,
  onClose,
  onResolve,
  onConfirm,
}) => {
  const paperBaseSx: SxProps<Theme> = {
    backgroundColor: (theme) =>
      theme.palette.mode === 'dark' ? '#171b1c' : theme.palette.background.paper,
    backgroundImage: (theme) =>
      theme.palette.mode === 'dark'
        ? `linear-gradient(135deg, #15191a 0%, #1f2526 52%, #171d1f 100%)`
        : undefined,
    border: (theme) => (theme.palette.mode === 'dark' ? `1px solid ${alpha(theme.palette.primary.light, 0.18)}` : undefined),
    boxShadow: (theme) =>
      theme.palette.mode === 'dark' ? `0 24px 80px ${alpha(theme.palette.common.black, 0.62)}` : undefined,
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth={maxWidth}
      fullWidth
      slots={{ transition: Transition }}
      slotProps={{ paper: { sx: (paperSx ? [paperBaseSx, paperSx] : paperBaseSx) as SxProps<Theme> } }}
    >
      <DialogTitle
        sx={{
          px: 3,
          py: 2,
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? '#202728' : theme.palette.grey[100],
          backgroundImage: (theme) =>
            theme.palette.mode === 'dark'
              ? `linear-gradient(90deg, #222b2c 0%, ${alpha(theme.palette.primary.dark, 0.34)} 52%, #161b1c 100%)`
              : undefined,
          borderBottom: (theme) =>
            `1px solid ${theme.palette.mode === 'dark' ? alpha(theme.palette.primary.light, 0.22) : theme.palette.divider}`,
          boxShadow: (theme) =>
            theme.palette.mode === 'dark' ? `inset 0 -1px 0 ${alpha(theme.palette.common.black, 0.38)}` : undefined,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {avatarImg && <GenericAvatar variant="square" imageUrl={avatarImg} />}
          <Stack direction="column">
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="subtitle1" color="secondary" sx={{ fontWeight: 600 }}>
                {subtitle}
              </Typography>
            )}
          </Stack>
        </Stack>
      </DialogTitle>
      <DialogContent
        sx={{
          px: 3,
          py: 2.5,
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? '#202526' : theme.palette.background.paper,
          backgroundImage: (theme) =>
            theme.palette.mode === 'dark'
              ? `linear-gradient(180deg, ${alpha(theme.palette.common.white, 0.018)} 0%, transparent 36%)`
              : undefined,
          color: 'text.primary',
        }}
      >
        {children}
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          py: 1.5,
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? '#1a2021' : theme.palette.background.paper,
          borderTop: (theme) =>
            `1px solid ${theme.palette.mode === 'dark' ? alpha(theme.palette.primary.light, 0.16) : theme.palette.divider}`,
        }}
      >
        {buttons}
        {onDelete && (
          <Button onClick={() => onDelete()} color="error">
            Delete
          </Button>
        )}
        {onClose && <Button onClick={() => onClose()}>Close</Button>}
        {onCancel && <Button onClick={() => onCancel()}>Cancel</Button>}
        {onResolve && <Button onClick={() => onResolve()}>Resolve</Button>}
        {onConfirm && (
          <Button disabled={onConfirmDisabled} onClick={() => onConfirm()}>
            Confirm
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default RmuDialog;
