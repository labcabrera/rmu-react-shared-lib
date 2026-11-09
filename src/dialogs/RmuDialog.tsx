import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@mui/icons-material/Close';
import {
  alpha,
  Box,
  Button,
  DialogActions,
  IconButton,
  Slide,
  Stack,
  SxProps,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Dialog, DialogProps } from '@mui/material';
import { DialogContent } from '@mui/material';
import { DialogTitle, dialogTitleClasses } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import EntityImage from '../avatars/EntityImage';

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
  /** A text, or a node (for example the type of an action next to a status badge). */
  subtitle?: ReactNode;
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
  /** Closes on Escape and on a click outside without adding a Close button (when `onClose` is not set). */
  onDismiss?: () => void;
  onResolve?: () => void;
  onConfirm?: () => void;
  /** A close button (✕) in the title, which calls `onClose` or `onDismiss`. */
  closeIcon?: boolean;
  /** No action bar at the bottom: for a dialog whose content has its own footer. */
  hideActions?: boolean;
  /** No padding around the content: for a content that lays out its own edges (a flow with a sticky step bar). */
  disableContentPadding?: boolean;
}> = ({
  title,
  subtitle,
  children,
  fullScreen,
  maxWidth = 'xl',
  avatarImg,
  paperSx,
  open,
  onConfirmDisabled = false,
  buttons,
  onDelete,
  onCancel,
  onClose,
  onDismiss,
  onResolve,
  onConfirm,
  closeIcon = false,
  hideActions = false,
  disableContentPadding = false,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  // Full screen on phones unless the caller decides.
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const paperBaseSx: SxProps<Theme> = {
    backgroundColor: 'background.paper',
    backgroundImage: (theme) =>
      theme.palette.mode === 'dark'
        ? `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.light} 52%, ${theme.palette.background.paper} 100%)`
        : undefined,
    border: (theme) =>
      theme.palette.mode === 'dark' ? `1px solid ${alpha(theme.palette.primary.light, 0.18)}` : undefined,
    boxShadow: (theme) =>
      theme.palette.mode === 'dark' ? `0 24px 80px ${alpha(theme.palette.common.black, 0.62)}` : undefined,
  };

  return (
    <Dialog
      open={open}
      onClose={onClose ?? onDismiss}
      fullScreen={fullScreen ?? isPhone}
      maxWidth={maxWidth}
      fullWidth
      slots={{ transition: Transition }}
      slotProps={{ paper: { sx: (paperSx ? [paperBaseSx, paperSx] : paperBaseSx) as SxProps<Theme> } }}
    >
      <DialogTitle
        sx={{
          px: 3,
          py: 2,
          backgroundColor: 'background.light',
          backgroundImage: (theme) =>
            theme.palette.mode === 'dark'
              ? `linear-gradient(90deg, ${theme.palette.background.light} 0%, ${alpha(theme.palette.primary.dark, 0.2)} 52%, ${theme.palette.background.paper} 100%)`
              : undefined,
          borderBottom: (theme) =>
            `1px solid ${theme.palette.mode === 'dark' ? alpha(theme.palette.primary.light, 0.22) : theme.palette.divider}`,
          boxShadow: (theme) =>
            theme.palette.mode === 'dark' ? `inset 0 -1px 0 ${alpha(theme.palette.common.black, 0.38)}` : undefined,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {avatarImg && <EntityImage image={avatarImg} size="sm" />}
          <Stack direction="column" sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="subtitle1" color="secondary" component="div" sx={{ fontWeight: 600 }}>
                {subtitle}
              </Typography>
            )}
          </Stack>
          {closeIcon && (onClose ?? onDismiss) && (
            <Box sx={{ alignSelf: 'flex-start' }}>
              <IconButton aria-label={t('close')} onClick={() => (onClose ?? onDismiss)?.()} edge="end">
                <CloseIcon />
              </IconButton>
            </Box>
          )}
        </Stack>
      </DialogTitle>
      <DialogContent
        sx={{
          px: disableContentPadding ? 0 : 3,
          py: disableContentPadding ? 0 : 2.5,
          // MUI drops the top padding of a content that follows a title, with a more specific rule than sx.
          [`.${dialogTitleClasses.root} + &`]: { pt: disableContentPadding ? 0 : 2.5 },
          backgroundColor: 'background.paper',
          backgroundImage: (theme) =>
            theme.palette.mode === 'dark'
              ? `linear-gradient(180deg, ${alpha(theme.palette.common.white, 0.018)} 0%, transparent 36%)`
              : undefined,
          color: 'text.primary',
        }}
      >
        {children}
      </DialogContent>
      {!hideActions && (
        <DialogActions
          sx={{
            px: 3,
            py: 1.5,
            backgroundColor: 'background.paper',
            borderTop: (theme) =>
              `1px solid ${theme.palette.mode === 'dark' ? alpha(theme.palette.primary.light, 0.16) : theme.palette.divider}`,
          }}
        >
          {buttons}
          {onDelete && (
            <Button onClick={() => onDelete()} color="error">
              {t('delete')}
            </Button>
          )}
          {onClose && <Button onClick={() => onClose()}>{t('close')}</Button>}
          {onCancel && <Button onClick={() => onCancel()}>{t('cancel')}</Button>}
          {onResolve && <Button onClick={() => onResolve()}>{t('resolve')}</Button>}
          {onConfirm && (
            <Button disabled={onConfirmDisabled} onClick={() => onConfirm()}>
              {t('confirm')}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default RmuDialog;
