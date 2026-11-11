import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@mui/icons-material/Close';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Box, Button, Drawer, IconButton, Stack, Typography } from '@mui/material';
import { usePhone } from '../templates/responsive';

/**
 * Side panel with the summary of a list item, so large catalogs can be browsed without leaving the
 * list. A bottom sheet on phones. "Open" goes to the full page.
 */
export default function PreviewDrawer({
  open,
  title,
  subtitle,
  onClose,
  onOpen,
  children,
}: {
  open: boolean;
  title?: ReactNode;
  subtitle?: ReactNode;
  onClose: () => void;
  /** Opens the full page of the item. */
  onOpen?: () => void;
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  const isPhone = usePhone();
  return (
    <Drawer
      anchor={isPhone ? 'bottom' : 'right'}
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: (theme) => ({
            width: isPhone ? '100%' : 400,
            maxHeight: isPhone ? '85dvh' : undefined,
            borderTopLeftRadius: isPhone ? theme.radius.lg : 0,
            borderTopRightRadius: isPhone ? theme.radius.lg : 0,
          }),
        },
      }}
    >
      <Stack sx={{ p: 2.5, gap: 2 }}>
        <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {subtitle && (
              <Typography variant="overline" color="text.secondary" component="div">
                {subtitle}
              </Typography>
            )}
            <Typography variant="h5" component="h2">
              {title}
            </Typography>
          </Box>
          <IconButton aria-label={t('close')} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
        {children}
        {onOpen && (
          <Button variant="contained" startIcon={<OpenInFullIcon />} onClick={onOpen} sx={{ alignSelf: 'flex-start' }}>
            {t('open')}
          </Button>
        )}
      </Stack>
    </Drawer>
  );
}
