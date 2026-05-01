import React from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Typography } from '@mui/material';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <Stack>
      <Typography variant="h6">{t('not-found')}</Typography>
      <Typography variant="body1">{t('requested-resource-not-found')}</Typography>
    </Stack>
  );
}
