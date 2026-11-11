import React, { FC, ReactNode, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Box, SxProps, Theme } from '@mui/material';
import LoadingState from '../ui/states/LoadingState';
import { ErrorBoundary } from './ErrorBoundary';
import { NotificationProvider } from './NotificationProvider';

/** Renders its children once the namespace is loaded; until then it suspends, and MfeRoot shows the fallback. */
const WithNamespace: FC<{ namespace: string; children: ReactNode }> = ({ namespace, children }) => {
  useTranslation(namespace);
  return <>{children}</>;
};

/**
 * Root of every domain MFE (the component its App.tsx exposes): notifications, an error boundary
 * that resets on navigation and a Suspense fallback. The theme comes from the shell's ThemeProvider.
 * `namespace` (workspace spec 086) is the MFE's own locale namespace: the keys only it uses. It loads before the MFE
 * renders, and the shell finds its keys through `fallbackNS`, so the MFE calls t() as usual.
 */
const MfeRoot: FC<{ children: ReactNode; sx?: SxProps<Theme>; namespace?: string }> = ({ children, sx, namespace }) => {
  const location = useLocation();
  return (
    <NotificationProvider>
      <ErrorBoundary resetKey={location.pathname}>
        <Suspense fallback={<LoadingState />}>
          <Box sx={sx}>{namespace ? <WithNamespace namespace={namespace}>{children}</WithNamespace> : children}</Box>
        </Suspense>
      </ErrorBoundary>
    </NotificationProvider>
  );
};

export default MfeRoot;
