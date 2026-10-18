import React, { KeyboardEvent, ReactNode, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Drawer, IconButton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';

export type SidePanelMode = 'docked' | 'drawer' | 'fullscreen';

/** How the panel shows at the current width: docked from `lg`, a drawer at `md`, full screen below. */
export const useSidePanelMode = (): SidePanelMode => {
  const theme = useTheme();
  const isLarge = useMediaQuery(theme.breakpoints.up('lg'));
  const isMedium = useMediaQuery(theme.breakpoints.up('md'));
  if (isLarge) return 'docked';
  return isMedium ? 'drawer' : 'fullscreen';
};

const PanelHeader = ({ title, mode, onClose }: { title?: ReactNode; mode: SidePanelMode; onClose: () => void }) => {
  const { t } = useTranslation();
  return (
    <Stack
      direction="row"
      sx={{ alignItems: 'center', gap: 1, px: 1.5, py: 1, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
    >
      {mode === 'fullscreen' && (
        <IconButton aria-label={t('back')} onClick={onClose}>
          <ArrowBackIcon />
        </IconButton>
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {typeof title === 'string' ? (
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
            {title}
          </Typography>
        ) : (
          title
        )}
      </Box>
      {mode !== 'fullscreen' && (
        <IconButton aria-label={t('close')} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      )}
    </Stack>
  );
};

/**
 * A work area with a side panel that keeps it in sight: the panel is docked on the right from `lg` (the
 * content shrinks), a drawer over the content at `md`, and a full-screen sheet with a back arrow below.
 * Esc closes the panel in every mode.
 */
export default function SidePanelLayout({
  open,
  onClose,
  title,
  panel,
  width = 440,
  children,
}: {
  open: boolean;
  onClose: () => void;
  /** Header of the panel: a string, or a node for richer headers. */
  title?: ReactNode;
  panel: ReactNode;
  /** Width of the docked panel and the drawer, in px. */
  width?: number;
  children: ReactNode;
}) {
  const mode = useSidePanelMode();
  const asideRef = useRef<HTMLElement>(null);

  // A docked panel is not a modal: move the focus into it when it opens, so keyboard users land there.
  useEffect(() => {
    if (open && mode === 'docked') asideRef.current?.focus();
  }, [open, mode]);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
    }
  };

  const body = (
    <>
      <PanelHeader title={title} mode={mode} onClose={onClose} />
      <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', minHeight: 0 }}>{panel}</Box>
    </>
  );

  if (mode === 'docked') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: open ? 2 : 0 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
        <Box
          component="aside"
          ref={asideRef}
          tabIndex={-1}
          onKeyDown={onKeyDown}
          aria-hidden={!open}
          sx={(theme) => ({
            width: open ? width : 0,
            flexShrink: 0,
            overflow: 'hidden',
            position: 'sticky',
            top: 'calc(var(--rmu-app-bar-height, 0px) + 8px)',
            height: 'calc(100dvh - var(--rmu-app-bar-height, 0px) - 16px)',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
            border: open ? 1 : 0,
            borderColor: 'divider',
            borderRadius: `${theme.radius.md}px`,
            outline: 'none',
            transition: theme.transitions.create('width', {
              duration: theme.motion.duration.base,
              easing: theme.motion.easing.standard,
            }),
          })}
        >
          {open && body}
        </Box>
      </Box>
    );
  }

  return (
    <>
      {children}
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: { width: mode === 'drawer' ? width : '100%', display: 'flex', flexDirection: 'column' },
          },
        }}
      >
        {body}
      </Drawer>
    </>
  );
}
