import React, { createContext, FC, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertColor, Snackbar, SnackbarOrigin } from '@mui/material';
import { isApiError } from '../data/api-error';
import { bottomOffset, usePhone } from '../templates/responsive';

export interface Notify {
  /** Shows an error. An ApiError is shown as its translated messageKey plus the API detail. */
  error: (error: unknown) => void;
  success: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const NotificationContext = createContext<Notify | undefined>(undefined);

type Notification = { message: string; severity: AlertColor; key: number };

const durations: Record<AlertColor, number> = { error: 10000, warning: 8000, info: 4000, success: 4000 };

/**
 * Snackbar notifications for an MFE. Replaces the per-MFE ErrorContext. On phones they show at the bottom,
 * above the shell's bottom navigation, instead of over the header.
 */
export const NotificationProvider: FC<{ children: ReactNode; anchorOrigin?: SnackbarOrigin }> = ({
  children,
  anchorOrigin = { vertical: 'top', horizontal: 'right' },
}) => {
  const { t } = useTranslation();
  const isPhone = usePhone();
  const [notification, setNotification] = useState<Notification | null>(null);

  const show = useCallback(
    (message: string, severity: AlertColor) => setNotification({ message, severity, key: Date.now() }),
    []
  );

  const notify = useMemo<Notify>(
    () => ({
      error: (error) => {
        if (isApiError(error)) {
          const detail = error.detail;
          show(detail ? `${t(error.messageKey)}: ${detail}` : t(error.messageKey), 'error');
        } else if (error instanceof Error) {
          show(error.message, 'error');
        } else {
          show(String(error), 'error');
        }
      },
      success: (message) => show(message, 'success'),
      info: (message) => show(message, 'info'),
      warning: (message) => show(message, 'warning'),
    }),
    [show, t]
  );

  const handleClose = (_?: unknown, reason?: string) => {
    if (reason === 'clickaway') return;
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      <Snackbar
        key={notification?.key}
        open={!!notification}
        autoHideDuration={notification ? durations[notification.severity] : null}
        onClose={handleClose}
        anchorOrigin={isPhone ? { vertical: 'bottom', horizontal: 'center' } : anchorOrigin}
        sx={isPhone ? { bottom: bottomOffset(8) } : undefined}
      >
        <Alert severity={notification?.severity ?? 'info'} onClose={handleClose} variant="filled">
          {notification?.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotify = (): Notify => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotify must be used within a NotificationProvider (MfeRoot provides one)');
  return ctx;
};

/** Same contract as the MFEs' former ErrorContext, so pages can switch imports one at a time. */
export const useError = (): { showError: (message: string) => void } => {
  const notify = useNotify();
  return useMemo(() => ({ showError: (message: string) => notify.error(message) }), [notify]);
};
