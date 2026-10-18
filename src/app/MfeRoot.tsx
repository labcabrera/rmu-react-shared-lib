import React, { FC, ReactNode, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, SxProps, Theme } from '@mui/material';
import LoadingState from '../ui/states/LoadingState';
import { ErrorBoundary } from './ErrorBoundary';
import { NotificationProvider } from './NotificationProvider';

/**
 * Root of every domain MFE (the component its App.tsx exposes): notifications, an error boundary
 * that resets on navigation and a Suspense fallback. The theme comes from the shell's ThemeProvider.
 */
const MfeRoot: FC<{ children: ReactNode; sx?: SxProps<Theme> }> = ({ children, sx }) => {
  const location = useLocation();
  return (
    <NotificationProvider>
      <ErrorBoundary resetKey={location.pathname}>
        <Suspense fallback={<LoadingState />}>
          <Box sx={sx}>{children}</Box>
        </Suspense>
      </ErrorBoundary>
    </NotificationProvider>
  );
};

export default MfeRoot;
